const SessionManager = require("./classes/SessionManager");
const WhitelistedApps = require("./classes/WhitelistedApps").WhitelistedAppManager;
const wlAppsConfig = require("../config/whitelisted_apps.json");

WhitelistedApps.add(wlAppsConfig, false);

async function main() {
    var user = SessionManager.get("steamUser");
    if (!user) return console.log(`No steamUser is active.`);
    console.log(`Saving ${user}'s local storage data...`);
    await WhitelistedApps.saveLocalStorage(steamUser);
    console.log(`Loading original local storage data...`);
    await WhitelistedApps.loadLocalStorage();
    console.log(`Clearing session data...`);
    SessionManager.delete("currentUser");
    SessionManager.delete("steamUser");
    console.log(`Process completed.`);
    process.exit(0);
}

main();