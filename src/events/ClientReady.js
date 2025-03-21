const { REST, Routes, Client, ActivityType } = require('discord.js');
const Computer = require('../classes/Computer');
const ScreenshotMonitor = require('../classes/ScreenshotMonitor');
const WhitelistedApps = require("../classes/WhitelistedApps").WhitelistedAppManager;
const Steam = require("../classes/Steam");
const SessionManager = require('../classes/SessionManager');
const Logging = require('../hooks/Logging');
const Language = require('../classes/Language');

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
        if (!Steam.isRunning() && SessionManager.get("currentUser")) SessionManager.delete("currentUser");
    }
}

/**
 * 
 * @param {Client} client 
 */
module.exports = async (client) => {
    console.log(`BOT started as ${client.user.tag}`);

    // Add slash commannds
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
    console.log(`${Computer.hostname} (${Computer.xdgSessionType}) integrated as user "${Computer.username}" (ID ${Computer.userId}), ${Computer.isRoot() ? "with" : "without"} root access.`);
    if (!Computer.isRoot()) console.warn("No root access provided for this process. Some features will not be able to run.");

    // Initialize whitelisted apps
    WhitelistedApps.add(client.config.whitelisted_apps);

    // Initialize session data
    SessionManager.initialize();

    // Set the client for the screenshot monitor
    ScreenshotMonitor.setClient(client);

    // Start monitoring screenshots when an application is running
    if (Steam.isRunning() || (await WhitelistedApps.running()).length) {
        ScreenshotMonitor.start(WhitelistedApps.toJSON());
    }

    // Start monitoring Steam connection
    Steam.on("connect", (data) => {
        SessionManager.set("logging.steam", true);
        logChannel.send({content: Language.strings.logs.steamConnected.format(Computer.hostname)});
    });
    Steam.on("disconnect", (data) => {
        SessionManager.set("logging.steam", false);
        logChannel.send({content: Language.strings.logs.steamDisconnected.format(Computer.hostname)});
    });
    if (!Steam.isRunning) SessionManager.set("logging.steam", false);
    else Steam.startMonitor();

    // Update BOT status
    updateStatus(client);
    setInterval(() => updateStatus(client), 10000);

    // Logging
    if (client.config.logging.log_channel) {
        var logChannel = client.logChannel = client.channels.cache.get(client.config.logging.log_channel);
        if (logChannel) setInterval(function() {
            Logging(client, logChannel);
        }, 10000);
    }
};