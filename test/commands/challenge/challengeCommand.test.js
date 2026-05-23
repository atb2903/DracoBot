import { jest } from '@jest/globals';
import {
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';

import { challengeCommand } from '../../../src/commands/challenge/challengeCommand.js';

const GAME_ID = 'GAME-ID-XYZ';

function makeReq({
  context = 0,
  memberUserId = '1111111111111111111',
  userUserId = '2222222222222222222',
  objectValue = 'rock',
  interactionId = '1234567890123456789',
  omitMember = false,
  omitUser = false,
  omitOptions = false,
} = {}) {
  const body = {
    id: interactionId,
    application_id: '9876543210987654321',
    type: 2, // APPLICATION_COMMAND
    data: {
      id: '5555555555555555555',
      name: 'challenge',
      type: 1, // CHAT_INPUT
      ...(omitOptions
        ? {}
        : { options: [{ name: 'object', type: 3, value: objectValue }] }),
    },
    channel_id: '3333333333333333333',
    token: 'aW50ZXJhY3Rpb25fdG9rZW5fZXhhbXBsZQ',
    version: 1,
    app_permissions: '274877906943',
    locale: 'en-US',
    entitlements: [],
    authorizing_integration_owners: { '0': '4444444444444444444' },
    context,
  };

  if (context === 0) {
    body.guild_id = '4444444444444444444';
    body.guild_locale = 'en-US';
    if (!omitMember) {
      body.member = {
        user: {
          id: memberUserId,
          username: 'example_user',
          global_name: 'Example User',
        },
        roles: [],
        permissions: '0',
        joined_at: '2023-01-01T00:00:00.000000+00:00',
      };
    }
    if (!omitUser) {
      body.user = null;
    }
  } else if (!omitUser) {
    body.user = {
      id: userUserId,
      username: 'dm_user',
      global_name: 'DM User',
    };
  }

  return { body };
}

function makeRes() {
  const res = { send: jest.fn() };
  res.send.mockReturnValue(res); // Express res.send is sync + chainable
  return res;
}

// --- Response envelope ---

test('challengeCommand replies with CHANNEL_MESSAGE_WITH_SOURCE', () => {
  const req = makeReq();
  const res = makeRes();
  const activeGames = {};
  challengeCommand(req, res, activeGames, GAME_ID);
  expect(res.send.mock.calls[0][0].type)
    .toBe(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE);
});

test('challengeCommand sets IS_COMPONENTS_V2 on data.flags', () => {
  const req = makeReq();
  const res = makeRes();
  const activeGames = {};
  challengeCommand(req, res, activeGames, GAME_ID);
  const flags = res.send.mock.calls[0][0].data.flags;
  expect(flags & InteractionResponseFlags.IS_COMPONENTS_V2).toBeTruthy();
});

test('challengeCommand calls res.send exactly once', () => {
  const req = makeReq();
  const res = makeRes();
  const activeGames = {};
  challengeCommand(req, res, activeGames, GAME_ID);
  expect(res.send).toHaveBeenCalledTimes(1);
});

test('challengeCommand returns whatever res.send returns', () => {
  const req = makeReq();
  const res = makeRes();
  const activeGames = {};
  const returned = challengeCommand(req, res, activeGames, GAME_ID);
  expect(returned).toBe(res);
});

// --- TEXT_DISPLAY (data.components[0]) ---

test('challengeCommand first component is a TEXT_DISPLAY', () => {
  const req = makeReq();
  const res = makeRes();
  const activeGames = {};
  challengeCommand(req, res, activeGames, GAME_ID);
  const first = res.send.mock.calls[0][0].data.components[0];
  expect(first.type).toBe(MessageComponentTypes.TEXT_DISPLAY);
});

test('challengeCommand TEXT_DISPLAY content interpolates the userId mention', () => {
  const req = makeReq({ memberUserId: '7777777777777777777' });
  const res = makeRes();
  const activeGames = {};
  challengeCommand(req, res, activeGames, GAME_ID);
  const first = res.send.mock.calls[0][0].data.components[0];
  expect(first.content)
    .toBe('Rock paper scissors challenge from <@7777777777777777777>');
});

// --- ACTION_ROW + Accept button (data.components[1]) ---

test('challengeCommand second component is an ACTION_ROW with exactly one child', () => {
  const req = makeReq();
  const res = makeRes();
  const activeGames = {};
  challengeCommand(req, res, activeGames, GAME_ID);
  const row = res.send.mock.calls[0][0].data.components[1];
  expect(row.type).toBe(MessageComponentTypes.ACTION_ROW);
  expect(row.components).toHaveLength(1);
});

test('challengeCommand inner component is a primary BUTTON labeled "Accept"', () => {
  const req = makeReq();
  const res = makeRes();
  const activeGames = {};
  challengeCommand(req, res, activeGames, GAME_ID);
  const button = res.send.mock.calls[0][0].data.components[1].components[0];
  expect(button.type).toBe(MessageComponentTypes.BUTTON);
  expect(button.style).toBe(ButtonStyleTypes.PRIMARY);
  expect(button.label).toBe('Accept');
});

test('challengeCommand button custom_id is accept_button_${req.body.id}', () => {
  const req = makeReq({ interactionId: 'INTERACTION-XYZ' });
  const res = makeRes();
  const activeGames = {};
  challengeCommand(req, res, activeGames, GAME_ID);
  const button = res.send.mock.calls[0][0].data.components[1].components[0];
  expect(button.custom_id).toBe('accept_button_INTERACTION-XYZ');
});

// --- Context branch (userId source) ---

test('challengeCommand reads userId from member.user.id when context === 0', () => {
  const req = makeReq({ context: 0, memberUserId: 'MEMBER-USER-ID' });
  const res = makeRes();
  const activeGames = {};
  challengeCommand(req, res, activeGames, GAME_ID);
  const content = res.send.mock.calls[0][0].data.components[0].content;
  expect(content).toBe('Rock paper scissors challenge from <@MEMBER-USER-ID>');
});

test('challengeCommand reads userId from user.id when context !== 0', () => {
  const req = makeReq({ context: 1, userUserId: 'DM-USER-ID' });
  const res = makeRes();
  const activeGames = {};
  challengeCommand(req, res, activeGames, GAME_ID);
  const content = res.send.mock.calls[0][0].data.components[0].content;
  expect(content).toBe('Rock paper scissors challenge from <@DM-USER-ID>');
});

// --- activeGames side effect ---

test('challengeCommand adds an entry keyed by the id argument', () => {
  const req = makeReq();
  const res = makeRes();
  const activeGames = {};
  challengeCommand(req, res, activeGames, GAME_ID);
  expect(activeGames[GAME_ID]).toBeDefined();
});

test('challengeCommand entry has shape { id: <userId>, objectName: <options[0].value> }', () => {
  const req = makeReq({ memberUserId: 'USER-A', objectValue: 'paper' });
  const res = makeRes();
  const activeGames = {};
  challengeCommand(req, res, activeGames, GAME_ID);
  expect(activeGames[GAME_ID]).toEqual({ id: 'USER-A', objectName: 'paper' });
});

test('challengeCommand overwrites any existing entry at the game-id key', () => {
  const req = makeReq({ memberUserId: 'USER-B', objectValue: 'scissors' });
  const res = makeRes();
  const activeGames = {
    [GAME_ID]: { id: 'PRE-EXISTING', objectName: 'preexisting' },
  };
  challengeCommand(req, res, activeGames, GAME_ID);
  expect(activeGames[GAME_ID]).toEqual({ id: 'USER-B', objectName: 'scissors' });
});

test('challengeCommand does not touch unrelated keys already in activeGames', () => {
  const req = makeReq();
  const res = makeRes();
  const activeGames = {
    'OTHER-GAME': { id: 'OTHER-USER', objectName: 'rock' },
  };
  challengeCommand(req, res, activeGames, GAME_ID);
  expect(activeGames['OTHER-GAME']).toEqual({ id: 'OTHER-USER', objectName: 'rock' });
});

// --- Defensive edge cases (pin current behavior — throw) ---

test('challengeCommand throws when data.options is absent', () => {
  const req = makeReq({ omitOptions: true });
  const activeGames = {};
  expect(() => challengeCommand(req, makeRes(), activeGames, GAME_ID)).toThrow();
});

test('challengeCommand throws when context === 0 and member is absent', () => {
  const req = makeReq({ context: 0, omitMember: true });
  const activeGames = {};
  expect(() => challengeCommand(req, makeRes(), activeGames, GAME_ID)).toThrow();
});

test('challengeCommand throws when context !== 0 and user is absent', () => {
  const req = makeReq({ context: 1, omitUser: true });
  const activeGames = {};
  expect(() => challengeCommand(req, makeRes(), activeGames, GAME_ID)).toThrow();
});
