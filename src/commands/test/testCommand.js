import {
    InteractionResponseType,
    InteractionResponseFlags,
    MessageComponentTypes,
} from 'discord-interactions';
import { getRandomEmoji } from '../../utils/getRandomEmoji.js';

/**
 * @memberof module:testCommand
 * @function testCommand
 * @description A simple test command that responds with a greeting and a random emoji.
 * @param {Object} res - The response object for sending interaction responses.
 */
export function testCommand(res) {
    // Send a message into the channel where command was triggered from
    return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            flags: InteractionResponseFlags.IS_COMPONENTS_V2,
            components: [
                {
                    type: MessageComponentTypes.TEXT_DISPLAY,
                    // Fetches a random emoji to send from a helper function
                    content: `hello world ${getRandomEmoji()}`
                }
            ]
        },
    });
}