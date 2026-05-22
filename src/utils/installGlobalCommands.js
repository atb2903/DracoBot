import { discordRequest } from './discordRequest.js';

/**
 * @memberof module:utils
 * @function installGlobalCommands
 * @description Installs or updates global application commands for a Discord bot using the Discord API.
 * @param {string} appId - The application ID of the Discord bot.
 * @param {Array} commands - An array of command objects to be registered as global commands.
 */
export async function installGlobalCommands(appId, commands) {
  // API endpoint to overwrite global commands
  const endpoint = `applications/${appId}/commands`;

  try {
    // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
    await discordRequest(endpoint, { method: 'PUT', body: commands });
  } catch (err) {
    console.error(err);
  }
}