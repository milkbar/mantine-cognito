import { config, ensureExists } from '../../test/utilities';
import { deleteUser } from './user';

// This may wait for verification, so give it a long timeout
beforeAll(async () => {
  await ensureExists();
}, 120000);

// If we delete the user we need to reverify the account, so only do this
// on demand.
test.skip('userDelete succeeds', async () => {
  const result = await deleteUser(config);
  expect(result).toBe('SUCCESS');
});
