/**
 * @memberof module:challengeCommand
 * @function formatRPSResult
 * @description Formats the result of a rock-paper-scissors game into a readable string.
 * @param {Object} result - The result object containing win, lose, and verb properties.
 * @returns {string} A formatted string describing the outcome of the game.
 */
export function formatRPSResult(result) {
  const { win, lose, verb } = result;
  return verb === 'tie'
    ? `<@${win.id}> and <@${lose.id}> draw with **${win.objectName}**`
    : `<@${win.id}>'s **${win.objectName}** ${verb} <@${lose.id}>'s **${lose.objectName}**`;
}