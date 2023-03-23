import { useEffect, useState } from 'react';

import type { UserAttributes } from '../cognito';

import { LoginForm } from '../LoginForm';
import { ForgotPasswordForm } from '../ForgotPasswordForm';
import { RegisterForm } from '../RegisterForm';
import { PasswordResetForm } from '../PasswordResetForm';
import { PostForgotPasswordForm } from '../PostForgotPasswordForm';
import { PostRegister } from '../PostRegister';

export type LoginStage = 'login' | 'forgot' | 'reset' | 'register';
export type LoginLifecycle =
  | 'login'
  | 'forgot'
  | 'post-forgot'
  | 'reset'
  | 'register'
  | 'post-register';

export interface LoginProps {
  stage?: LoginStage;
  onLogin?: (attributes: UserAttributes) => void;
}

export const Login = ({ stage: stageProp = 'login', onLogin }: LoginProps) => {
  const [stage, setStage] = useState<LoginLifecycle>(stageProp);
  const [email, setEmail] = useState<string>();

  useEffect(() => {
    setStage(stageProp);
  }, [stageProp]);

  const onSetStage = (arg: LoginLifecycle) => {
    setStage(arg);
  };

  const onSetEmail = (arg: string) => {
    setEmail(arg);
  };

  switch (stage) {
    case 'login':
      return <LoginForm setStage={onSetStage} onLogin={onLogin} setEmail={onSetEmail} />;
    case 'register':
      return <RegisterForm email={email} setEmail={onSetEmail} setStage={onSetStage} />;
    case 'post-register':
      return <PostRegister setStage={onSetStage} />;
    case 'forgot':
      return <ForgotPasswordForm email={email} setEmail={onSetEmail} setStage={onSetStage} />;
    case 'post-forgot':
      return <PostForgotPasswordForm email={email} setStage={onSetStage} />;
    case 'reset':
      return <PasswordResetForm email={email} setStage={onSetStage} />;
  }
};
