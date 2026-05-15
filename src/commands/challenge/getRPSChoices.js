import { rpsChoices } from './rpsChoices.js';

/**
 * @memberof module:challengeCommand
 * @function getRPSChoices
 * @description Retrieves the available choices for rock-paper-scissors gameplay.
 * @returns {string[]} An array of strings representing the valid choices (e.g., "rock", "paper", "scissors").
 */
export function getRPSChoices() {
  return Object.keys(rpsChoices);
}