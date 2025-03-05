const { REST, Routes, Client } = require('discord.js');
const Computer = require('../classes/Computer');

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
    
    // Initialize computer integrations
    Computer.initialize();
    console.log(`${Computer.hostname} (${Computer.xdgSessionType}) integrated as user "${Computer.user}", ${Computer.isRoot() ? "with" : "without"} root access.`);
    if (!Computer.isRoot()) console.warn("No root access provided for this process. Some features will not be able to run.");
};