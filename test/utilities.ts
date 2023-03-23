import { error } from 'console';
import { signUp, login, deleteUser } from '../src/cognito';

if (
  !process.env.COGNITO_CLIENT_ID ||
  !process.env.COGNITO_USER_POOL_ID ||
  !process.env.USER_EMAIL ||
  !process.env.USER_PASSWORD
)
  throw new Error('Dotenv not configured. See the .env.example file for how to configure.');

export const config = {
  clientID: process.env.COGNITO_CLIENT_ID,
  userPoolID: process.env.COGNITO_USER_POOL_ID,
  identityPoolID: process.env.COGNITO_IDENTITY_POOL_ID,
};

export const user = {
  email: process.env.USER_EMAIL,
  password: process.env.USER_PASSWORD,
};

export const waitUntilValidated = async () => {
  const sleep = async (ms: number) => await new Promise((resolve) => setTimeout(resolve, ms));
  // Avoid using console.error because jest takes that over and we need this
  // to show up even if jest is silent or buffering output.
  error('========= New user is already created. Waiting for verification before continuing.');

  let valid = false;
  while (!valid) {
    await login(config, user.email, user.password)
      .then(() => (valid = true))
      .catch(() => (valid = false));
    if (valid) break;
    await sleep(1000);
  }
};

export const ensureExists = async () => {
  await login(config, user.email, user.password, false).catch(async (err: Error) => {
    if (err.name === 'UserNotConfirmedException') {
      await waitUntilValidated();
      return;
    }

    void signUp(config, user.email, user.password);
    await waitUntilValidated();
  });
};

export const ensureDoesNotExist = async () => {
  const cognitoUser = await login(config, user.email, user.password, false).catch(
    async (err: Error) => {
      if (err.name === 'UserNotConfirmedException') {
        await waitUntilValidated();
        await deleteUser(config);
      }
    }
  );

  if (cognitoUser) {
    await deleteUser(config);
  }
};
