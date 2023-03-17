import { ensureExists } from '../../test';

test('signUp succeeds', async () => {
  await ensureExists();
}, 100000);
// Because we wait for the validation to be clicked we need to increase the test timeout.
