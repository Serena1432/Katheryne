const DatabaseManager = require("./DatabaseManager");
const Katheryne = require("./Katheryne");

var SessionManager = {
    _cache: {},
    /**
     * Load the session data from database file.
     * @returns {object}
     */
    load: function() {
        try {
            Katheryne.debug(`SessionManager.load(): Loading from database`);
            return DatabaseManager.get("session");
        }
        catch (err) {
            console.error(err);
            return {};
        }
    },
    /**
     * Save the session data to database file.
     * @param {object} data Data object
     */
    save: function(data) {
        Katheryne.debug(`SessionManager.save(): Saving to database`);
        DatabaseManager.set("session", data);
    },
    /**
     * Get a property from session data.
     * @param {string} name Property name
     */
    get: function(name) {
        Katheryne.debug(`SessionManager.get(): ${name} = ${this._cache[name]}`);
        return this._cache[name];
    },
    /**
     * Set a property and save to session data.
     * @param {string} name Property name
     * @param {string} value Property value
     */
    set: function(name, value) {
        Katheryne.debug(`SessionManager.set(): ${name} = ${value}`);
        this._cache[name] = value;
        this.save(this._cache);
    },
    /**
     * Delete a property from session data.
     * @param {string} name Property name
     */
    delete: function(name) {
        Katheryne.debug(`SessionManager.delete(): Deleting ${name}`);
        delete(this._cache[name]);
        this.save(this._cache);
    },
    initialize: function() {
        this._cache = this.load();
    }
};

module.exports = SessionManager;