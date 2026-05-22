import { jest } from '@jest/globals';
import { getRandomEmoji } from '../../src/utils/getRandomEmoji.js';

afterEach(() => {
  jest.restoreAllMocks();
});

test('getRandomEmoji returns the first emoji when Math.random returns 0', () => {
  jest.spyOn(Math, 'random').mockReturnValue(0);
  expect(getRandomEmoji()).toBe('😭');
});

test('getRandomEmoji returns the last emoji when Math.random returns just under 1', () => {
  jest.spyOn(Math, 'random').mockReturnValue(0.9999999);
  expect(getRandomEmoji()).toBe('✨');
});

test('getRandomEmoji maps Math.random=0.5 to index 7', () => {
  jest.spyOn(Math, 'random').mockReturnValue(0.5);
  expect(getRandomEmoji()).toBe('😶‍🌫️');
});

test('getRandomEmoji uses Math.floor truncation, not rounding', () => {
  jest.spyOn(Math, 'random').mockReturnValue(0.05);
  expect(getRandomEmoji()).toBe('😭');
});

test('getRandomEmoji returns a fresh emoji on each call', () => {
  jest.spyOn(Math, 'random')
    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0.9999999);

  expect(getRandomEmoji()).toBe('😭');
  expect(getRandomEmoji()).toBe('✨');
});

test('getRandomEmoji always returns an emoji from the predefined list', () => {
  const knownEmojis = new Set([
    '😭','😄','😌','🤓','😎','😤','🤖','😶‍🌫️','🌏','📸','💿','👋','🌊','✨',
  ]);
  for (let i = 0; i < 200; i++) {
    expect(knownEmojis.has(getRandomEmoji())).toBe(true);
  }
});
