import { capitalize } from '../../utils/capitalize.js';
import { rpsChoices } from './rpsChoices.js';

// this is just to figure out winner + verb


export function getRPSChoices() {
  return Object.keys(rpsChoices);
}

// Function to fetch shuffled options for select menu
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
