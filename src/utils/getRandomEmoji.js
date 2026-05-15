/**
 * @memberof module:utils
 * @function getRandomEmoji
 * @description Returns a random emoji from a predefined list of emojis.
 * @returns {string} A random emoji.
 */
export function getRandomEmoji() {
  const emojiList = ['😭','😄','😌','🤓','😎','😤','🤖','😶‍🌫️','🌏','📸','💿','👋','🌊','✨'];
  return emojiList[Math.floor(Math.random() * emojiList.length)];
}