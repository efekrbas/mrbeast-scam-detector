const { setAction } = require('../database');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
                }
            }
        } else if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'settings_select') {
                const selectedAction = interaction.values[0];
                const guildId = interaction.guildId;

                // Yetki kontrolü (Sadece yöneticiler ayar değiştirebilir)
                if (!interaction.member.permissions.has('Administrator')) {
                    return interaction.reply({ content: 'You must have Administrator permissions to change this setting.', ephemeral: true });
                }

                setAction(guildId, selectedAction);

                const actionNames = {
                    'delete': 'Delete Message Only',
                    'warn': 'Delete Message and Warn User',
                    'kick': 'Delete Message and Kick User',
                    'ban': 'Delete Message and Ban User'
                };

                await interaction.update({ 
                    content: `✅ Success! New setting saved: **${actionNames[selectedAction]}**`, 
                    embeds: [], 
                    components: [] 
                });
            }
        }
    },
};
