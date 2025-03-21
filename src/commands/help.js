const { Client, Message } = require("discord.js");
const Language = require("../classes/Language");
const Katheryne = require("../classes/Katheryne");

module.exports.config = {
    name: "help",
    usage: "help <command>",
    description: Language.strings.start.description,
    nodm: false,
    memberPermissions: [],
    botPermissions: [],
    ownerOnly: false
}

/**
 * 
 * @param {Client} client 
 * @param {Message} message 
 * @param {string[]} args 
 */
module.exports.run = async function(client, message, args) {
    var id = args[0],
        yes = Language.strings.yes, no = Language.strings.no, none = Language.strings.none;
    if (!id) {
        return message.reply({
            embeds: [
                Katheryne.embed(client)
                .setTitle(Language.strings.help.title)
                .setDescription(`${Language.strings.help.slogan}\n\n${Array.from(client.commands.values()).map(command => {
                    return `**${client.config.prefix}${command.config.usage}**\n${command.config.description}`
                }).join("\n\n")}`)
            ]
        });
    }
    var command = client.commands.get(id);
    if (!command) return message.reply({content: Language.strings.help.invalidCommand});
    message.reply({
        embeds: [
            Katheryne.embed(client)
            .setTitle(command.config.name)
            .setDescription(command.config.description)
            .setThumbnail(client.user.avatarURL({size: 256}))
            .addFields(
                {name: Language.strings.help.usage, value: command.config.usage, inline: false},
                {name: Language.strings.help.memberPermissions, value: command.config.memberPermissions.join(", ") || none, inline: false},
                {name: Language.strings.help.botPermissions, value: command.config.botPermissions.join(", ") || none, inline: false},
                {name: Language.strings.help.dm, value: (!command.config.noDM) ? yes : no, inline: false},
                {name: Language.strings.help.ownerOnly, value: (!command.config.ownerOnly) ? yes : no, inline: false}
            )
        ]
    })
}