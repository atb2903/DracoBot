import { getRPSChoices } from './getRPSChoices.js';
import { capitalize } from '../../utils/capitalize.js';

export function createRPSCommandChoices() {
    const choices = getRPSChoices();
    const commandChoices = [];

    for (let choice of choices) {
        commandChoices.push({
            name: capitalize(choice),
            value: choice.toLowerCase(),
        });
    }

    return commandChoices;
}