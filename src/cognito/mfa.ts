import type { CognitoUser } from 'amazon-cognito-identity-js';
import { authenticatedCall } from './utility';
import type { CognitoConfig } from './utility';

export const associateSoftwareToken = async (config: CognitoConfig) => {
  return await authenticatedCall<string>(config, (cognitoUser, resolve, reject) => {
    cognitoUser.associateSoftwareToken({
      associateSecretCode: (secretCode) => {
        resolve(secretCode);
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
};

export const verifySoftwareToken = async (
  config: CognitoConfig,
  code: string,
  deviceName: string
) => {
  return await authenticatedCall(config, (cognitoUser, resolve, reject) => {
    cognitoUser.verifySoftwareToken(code, deviceName, {
      onSuccess: () => {
        resolve(undefined);
      },
      onFailure: (err: Error) => {
        reject(err);
      },
    });
  });
};

export const enableMFA = async (config: CognitoConfig) => await setMFA(config, true);
export const disableMFA = async (config: CognitoConfig) => await setMFA(config, false);

export const setMFA = async (config: CognitoConfig, enabled: boolean) => {
  return await authenticatedCall<string | undefined>(config, (cognitoUser, resolve, reject) => {
    const totpMfaSettings = {
      PreferredMfa: enabled,
      Enabled: enabled,
    };

    cognitoUser.setUserMfaPreference(null, totpMfaSettings, (err, result) => {
      if (err != null) return reject(err);

      // Cached data is now invalidated and the typescript definitions do
      // not include the public method to clear them, cast to any to get
      // around that.
      type CognitoUserEnhanced = CognitoUser & { clearCachedUserData: () => void };
      const user = cognitoUser as CognitoUserEnhanced;
      user.clearCachedUserData();
      resolve(result);
    });
  });
};
