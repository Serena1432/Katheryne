const { WhitelistedApp } = require("./WhitelistedApps");

var ScreenshotMonitor = {
    /**
     * @type {WhitelistedApp[]}
     */
    _apps: [],
    _interval: null,
    _handlers: {},
    /**
     * Refresh the screenshot monitoring event.
     */
    refresh: function() {
        for (var i = 0; i < this._apps.length; i++) {
            var app = this._apps[i];
            if (app._noScreenshotFolder) continue;
            var newScreenshots = app.monitorScreenshots();
            if (newScreenshots?.length) this.emit("screenshot", newScreenshots);
        }
    },
    /**
     * Register the screenshot monitoring event.
     * @param {'screenshot'} handler - Event type
     * @param {(screenshots: string[]) => void} callback - Callback function
     */
    on: function(handler, callback) {
        this._handlers[handler] = callback;
    },
    /**
     * Trigger the monitoring event.
     * @param {'screenshot'} handler
     * @param {string[]} message
     */
    emit: function(handler, message) {
        if (this._handlers[handler]) this._handlers[handler](message);
    },
    /**
     * Start monitoring the screenshots.
     * @param {WhitelistedApp[]} apps List of whitelisted apps to scan
     */
    start: function(apps) {
        this._apps = apps;
        this._interval = setInterval((function() {
            this.refresh();
        }).bind(this), 10000);
        console.log(`Started monitoring screenshot folders for ${this._apps.length} applications.`);
    },
    /**
     * Stop monitoring the screenshots.
     */
    stop: function() {
        if (this._interval) clearInterval(interval);
        console.log(`Stopped monitoring screenshot folders for ${this._apps.length} applications.`);
    }
};

module.exports = ScreenshotMonitor;