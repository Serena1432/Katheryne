/**
 * @typedef WhitelistedAppInfo
 * @property {string} process Process name (will be used to detect if the app is running or not)
 * @property {string} name Display name to be displayed in the BOT status and statistics
 * @property {string} alias Shortened alias for members to use with the start command
 * @property {string} command Command to be executed after using the start command
 * @property {string} screenshot In-game screenshot folder to be monitored
 * @property {string} channel Discord channel ID for in-game screenshots
 */

const Computer = require("./Computer");
const fs = require("fs");
const path = require("path");

class WhitelistedApp {
    /**
     * @param {WhitelistedAppInfo} data Whitelisted app config
     */
    constructor(data) {
        this.process = "";
        this.name = "";
        this.alias = "";
        this.command = "";
        this.screenshot = "";
        this.channel = "";
        this._oldScreenshots = [];
        var keys = Object.keys(data);
        for (var i = 0; i < keys.length; i++) this[keys[i]] = data[keys[i]];
        this.initializeScreenshots();
    }
    /**
     * Check whether this app is running or not.
     * @returns {boolean}
     */
    async isRunning() {
        return await Computer.isProcessRunning(this.process);
    }
    /**
     * Start this app.
     * @returns {Promise<any>}
     */
    start() {
        return Computer.exec(this.command);
    }
    /**
     * Force stop this app.
     * @returns {Promise<any>}
     */
    stop() {
        return Computer.killProcess(this.process);
    }
    /**
     * Initialize the screenshots array.
     */
    initializeScreenshots() {
        if (!fs.existsSync(this.screenshot)) return console.warn(`"${this.screenshot}" does not exist, ${this.name}'s screenshot folder will not be monitored`);
        this._oldScreenshots = fs.readdirSync(this.screenshot);
    }
    /**
     * Monitor the screenshots
     * @returns {string[]} List of the new screenshot files, with the full path.
     */
    monitorScreenshots() {
        var screenshotPath = this.screenshot;
        if (!fs.existsSync(screenshotPath)) return console.warn(`"${screenshotPath}" does not exist, ${this.name}'s screenshot folder will not be monitored`);
        var arr = fs.readdirSync(screenshotPath), oldScreenshots = this._oldScreenshots,
            newScreenshots = arr.filter(file => !oldScreenshots.includes(file));
        this._oldScreenshots = arr;
        return newScreenshots.map(file => path.join(screenshotPath, file));
    }
}

const WhitelistedAppManager = {
    apps: new Map(),
    /**
     * Add new whitelisted apps
     * @param {WhitelistedAppInfo[]} data Whitelisted apps data
     */
    add: function(data) {
        for (var i = 0; i < data.length; i++) {
            var app = new WhitelistedApp(data[i]);
            this.apps.set(data[i].alias, app);
            console.log(`Added ${app.name} to the whitelisted apps.`);
        }
    },
    /**
     * @param {string} alias 
     * @returns {WhitelistedApp?}
     */
    get: function(alias) {
        return this.apps.get(alias);
    },
    /**
     * Get running applications
     * @returns {Promise<WhitelistedApp[]>}
     */
    running: async function() {
        var runningApps = [], apps = Array.from(this.apps.values());
        for (var i = 0; i < apps.length; i++) {
            if (await apps[i].isRunning()) runningApps.push(apps[i]);
        }
        return runningApps;
    }
}

module.exports = WhitelistedAppManager;