import { config, user } from '../../test';
import { getPool, getUser } from './utility';

test('getPool returns a valid value', () => {
  const pool = getPool(config, true);
  expect(pool.getUserPoolId()).toBe(config.userPoolID);
});

test('getUser returns a valid value', () => {
  const cognitoUser = getUser(config, user.email);
  expect(cognitoUser.getUsername()).toBe(user.email);
});

test('getCurrentUser returns a valid value.', () => {});
test('authenticatedCall returns a valid value.', () => {});
test('presign returns a valid value.', () => {});
