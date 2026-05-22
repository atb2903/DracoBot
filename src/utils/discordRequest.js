import 'dotenv/config';

/**
 * @memberof module:utils
 * @function discordRequest
 * @description A helper function to make API requests to Discord's REST API.
 * @param {string} endpoint - The API endpoint to send the request to (e.g., 'channels/{channel.id}/messages').
 * @param {Object} options - The options for the fetch request, including method, body, etc.
 * @returns {Promise<Response>} The response from the Discord API.
 * @throws Will throw an error if the API response is not ok (status code not in the range 200-299).
 */
export async function discordRequest(endpoint, options) {
  // append endpoint to root API URL
  const url = 'https://discord.com/api/v10/' + endpoint;
  // Stringify payloads
  if (options.body) options.body = JSON.stringify(options.body);
  // Use fetch to make requests
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent': 'DiscordBot (https://github.com/atb2903/DracoBot)',
    },
    ...options
  });
  // throw API errors
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }
  // return original response
  return res;
}