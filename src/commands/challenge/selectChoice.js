import { getRPSResult } from './getRPSResult.js';
import 'dotenv/config';
import {
    InteractionResponseType,
    InteractionResponseFlags,
    MessageComponentTypes,
} from 'discord-interactions';
import { discordRequest } from '../../utils/discordRequest.js';
import { getRandomEmoji } from '../../utils/getRandomEmoji.js';

export async function selectChoice(req, res, componentId, activeGames) {
    // get the associated game ID
    const gameId = componentId.replace('select_choice_', '');
    
    if (activeGames[gameId]) {
        // Interaction context
        const context = req.body.context;
        // Get user ID and object choice for responding user
        // User ID is in user field for (G)DMs, and member for servers
        const userId = context === 0 ? req.body.member.user.id : req.body.user.id;
        const objectName = req.body.data.values[0];
        // Calculate result from helper function
        const resultStr = getRPSResult(activeGames[gameId], {
            id: userId,
            objectName,
        });

        // Remove game from storage
        delete activeGames[gameId];
        // Update message with token in request body
        const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;

        try {
            // Send results
            await res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                    components: [
                        {
                            type: MessageComponentTypes.TEXT_DISPLAY,
                            content: resultStr,
                        },
                    ],
                },
            });
            // Update ephemeral message
            await discordRequest(endpoint, {
                method: 'PATCH',
                body: {
                    components: [
                        {
                            type: MessageComponentTypes.TEXT_DISPLAY,
                            content: 'Nice choice! ' + getRandomEmoji(),
                        },
                    ],
                },
            });
        } catch (err) {
            console.error('Error sending message:', err);
        }
    }
}