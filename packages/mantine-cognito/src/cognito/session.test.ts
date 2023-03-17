import { login } from './session';
import { config, ensureExists, user } from '../../test';

// This may wait for verification, so give it a long timeout
beforeAll(async () => {
  await ensureExists();
}, 120000);

test('login fails with wrong password', async () => {
  await login(config, user.email, 'DO NOT WORK').catch((err: Error) => {
    expect(err.name).toBe('NotAuthorizedException');
  });
});

test('login succeeds', async () => {
  const result = await login(config, user.email, user.password);
  expect(result.isValid()).toBeTruthy();
});

// test('isSessionValid', async () => { fail('NYI'); });
// test('logout', async () => { fail('NYI'); });
