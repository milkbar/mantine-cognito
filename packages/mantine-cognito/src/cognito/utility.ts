import { Sha256 } from '@aws-crypto/sha256-js';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { HttpRequest } from '@aws-sdk/protocol-http';
import { formatUrl } from '@aws-sdk/util-format-url';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';
import { CognitoUser, CognitoUserPool, CookieStorage } from 'amazon-cognito-identity-js';

export interface CognitoConfig {
  userPoolID: string;
  clientID: string;
  identityPoolID?: string;
}

export const getPool = (config: CognitoConfig, remember = true) => {
  return new CognitoUserPool({
    UserPoolId: config.userPoolID,
    ClientId: config.clientID,
    Storage: remember ? new CookieStorage({ domain: `.${window.location.hostname}` }) : window.sessionStorage,
  });
};

export const getUser = (config: CognitoConfig, email: string, remember = true) => {
  const pool = getPool(config, remember);
  const userData = {
    Username: email,
    Pool: pool,
    Storage: remember ? new CookieStorage({ domain: `.${window.location.hostname}` }) : window.sessionStorage,
  };
  const cognitoUser = new CognitoUser(userData);
  return cognitoUser;
};

export const getCurrentUser = (config: CognitoConfig) => {
  // Try pulling from session storage first
  const sessionUser = getPool(config, false).getCurrentUser();
  if (sessionUser != null) return sessionUser;

  return getPool(config, true).getCurrentUser();
};

export type AuthenticatedCallCallback<Type> = (
  cognitoUser: CognitoUser,
  resolve: (value: Type | PromiseLike<Type>) => void,
  reject: (reason: Error | null) => void
) => void;

export const authenticatedCall = async <Type>(config: CognitoConfig, callback: AuthenticatedCallCallback<Type>) => {
  return await new Promise<Type>((resolve, reject) => {
    const cognitoUser = getCurrentUser(config);
    if (cognitoUser == null) return reject(new Error('Unable to get current user.'));

    cognitoUser.getSession((err: Error | null) => {
      if (err != null) return reject(err);
      callback(cognitoUser, resolve, reject);
    });
  });
};

export const presign = async (config: CognitoConfig, url: string, service: string) => {
  return await authenticatedCall<string>(config, (cognitoUser, resolve, reject) => {
    if (config.identityPoolID === undefined) return reject(new Error('identityPoolID is required to presign.'));
    const session = cognitoUser.getSignInUserSession();
    if (session === null) return reject(new Error('Could not get user session.'));

    const providerName = `cognito-idp.us-west-2.amazonaws.com/${config.userPoolID}`;
    const credentials = fromCognitoIdentityPool({
      identityPoolId: config.identityPoolID,
      logins: {
        [providerName]: session.getIdToken().getJwtToken(),
      },
      clientConfig: { region: 'us-west-2' },
    });

    const signer = new SignatureV4({
      credentials: credentials,
      sha256: Sha256,
      service: service,
      region: 'us-west-2',
    });

    const parsedURL = new URL(url);
    const request = new HttpRequest({
      protocol: parsedURL.protocol,
      hostname: parsedURL.hostname,
      path: parsedURL.pathname,
      headers: {
        host: parsedURL.hostname,
      },
    });

    signer
      .presign(request)
      .then((presigned) => {
        resolve(formatUrl(presigned));
      })
      .catch((reason) => {
        reject(new Error(reason));
      });
  });
};
