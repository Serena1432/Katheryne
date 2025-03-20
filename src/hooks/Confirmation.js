/**
 * This is the hook script to require owner approval before doing a specific command.
 * Use "return true" to approve, "return false" to reject.
 * You can edit it freely as you want.
 */

const { BaseInteraction, Message, Client, User, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const Language = require("../classes/Language");
const Katheryne = require("../classes/Katheryne");

/**
 * 
 * @param {string} description The confirmation message
 * @param {Message|BaseInteraction} message Discord message or interaction
 * @param {Client} client Discord client object
 * @param {User} originalAuthor Original author object
 * @param {boolean} defaultValue Default return value if the owner is inactive
 */
module.exports = async function(description, message, client, originalAuthor, defaultValue = false) {
    try {
        Katheryne.editMessage(message, {
            embeds: [
                Katheryne.embed(client)
                .setDescription(description)
            ],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${originalAuthor.id}.approve.${message.id}`)
                    .setEmoji("✅")
                    .setLabel(Language.strings.yes)
                    .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                    .setCustomId(`${originalAuthor.id}.reject.${message.id}`)
                    .setEmoji("❎")
                    .setLabel(Language.strings.no)
                    .setStyle(ButtonStyle.Secondary)
                )
            ]
        });
        var result = await Katheryne.waitForEvent(`${message.id}.approve`);
        if (!result) return defaultValue;
        if (result.response == 1) return true;
        return false;
    }
    catch (err) {
        console.error(err);
        return defaultValue;
    }
}