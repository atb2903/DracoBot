import 'dotenv/config';
import {
    InteractionResponseType,
    InteractionResponseFlags,
    MessageComponentTypes,
} from 'discord-interactions';
import {getShuffledRPSOptions} from './getShuffledRPSOptions.js';
import { discordRequest } from '../../utils/discordRequest.js';

/**
 * This function handles the accept button interaction for the rock-paper-scissors game.
 * @memberof module:challengeCommand
 * @param {Object} req - The request object from the interaction
 * @param {Object} res - The response object to send the interaction response
 * @param {string} componentId - The ID of the component that triggered the interaction
 */
export async function acceptButton(req, res, componentId) {
    // get the associated game ID
    const gameId = componentId.replace('accept_button_', '');
    // Delete message with token in request body
    const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;
    try {
        await res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                // Indicates it'll be an ephemeral message
                flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
                components: [
                    {
                        type: MessageComponentTypes.TEXT_DISPLAY,
                        content: 'What is your object of choice?',
                    },
                    {
                        type: MessageComponentTypes.ACTION_ROW,
                        components: [
                            {
                                type: MessageComponentTypes.STRING_SELECT,
                                // append game ID
                                custom_id: `select_choice_${gameId}`, 
                                options: getShuffledRPSOptions(),                               
                            },
                        ],
                    },
                ],
            },
        });
        // Delete previous message
        await discordRequest(endpoint, { method: 'DELETE' });
    } catch (err) {
        console.error('Error sending message:', err);
    }
}