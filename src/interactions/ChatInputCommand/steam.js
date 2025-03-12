const { SlashCommandBuilder, messageLink, EmbedBuilder, channelLink, User, time, ChatInputCommandInteraction } = require("discord.js");
const Language = require("../../classes/Language");
const Katheryne = require("../../classes/Katheryne");
const Steam = require("../../classes/Steam");
const BeforeStartHook = require("../../hooks/BeforeStart");
const AfterEndHook = require("../../hooks/AfterEnd");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("steam")
    .setDescription(Language.strings.steam.description)
    .addStringOption(option => option
        .setName("user")
        .setDescription(Language.strings.steam.user)
    ),
    config: {
        nodm: true,
        memberPermissions: [],
        botPermissions: [],
        ownerOnly: false
    },
    /**
     * 
     * @param {Client} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @returns 
     */
    run: async (client, interaction) => {
        await interaction.deferReply();
        var user = interaction.options.getString("user");
        if (user == "exit") {
            await interaction.editReply({content: Language.strings.logs.preparing});
            try {
                await Katheryne.addLog(interaction, Language.strings.steam.stopping);
                Steam.stop();
                await AfterEndHook(interaction, client);
                await Katheryne.addLog(interaction, Language.strings.logs.stopSuccess);
            }
            catch (err) {
                console.error(err);
                Katheryne.addLog(interaction, err.stack);
            }
            return;
        }
        if (user && interaction.user.id != client.config.owner_id) return interaction.editReply({content: Language.steam.noSufficientPermission});
        await interaction.editReply({content: Language.strings.logs.preparing});
        try {
            await BeforeStartHook(interaction, client);
            await Katheryne.addLog(interaction, Language.strings.steam.starting);
            Steam.start(user);
            await Katheryne.addLog(interaction, Language.strings.logs.startSuccess);
        }
        catch (err) {
            console.error(err);
            Katheryne.addLog(interaction, err.stack);
        }
    }
}