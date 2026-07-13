const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require('discord.js');
const { getAction } = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Configure the MrBeast scam detection settings.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        const currentAction = getAction(interaction.guildId);
        
        const actionNames = {
            'delete': 'Delete Message Only',
            'warn': 'Delete Message and Warn User',
            'kick': 'Delete Message and Kick User',
            'ban': 'Delete Message and Ban User'
        };

        const embed = new EmbedBuilder()
            .setTitle('🛡️ MrBeast Scam Protection Settings')
            .setDescription('Choose the punishment the bot should apply to users sharing fake "MrBeast Casino" links and images.')
            .setColor('#2F3136')
            .addFields(
                { name: 'Current Status', value: `Current setting: **${actionNames[currentAction]}**` }
            )
            .setFooter({ text: 'Please select an action from the menu below.' });

        const select = new StringSelectMenuBuilder()
            .setCustomId('settings_select')
            .setPlaceholder('Select the punishment to apply')
            .addOptions(
                {
                    label: 'Delete Only',
                    description: 'Instantly deletes the message, no further action.',
                    value: 'delete',
                    emoji: '🗑️',
                    default: currentAction === 'delete'
                },
                {
                    label: 'Delete & Warn',
                    description: 'Deletes the message and warns the user via DM.',
                    value: 'warn',
                    emoji: '⚠️',
                    default: currentAction === 'warn'
                },
                {
                    label: 'Delete & Kick',
                    description: 'Deletes the message and kicks the user from the server.',
                    value: 'kick',
                    emoji: '🥾',
                    default: currentAction === 'kick'
                },
                {
                    label: 'Delete & Ban',
                    description: 'Deletes the message and bans the user from the server.',
                    value: 'ban',
                    emoji: '🔨',
                    default: currentAction === 'ban'
                }
            );

        const row = new ActionRowBuilder()
            .addComponents(select);

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    },
};
