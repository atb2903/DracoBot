import { jest } from '@jest/globals';
import { discordRequest } from '../../src/utils/discordRequest.js';

beforeEach(() => {
  jest.spyOn(global, 'fetch')
    .mockResolvedValue(new Response('{}', { status: 200 }));
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('discordRequest prepends the Discord v10 API base URL to the endpoint', async () => {
  await discordRequest('users/@me', { method: 'GET' });
  expect(fetch.mock.calls[0][0]).toBe('https://discord.com/api/v10/users/@me');
});

test('discordRequest JSON-stringifies an object body', async () => {
  await discordRequest('x', { method: 'POST', body: { a: 1 } });
  expect(fetch.mock.calls[0][1].body).toBe('{"a":1}');
});

test('discordRequest works when options has no body', async () => {
  await discordRequest('x', { method: 'GET' });
  expect(fetch.mock.calls[0][1].body).toBeUndefined();
});

test('discordRequest sets Authorization to "Bot <DISCORD_TOKEN>"', async () => {
  await discordRequest('x', { method: 'GET' });
  expect(fetch.mock.calls[0][1].headers.Authorization)
    .toBe(`Bot ${process.env.DISCORD_TOKEN}`);
});

test('discordRequest sets Content-Type to application/json; charset=UTF-8', async () => {
  await discordRequest('x', { method: 'GET' });
  expect(fetch.mock.calls[0][1].headers['Content-Type'])
    .toBe('application/json; charset=UTF-8');
});

test('discordRequest sets the DiscordBot User-Agent', async () => {
  await discordRequest('x', { method: 'GET' });
  expect(fetch.mock.calls[0][1].headers['User-Agent'])
    .toBe('DiscordBot (https://github.com/atb2903/DracoBot)');
});

test('discordRequest forwards options.method to fetch', async () => {
  await discordRequest('x', { method: 'PATCH' });
  expect(fetch.mock.calls[0][1].method).toBe('PATCH');
});

test('discordRequest forwards arbitrary options via spread', async () => {
  const signal = new AbortController().signal;
  await discordRequest('x', { method: 'GET', signal });
  expect(fetch.mock.calls[0][1].signal).toBe(signal);
});

test('discordRequest returns the raw Response on success', async () => {
  const mockResponse = new Response('{"ok":true}', { status: 200 });
  fetch.mockResolvedValueOnce(mockResponse);

  const result = await discordRequest('x', { method: 'GET' });

  expect(result).toBe(mockResponse);
});

test('discordRequest throws stringified body and logs status on 400', async () => {
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const body = { code: 50001, message: 'Missing Access' };
  fetch.mockResolvedValueOnce(new Response(JSON.stringify(body), { status: 400 }));

  await expect(discordRequest('x', { method: 'GET' }))
    .rejects.toThrow(JSON.stringify(body));
  expect(logSpy).toHaveBeenCalledWith(400);
});

test('discordRequest throws stringified body and logs status on 429', async () => {
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const body = {
    message: 'You are being rate limited.',
    retry_after: 64.57,
    global: false,
  };
  fetch.mockResolvedValueOnce(new Response(JSON.stringify(body), { status: 429 }));

  await expect(discordRequest('x', { method: 'GET' }))
    .rejects.toThrow(JSON.stringify(body));
  expect(logSpy).toHaveBeenCalledWith(429);
});

test('discordRequest throws stringified body and logs status on 500', async () => {
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  fetch.mockResolvedValueOnce(new Response('{}', { status: 500 }));

  await expect(discordRequest('x', { method: 'GET' }))
    .rejects.toThrow('{}');
  expect(logSpy).toHaveBeenCalledWith(500);
});
