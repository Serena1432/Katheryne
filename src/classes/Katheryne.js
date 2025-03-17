const { Client, EmbedBuilder, Message, BaseInteraction, MessagePayload, User } = require("discord.js");

var Katheryne = {
    _logs: {},
    _events: {},
    /**
     * Create an embed based on the preset.
     * @param {Client} client Discord client
     */
    embed: function(client) {
        return new EmbedBuilder()
        .setAuthor({name: client.user.username, iconURL: client.user.avatarURL({size: 128})})
        .setColor("Random")
        .setTimestamp(new Date());
    },
    /**
     * Edit a message or interaction.
     * @param {Message|BaseInteraction} message Discord message or interaction object
     * @param {import("discord.js").MessageEditOptions} options Message edit options
     * @returns {Promise<Message>}
     */
    editMessage: function(message, options) {
        if (!options.content) options.content = "";
        if (!options.components) options.components = [];
        if (!options.embeds) options.embeds = [];
        if (this.isInteraction(message)) return message.editReply(options);
        else return message.edit(options);
    },
    /**
     * Add a new log to a message.
     * @param {Message|BaseInteraction} message Discord message or interaction object
     * @param {string} log The log info
     */
    addLog: async function(message, log) {
        if (!this._logs[message.id]) this._logs[message.id] = [];
        var logs = this._logs[message.id];
        if (logs.length >= 10) logs.splice(0, 1);
        logs.push(log);
        await this.editMessage(message, {content: `\`\`\`\n${logs.join("\n")}\n\`\`\``});
    },
    /**
     * Check if an object is an interaction.
     * @param {Message|BaseInteraction} message Message or interaction object
     */
    isInteraction: function(message) {
        return message?.constructor?.name?.toLowerCase()?.includes("interaction");
    },
    /**
     * Reply a message or interaction.
     * @param {Message|BaseInteraction} message Message or interaction object
     * @param {string|MessagePayload|import("discord.js").MessageReplyOptions} options Message reply options
     * @returns {Promise<Message>}
     */
    reply: async function(message, options) {
        if (!options.content) options.content = "";
        if (!options.components) options.components = [];
        if (!options.embeds) options.embeds = [];
        if (this.isInteraction(message)) return message.editReply(options);
        else return message.reply(options);
    },
    /**
     * Return the message/interaction author from an object
     * @param {Message|BaseInteraction} message Message or interaction object
     * @returns {User}
     */
    author: function(message) {
        return (this.isInteraction(message) ? message.user : message.author);
    },
    /**
     * Wait until a Katheryne event is triggered.
     * @param {string} name Event name
     * @param {number} timeout Wait timeout
     * @returns {any?} The event data when being triggered. Returns null if timeout.
     */
    waitForEvent: function(name, timeout = 30000) {
        return new Promise((resolve, reject) => {
            var startTime = new Date().getTime(),
                interval = setInterval(function() {
                if (new Date().getTime() - startTime >= timeout) {
                    clearInterval(interval);
                    resolve(null);
                    return;
                }
                var data = Katheryne._events[name];
                if (data) {
                    clearInterval(interval);
                    Katheryne.deleteEvent(name);
                    resolve(data);
                }
            }, 500);
        });
    },
    /**
     * Send data to a Katheryne event. Will trigger the waitForEvent commands using the same name.
     * @param {string} name Event name
     * @param {any} value Event data
     */
    sendEvent: function(name, value) {
        Katheryne._events[name] = value;
    },
    /**
     * Delete the data from a Katheryne event.
     * @param {string} name Event name
     */
    deleteEvent: function(name) {
        delete Katheryne._events[name];
    }
};

module.exports = Katheryne;