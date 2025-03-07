String.prototype.format = function() {
    var args = arguments;
    return this.replace(/%([0-9]+)/g, function(s, n) {
        return args[Number(n) - 1];
    });
};

require("dotenv").config();
const { Client, GatewayIntentBits, Events } = require("discord.js");
const client = new Client({intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages
]});
const fs = require("fs");
const path = require("path");
const InteractionManager = require("./classes/InteractionManager");
const CommandManager = require("./classes/CommandManager");
client.config = require("../config/main.json");
const Language = require("./classes/Language");
Language.setLanguage(client.config.language);

client.interactions = new InteractionManager("./src/interactions");
client.commandManager = new CommandManager("./src/commands");
client.commands = client.commandManager.commands;

fs.readdirSync(path.resolve("./config")).filter(f => (f.endsWith(".json") && f != "main.json")).forEach(config => {
    config = config.replaceAll(".json", "");
    client.config[config] = require(path.join(path.resolve("./config"), `${config}.json`));
});

fs.readdirSync(path.resolve("./src/events")).filter(f => f.endsWith(".js")).forEach(event => {
    try {
        var eventData = require(path.join(path.resolve("./src/events"), event));
        if (!eventData) console.error("Cannot load Event " + event + ": Event data not found");
        client.on(Events[event.substring(0, event.indexOf(".js"))], eventData.bind(null, client));
        console.log("Loaded Event " + event.substring(0, event.indexOf(".js")));
    }
    catch (err) {
        console.error("Cannot load Event " + event.substring(0, event.indexOf(".js")) + ":\n", err);
    }
})

client.login(process.env.TOKEN);

process.on('unhandledRejection', (reason, p) => {
    client.errors++;
    console.error(reason, 'Unhandled Rejection at Promise', p);
})
.on('uncaughtException', err => {
    client.errors++;
    console.error(err, 'Uncaught Exception thrown');
});