const fs = require("fs");
const path = require("path");

class CommandManager {
    constructor(folder) {
        this.folder = path.resolve(folder);
        this.commands = new Map();
        fs.readdirSync(this.folder).filter(f => (f != "." && f != ".." && f.endsWith(".js"))).forEach(commandFile => {
            try {
                var command = require(path.join(this.folder, commandFile));
                if (!command || !command.run) return console.error("CommandManager: Error on Command " + commandFile.substring(0, commandFile.indexOf(".js")) + ": Command data not found\n");
                this.commands.set(commandFile.substring(0, commandFile.indexOf(".js")), command);
                console.log("Loaded Command " + commandFile.substring(0, commandFile.indexOf(".js")));
            }
            catch (err) {
                console.error("CommandManager: Error on Command " + commandFile.substring(0, commandFile.indexOf(".js")) + " - Cannot parse the command data\n", err);
            }
        });
    }
}

module.exports = CommandManager;