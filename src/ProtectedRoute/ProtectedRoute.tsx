import type React from 'react';
import { useEffect, useState } from 'react';
import { Center, Loader } from '@mantine/core';

import { isSessionValid, getUserAttributes } from '../cognito';
import { useCognito } from '../CognitoProvider';
import type { UserAttributes } from '../cognito';

export interface ProtectedRouteProps {
  unauthenticated: React.ReactNode;
  onValidate?: (attributes: UserAttributes) => void;
  children?: React.ReactNode;
}

export const ProtectedRoute = ({ children, unauthenticated, onValidate }: ProtectedRouteProps) => {
  const { config } = useCognito();
  const [isValid, setIsValid] = useState<boolean | undefined>();

  const validHandler = () => {
    getUserAttributes(config)
      .then((attributes) => {
        onValidate?.(attributes);
      })
      .catch((reason: Error) => {
        console.error(reason.name, reason.message);
      });
  };

  // Start a timer to refresh the token and react to it becoming invalid
  useEffect(() => {
    const INTERVAL = 5 * 1000; // 5 seconds
    const interval = setInterval(() => {
      isSessionValid(config)
        .then((value) => {
          setIsValid(value);
          if (value) validHandler();
        })
        .catch((reason: Error) => {
          console.error(reason.name, reason.message);
        });
    }, INTERVAL);

    // Clear the timer on unmount
    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    isSessionValid(config)
      .then((value) => {
        setIsValid(value);
        if (value) validHandler();
      })
      .catch((reason: Error) => {
        console.error(reason.name, reason.message);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isValid === undefined) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  if (isValid) return <>{children}</>;

  return <>{unauthenticated}</>;
};
