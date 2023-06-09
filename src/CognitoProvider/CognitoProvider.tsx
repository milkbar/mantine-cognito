import { createContext, useContext } from 'react';

import { logout, presign } from '../cognito';
import type { CognitoConfig } from '../cognito/utility';

export interface CognitoContextType {
  config: CognitoConfig;
  logout: () => void;
  presign: (url: string, service: string) => Promise<string>;
}

const CognitoContext = createContext<CognitoContextType>({
  config: {
    clientID: '',
    userPoolID: '',
  },
  logout: () => {},
  presign: async () => {
    return '';
  },
});

export const useCognito = () => {
  return useContext(CognitoContext);
};

export interface CognitoProviderProps {
  cognitoUserPoolID: string;
  cognitoClientID: string;
  cognitoIdentityPoolID?: string;
  children?: React.ReactNode;
}

export const CognitoProvider = ({
  cognitoUserPoolID,
  cognitoClientID,
  cognitoIdentityPoolID,
  children,
}: CognitoProviderProps) => {
  const config: CognitoConfig = {
    userPoolID: cognitoUserPoolID,
    clientID: cognitoClientID,
    identityPoolID: cognitoIdentityPoolID,
  };
  const value: CognitoContextType = {
    config: config,
    logout: () => logout(config),
    presign: async (url, service) => await presign(config, url, service),
  };

  return <CognitoContext.Provider value={value}>{children}</CognitoContext.Provider>;
};
