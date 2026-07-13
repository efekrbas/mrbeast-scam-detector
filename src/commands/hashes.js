const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getAllHashes, addHash, removeHash } = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hashes')
        .setDescription('Manage the perceptual hash database for scam detection.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a new scam image hash to the database')
                .addStringOption(option =>
                    option.setName('hash')
                        .setDescription('The 64-bit binary hash string')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a scam image hash from the database')
                .addStringOption(option =>
                    option.setName('hash')
                        .setDescription('The 64-bit binary hash string')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all saved scam hashes')),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'add') {
            const hash = interaction.options.getString('hash');
            addHash(hash);
            await interaction.reply({ content: `✅ Successfully added hash: \`${hash}\``, ephemeral: true });
        } 
        else if (subcommand === 'remove') {
            const hash = interaction.options.getString('hash');
            removeHash(hash);
            await interaction.reply({ content: `🗑️ Successfully removed hash: \`${hash}\``, ephemeral: true });
        } 
        else if (subcommand === 'list') {
            const hashes = getAllHashes();
            
            if (hashes.length === 0) {
                return interaction.reply({ content: 'The hash database is currently empty.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle('🛡️ Saved Scam Hashes')
                .setDescription('These image hashes are automatically detected and deleted.')
                .setColor('#2F3136')
                .addFields({ name: 'Hashes', value: hashes.map(h => `\`${h}\``).join('\n') || 'None' });

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
