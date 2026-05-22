import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/utils/discordRequest.js', () => ({
  discordRequest: jest.fn(),
}));

const { installGlobalCommands } = await import('../../src/utils/installGlobalCommands.js');
const { discordRequest } = await import('../../src/utils/discordRequest.js');

beforeEach(() => {
  discordRequest.mockReset();
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('installGlobalCommands targets applications/<appId>/commands', async () => {
  await installGlobalCommands('123456789', []);
  expect(discordRequest.mock.calls[0][0]).toBe('applications/123456789/commands');
});

test('installGlobalCommands uses PUT (bulk overwrite)', async () => {
  await installGlobalCommands('123', []);
  expect(discordRequest.mock.calls[0][1].method).toBe('PUT');
});

test('installGlobalCommands passes the commands array as the body', async () => {
  const commands = [{ name: 'test', description: 'test command', type: 1 }];
  await installGlobalCommands('123', commands);
  expect(discordRequest.mock.calls[0][1].body).toBe(commands);
});

test('installGlobalCommands resolves to undefined on success', async () => {
  await expect(installGlobalCommands('123', [])).resolves.toBeUndefined();
});

test('installGlobalCommands logs the error via console.error on rejection', async () => {
  const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const err = new Error('boom');
  discordRequest.mockRejectedValueOnce(err);

  await installGlobalCommands('123', []);

  expect(errSpy).toHaveBeenCalledWith(err);
});

test('installGlobalCommands swallows discordRequest errors (does not re-throw)', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  discordRequest.mockRejectedValueOnce(new Error('boom'));

  await expect(installGlobalCommands('123', [])).resolves.toBeUndefined();
});
