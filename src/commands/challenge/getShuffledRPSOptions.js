import { capitalize } from '../../utils/capitalize.js';
import { rpsChoices } from './rpsChoices.js';
import { getRPSChoices } from './getRPSChoices.js';

/**
 * @memberof module:challengeCommand
 * @function getShuffledRPSOptions
 * @description Retrieves shuffled options for rock-paper-scissors gameplay.
 * @returns {Object[]} An array of objects representing the shuffled choices for a select menu.
 */
export function getShuffledRPSOptions() {
  const allChoices = getRPSChoices();
  const options = [];

  for (let c of allChoices) {
    // Formatted for select menus
    // https://discord.com/developers/docs/components/reference#string-select-select-option-structure
    options.push({
      label: capitalize(c),
      value: c.toLowerCase(),
      description: rpsChoices[c]['description'],
    });
  }

  return options.sort(() => Math.random() - 0.5);
}