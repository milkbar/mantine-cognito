import type { UserData } from 'amazon-cognito-identity-js';

import type { CognitoConfig } from './utility';
import { authenticatedCall } from './utility';

export type UserAttributes = Record<string, string>;

export const getUserData = async (config: CognitoConfig) => {
  return await authenticatedCall<UserData | undefined>(config, (cognitoUser, resolve, reject) => {
    cognitoUser.getUserData((err, data) => {
      if (err != null) return reject(err);
      resolve(data);
    });
  });
};

export const getUserAttributes = async (config: CognitoConfig) => {
  return await authenticatedCall<UserAttributes>(config, (cognitoUser, resolve, reject) => {
    cognitoUser.getUserAttributes((err, attributes) => {
      if (err != null) return reject(err);

      const arg: UserAttributes =
        attributes != null ? attributes.reduce((acc, cur) => ({ ...acc, [cur.getName()]: cur.getValue() }), {}) : {};
      resolve(arg);
    });
  });
};
