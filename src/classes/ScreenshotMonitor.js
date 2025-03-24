const { Client } = require("discord.js");
const { WhitelistedApp } = require("./WhitelistedApps");
const path = require("path");
const Language = require("./Language");
const Computer = require("./Computer");
const Katheryne = require("./Katheryne");

var ScreenshotMonitor = {
    /**
     * @type {WhitelistedApp[]}
     */
    _apps: [],
    /**
     * @type {NodeJS.Timeout}
     */
    _interval: null,
    /**
     * @type {Client}
     */
    _client: null,
    /**
     * Set the Discord client to send the screenshots.
     * @param {Client} client Discord client object
     */
    setClient: function(client) {
        this._client = client;
    },
    /**
     * Send images to a channel.
     * @param {string} channelId Discord channel ID
     * @param {string[]} images Array containing paths of all images you want to send.
     * @param {string} name The application name (for description)
     */
    sendImages: async function(channelId, images, name) {
        if (!this._client) throw new Error("No client specified");
        var client = this._client,
            channel = client.channels.cache.get(channelId);
        if (!channel) throw new Error(`Invalid channel ${channel}`);
        for (var i = 0; i < Math.ceil(images.length / 10); i++) {
            var files = images.slice(i * 10, Math.min((i + 1) * 10, images.length));
            console.log(`ScreenshotMonitor.sendImages(): Sending ${files.join(", ")} to channel ${channel.id}`);
            await channel.send({
                content: Language.strings.screenshots.new.format(name, Computer.hostname, new Date().toLocaleString()),
                files: files.map(filePath => {
                    return {
                        attachment: filePath,
                        name: `${path.basename(filePath)}.${path.extname(filePath)}`,
                        description: Language.strings.screenshots.description.format(name)
                    };
                })
            })
        }
    },
    /**
     * Refresh the screenshot monitoring event.
     */
    refresh: function() {
        Katheryne.debug(`ScreenshotMonitor.refresh(): Triggering monitor event`);
        for (var i = 0; i < this._apps.length; i++) {
            var app = this._apps[i];
            if (app._noScreenshotFolder || !app.isRunning()) continue;
            var newScreenshots = app.monitorScreenshots();
            if (newScreenshots?.length) this.sendImages(app.channel, newScreenshots, app.name);
        }
    },
    /**
     * Start monitoring the screenshots.
     * @param {WhitelistedApp[]} apps List of whitelisted apps to scan
     */
    start: function(apps) {
        this._apps = apps;
        if (!this._interval) this._interval = setInterval((function() {
            this.refresh();
        }).bind(this), 10000);
        console.log(`Started monitoring screenshot folders for ${this._apps.length} applications.`);
    },
    /**
     * Stop monitoring the screenshots.
     */
    stop: function() {
        if (this._interval) {
            clearInterval(this._interval);
            this._interval = null;
        }
        console.log(`Stopped monitoring screenshot folders for ${this._apps.length} applications.`);
    }
};

module.exports = ScreenshotMonitor;