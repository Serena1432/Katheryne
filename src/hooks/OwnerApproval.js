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
 * @param {Message|BaseInteraction} message Discord message or interaction
 * @param {Client} client Discord client object
 * @param {string} event Event type
 * @param {User} originalAuthor The original author object
 * @param {boolean} defaultValue Default return value if the owner is inactive
 */
module.exports = async function(message, client, event, originalAuthor, defaultValue = false) {
    var owner = message.guild.members.cache.find(member => member?.user?.id == client.config.owner_id);
    if (!owner?.presence || ["invisible", "offline"].includes(owner?.presence?.status)) return defaultValue;
    try {
        var ownerMsg = await owner.send({
            embeds: [
                Katheryne.embed(client)
                .setDescription(Language.strings.request.description.format(originalAuthor.toString(), Language.strings.request.events[event]))
            ],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${owner.user.id}.approve.${message.id}.1`)
                    .setEmoji("✅")
                    .setLabel(Language.strings.request.approveButton)
                    .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                    .setCustomId(`${owner.user.id}.reject.${message.id}.1`)
                    .setEmoji("❎")
                    .setLabel(Language.strings.request.rejectButton)
                    .setStyle(ButtonStyle.Secondary)
                )
            ]
        });
        await Katheryne.editMessage(message, {content: Language.strings.request.approving});
        var result = await Katheryne.waitForEvent(`${message.id}.approve`);
        if (!result) {
            ownerMsg.edit({content: Language.strings.request.timeout, components: [], embeds: []});
            return defaultValue;
        }
        if (result.response == 1) return true;
        return false;
    }
    catch (err) {
        console.error(err);
        return defaultValue;
    }
}