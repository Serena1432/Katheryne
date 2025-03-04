const { REST, Routes, Client } = require('discord.js');

/**
 * 
 * @param {Client} client 
 */
module.exports = async (client) => {
    console.log(`BOT started as ${client.user.tag}`);
    const commands = client.interactions.toJSON();
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    (async () => {
        try {
            console.log("Slash command refreshed.");
            await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        }
        catch (error) {
            console.error(error);
        }
    })();
};