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
            'timeout_1h': 'Delete Message and Timeout (1 Hour)',
            'timeout_1d': 'Delete Message and Timeout (1 Day)',
            'timeout_1w': 'Delete Message and Timeout (1 Week)',
            'kick': 'Delete Message and Kick User',
            'ban': 'Delete Message and Ban User'
        };

        const embed = new EmbedBuilder()
            .setTitle('🛡️ MrBeast Scam Protection Settings')
            .setDescription('Choose the punishment the bot should apply to users sharing fake "MrBeast Casino" links and images.')
            .setColor('#2F3136')
            .addFields(
                { name: 'Current Status', value: `Current setting: **${actionNames[currentAction] || 'Delete Message Only'}**` }
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
                    label: 'Delete & Timeout (1H)',
                    description: 'Deletes and timeouts the user for 1 Hour.',
                    value: 'timeout_1h',
                    emoji: '⏳',
                    default: currentAction === 'timeout_1h'
                },
                {
                    label: 'Delete & Timeout (1D)',
                    description: 'Deletes and timeouts the user for 1 Day.',
                    value: 'timeout_1d',
                    emoji: '⌛',
                    default: currentAction === 'timeout_1d'
                },
                {
                    label: 'Delete & Timeout (1W)',
                    description: 'Deletes and timeouts the user for 1 Week.',
                    value: 'timeout_1w',
                    emoji: '📅',
                    default: currentAction === 'timeout_1w'
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
