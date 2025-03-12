const { SlashCommandBuilder, messageLink, EmbedBuilder, channelLink, User, time, ChatInputCommandInteraction } = require("discord.js");
const Language = require("../../classes/Language");
const Katheryne = require("../../classes/Katheryne");
const WhitelistedApps = require("../../classes/WhitelistedApps").WhitelistedAppManager;
const BeforeStartHook = require("../../hooks/BeforeStart");
const Computer = require("../../classes/Computer");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("start")
    .setDescription(Language.strings.start.description)
    .addStringOption(option => option
        .setName("alias")
        .setDescription(Language.strings.start.alias)
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
        const alias = interaction.options.getString("alias");
        await interaction.deferReply();
        if (!alias) {
            var apps = WhitelistedApps.toJSON().map(app => {
                return `* \`${app.alias}\` - **${app.name}**`;
            });
            return interaction.editReply({embeds: [
                Katheryne.embed(client)
                .setTitle(Language.strings.start.embedTitle)
                .setDescription(Language.strings.start.embedDescription.format(apps.join("\n"), client.config.prefix))
            ]});
        }
        if (Steam.isRunning() || (await WhitelistedApps.running()).length) return interaction.editReply({content: Language.strings.logs.alreadyRunning});
        var app = WhitelistedApps.get(alias);
        if (!app) return interaction.editReply({content: Language.strings.start.appNotFound.format(alias)});
        await interaction.editReply({content: Language.strings.logs.preparing});
        try {
            await BeforeStartHook(interaction, client, app);
            await Katheryne.addLog(interaction, Language.strings.logs.startingApp.format(app.name));
            Computer.exec(app.command);
        }
        catch (err) {
            console.error(err);
            Katheryne.addLog(interaction, err.stack);
        }
    }
}