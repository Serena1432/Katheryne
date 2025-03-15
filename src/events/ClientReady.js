const { REST, Routes, Client, ActivityType } = require('discord.js');
const Computer = require('../classes/Computer');
const ScreenshotMonitor = require('../classes/ScreenshotMonitor');
const WhitelistedApps = require("../classes/WhitelistedApps").WhitelistedAppManager;
const Steam = require("../classes/Steam");

/**
 * 
 * @param {Client} client 
 */
async function updateStatus(client) {
    var runningApps = await WhitelistedApps.running();
    if (runningApps.length) {
        client.user.setPresence({activities: [{type: ActivityType.Playing, name: runningApps[0].name}], status: "dnd"});
    }
    else {
        client.user.setPresence({activities: [], status: "online"});
    }
}

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

    // Initialize whitelisted apps
    WhitelistedApps.add(client.config.whitelisted_apps);

    // Start monitoring screenshots when an application is running
    if (Steam.isRunning() || (await WhitelistedApps.running()).length) ScreenshotMonitor.start(WhitelistedApps.toJSON());

    // Update BOT status
    updateStatus(client);
    setInterval(() => updateStatus(client), 10000);
};