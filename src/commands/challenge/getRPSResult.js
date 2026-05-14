import { formatRPSResult } from './formatRPSResult.js';
import { rpsChoices } from './rpsChoices.js';

export function getRPSResult(p1, p2) {
  let gameResult;
  if (rpsChoices[p1.objectName] && rpsChoices[p1.objectName][p2.objectName]) {
    // o1 wins
    gameResult = {
      win: p1,
      lose: p2,
      verb: rpsChoices[p1.objectName][p2.objectName],
    };
  } else if (
    rpsChoices[p2.objectName] &&
    rpsChoices[p2.objectName][p1.objectName]
  ) {
    // o2 wins
    gameResult = {
      win: p2,
      lose: p1,
      verb: rpsChoices[p2.objectName][p1.objectName],
    };
  } else {
    // tie -- win/lose don't
    gameResult = { win: p1, lose: p2, verb: 'tie' };
  }

  return formatRPSResult(gameResult);
}