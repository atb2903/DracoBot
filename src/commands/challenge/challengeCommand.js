import {
    InteractionResponseType,
    InteractionResponseFlags,
    MessageComponentTypes,
    ButtonStyleTypes
} from 'discord-interactions';

export function challengeCommand(req, res, activeGames, id) {
    // Interaction context
    const context = req.body.context;
    // User ID is in the user field for (G)DMs, and member for servers
    const userId = context === 0 ? req.body.member.user.id : req.body.user.id;
    // User's object choice
    const objectName = req.body.data.options[0].value;

    // Create active game using message ID as the game ID
    activeGames[id] = {
        id: userId,
        objectName,
    };

    return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            flags: InteractionResponseFlags.IS_COMPONENTS_V2,
            components: [
                {
                    type: MessageComponentTypes.TEXT_DISPLAY,
                    content: `Rock paper scissors challenge from <@${userId}>`,
                },
                {
                    type: MessageComponentTypes.ACTION_ROW,
                    components: [
                        {
                            type: MessageComponentTypes.BUTTON,
                            custom_id: `accept_button_${req.body.id}`,
                            label: 'Accept',
                            style: ButtonStyleTypes.PRIMARY,
                        },
                    ],
                },
            ],
        },
    });
}