const fs = require("fs");
const path = require("path");

class InteractionManager {
    constructor(folder) {
        this.folder = path.resolve(folder);
        this.interactionTypes = [];
        fs.readdirSync(this.folder).filter(f => (fs.statSync(path.join(this.folder, f)).isDirectory() && f != "." && f != "..")).forEach(interactionType => {
            this.interactionTypes.push(this.interactionTypes);
            this[interactionType] = new Map();
            var map = this[interactionType];
            fs.readdirSync(path.join(this.folder, interactionType)).filter(f => (f.endsWith(".js") && f.toLowerCase() != "handler.js")).forEach(interaction => {
                try {
                    var interactionData = require(path.join(this.folder, interactionType, interaction));
                    if (!interactionData.run) return console.error("InteractionManager: Error on InteractionCommand " + interactionType + "/" + interaction.substring(0, interaction.indexOf(".js")) + ": Command data not found\n");
                    map.set(interaction.substring(0, interaction.indexOf(".js")), interactionData);
                    console.log("Loaded InteractionCommand " + interactionType + "/" + interaction.substring(0, interaction.indexOf(".js")));
                }
                catch (err) {
                    console.error("InteractionManager: Error on InteractionCommand " + interactionType + "/" + interaction.substring(0, interaction.indexOf(".js")) + " - Cannot parse the command data\n", err);
                }
            });
        });
    }
    toJSON() {
        var commandList = this["ChatInputCommand"];
        if (!commandList || !commandList.size) return [];
        var commands = [];
        commandList.forEach(command => {
            commands.push(command.data.toJSON());
        })
        return commands;
    }
}

module.exports = InteractionManager;