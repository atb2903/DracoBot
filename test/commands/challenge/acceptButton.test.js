import { jest } from '@jest/globals';
import {
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
} from 'discord-interactions';

jest.unstable_mockModule('../../../src/utils/discordRequest.js', () => ({
  discordRequest: jest.fn(),
}));

jest.unstable_mockModule('../../../src/commands/challenge/getShuffledRPSOptions.js', () => ({
  getShuffledRPSOptions: jest.fn(),
}));

const { acceptButton } = await import('../../../src/commands/challenge/acceptButton.js');
const { discordRequest } = await import('../../../src/utils/discordRequest.js');
const { getShuffledRPSOptions } = await import(
  '../../../src/commands/challenge/getShuffledRPSOptions.js'
);

// Shape matches what getShuffledRPSOptions() actually produces:
// { label: capitalize(c), value: c.toLowerCase(), description: rpsChoices[c].description }
// Two entries are enough to verify pass-through; referential equality is what the test asserts.
const SENTINEL_OPTIONS = [
  { label: 'Rock', value: 'rock', description: 'sedimentary, igneous, or perhaps even metamorphic' },
  { label: 'Paper', value: 'paper', description: 'versatile and iconic' },
];

function makeReq({
  componentId = 'accept_button_GAME-789',
  token = 'aW50ZXJhY3Rpb25fdG9rZW5fZXhhbXBsZQ',
  messageId = '7777777777777777777',
} = {}) {
  return {
    body: {
      id: '1234567890123456789',
      application_id: '9876543210987654321',
      type: 3, // MESSAGE_COMPONENT
      data: {
        custom_id: componentId,
        component_type: 2, // BUTTON
      },
      guild_id: '4444444444444444444',
      channel_id: '3333333333333333333',
      member: {
        user: {
          id: '1111111111111111111',
          username: 'example_user',
          global_name: 'Example User',
        },
        roles: [],
        permissions: '0',
        joined_at: '2023-01-01T00:00:00.000000+00:00',
      },
      user: null,
      token,
      version: 1,
      message: {
        id: messageId,
        channel_id: '3333333333333333333',
        author: {
          id: '9876543210987654321',
          username: 'DracoBot',
          global_name: null,
        },
        content: '',
        timestamp: '2023-01-01T12:00:00.000000+00:00',
        flags: 0,
        type: 0,
        components: [
          {
            type: 1, // ACTION_ROW
            components: [
              { type: 2, style: 1, label: 'Accept', custom_id: componentId },
            ],
          },
        ],
      },
      app_permissions: '274877906943',
      locale: 'en-US',
      guild_locale: 'en-US',
      entitlements: [],
      authorizing_integration_owners: { '0': '4444444444444444444' },
      context: 0,
    },
  };
}

function makeRes() {
  const res = { send: jest.fn() };
  res.send.mockReturnValue(res); // Express res.send is sync + chainable
  return res;
}

beforeEach(() => {
  discordRequest.mockReset();
  getShuffledRPSOptions.mockReset();
  getShuffledRPSOptions.mockReturnValue(SENTINEL_OPTIONS);
  process.env.APP_ID = 'test-app-id';
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('acceptButton appends gameId from componentId to the select menu custom_id', async () => {
  const req = makeReq({ componentId: 'accept_button_GAME-789' });
  const res = makeRes();
  await acceptButton(req, res, 'accept_button_GAME-789');
  const stringSelect = res.send.mock.calls[0][0].data.components[1].components[0];
  expect(stringSelect.custom_id).toBe('select_choice_GAME-789');
});

test('acceptButton replies with CHANNEL_MESSAGE_WITH_SOURCE', async () => {
  const req = makeReq();
  const res = makeRes();
  await acceptButton(req, res, 'accept_button_GAME-789');
  expect(res.send.mock.calls[0][0].type)
    .toBe(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE);
});

test('acceptButton sets both EPHEMERAL and IS_COMPONENTS_V2 flags', async () => {
  const req = makeReq();
  const res = makeRes();
  await acceptButton(req, res, 'accept_button_GAME-789');
  const flags = res.send.mock.calls[0][0].data.flags;
  expect(flags & InteractionResponseFlags.EPHEMERAL).toBeTruthy();
  expect(flags & InteractionResponseFlags.IS_COMPONENTS_V2).toBeTruthy();
});

test('acceptButton first component is a TEXT_DISPLAY with the choice prompt', async () => {
  const req = makeReq();
  const res = makeRes();
  await acceptButton(req, res, 'accept_button_GAME-789');
  const first = res.send.mock.calls[0][0].data.components[0];
  expect(first.type).toBe(MessageComponentTypes.TEXT_DISPLAY);
  expect(first.content).toBe('What is your object of choice?');
});

test('acceptButton second component is an ACTION_ROW with exactly one STRING_SELECT', async () => {
  const req = makeReq();
  const res = makeRes();
  await acceptButton(req, res, 'accept_button_GAME-789');
  const row = res.send.mock.calls[0][0].data.components[1];
  expect(row.type).toBe(MessageComponentTypes.ACTION_ROW);
  expect(row.components).toHaveLength(1);
  expect(row.components[0].type).toBe(MessageComponentTypes.STRING_SELECT);
});

test('acceptButton passes getShuffledRPSOptions() through to the STRING_SELECT options', async () => {
  const req = makeReq();
  const res = makeRes();
  await acceptButton(req, res, 'accept_button_GAME-789');
  const stringSelect = res.send.mock.calls[0][0].data.components[1].components[0];
  expect(stringSelect.options).toBe(SENTINEL_OPTIONS);
});

test('acceptButton deletes the original message via the webhook messages endpoint', async () => {
  const req = makeReq({ token: 'tok-123', messageId: 'msg-456' });
  const res = makeRes();
  await acceptButton(req, res, 'accept_button_GAME-789');
  expect(discordRequest.mock.calls[0][0])
    .toBe('webhooks/test-app-id/tok-123/messages/msg-456');
});

test('acceptButton uses DELETE for the cleanup request', async () => {
  const req = makeReq();
  const res = makeRes();
  await acceptButton(req, res, 'accept_button_GAME-789');
  expect(discordRequest.mock.calls[0][1]).toEqual({ method: 'DELETE' });
});

test('acceptButton awaits res.send before calling discordRequest', async () => {
  const req = makeReq();
  const res = makeRes();
  await acceptButton(req, res, 'accept_button_GAME-789');
  expect(res.send.mock.invocationCallOrder[0])
    .toBeLessThan(discordRequest.mock.invocationCallOrder[0]);
});

test('acceptButton swallows a sync res.send throw, logs it, and skips the delete', async () => {
  const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const req = makeReq();
  const res = makeRes();
  res.send.mockImplementation(() => { throw new Error('boom'); });

  await expect(acceptButton(req, res, 'accept_button_GAME-789'))
    .resolves.toBeUndefined();
  expect(errSpy).toHaveBeenCalled();
  expect(discordRequest).not.toHaveBeenCalled();
});

test('acceptButton swallows a discordRequest rejection and logs it', async () => {
  const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  discordRequest.mockRejectedValueOnce(new Error('boom'));
  const req = makeReq();
  const res = makeRes();

  await expect(acceptButton(req, res, 'accept_button_GAME-789'))
    .resolves.toBeUndefined();
  expect(errSpy).toHaveBeenCalled();
  expect(res.send).toHaveBeenCalledTimes(1);
});
