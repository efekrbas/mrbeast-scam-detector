const Database = require('better-sqlite3');
const path = require('path');

// Initialize SQLite database
const db = new Database(path.join(__dirname, '..', 'settings.sqlite'));

// Create tables if not exists
db.pragma('journal_mode = WAL');
db.prepare(`
    CREATE TABLE IF NOT EXISTS guild_settings (
        guild_id TEXT PRIMARY KEY,
        action TEXT DEFAULT 'delete'
    )
`).run();

db.prepare(`
    CREATE TABLE IF NOT EXISTS scam_hashes (
        hash TEXT PRIMARY KEY
    )
`).run();

// Default baseline scam hashes (Included for GitHub users out-of-the-box)
const DEFAULT_HASHES = [
    '1110001111000111000011100100001000011000001110000011100100110001',
    '100011100010100101010000010101100101000110000101100010101010100', // 63 chars (padded automatically)
    '1001100001100110011001100001100101100011011001100011000110011001',
    '1101110110010100001001100110000000010000000000000010000000000000',
    '1011011101001000100100101001001001101001101101010100100010010011',
    '1100110110011000110000010010000000100010100000010001100011000010'
];

// Insert default hashes if they don't already exist
const insertHashStmt = db.prepare('INSERT OR IGNORE INTO scam_hashes (hash) VALUES (?)');
for (const hash of DEFAULT_HASHES) {
    insertHashStmt.run(hash);
}

// Prepared statements for quick access
const getSettingStmt = db.prepare('SELECT action FROM guild_settings WHERE guild_id = ?');
const setSettingStmt = db.prepare('INSERT OR REPLACE INTO guild_settings (guild_id, action) VALUES (?, ?)');

const getAction = (guildId) => {
    const row = getSettingStmt.get(guildId);
    return row ? row.action : 'delete';
};

const setAction = (guildId, action) => {
    setSettingStmt.run(guildId, action);
};

// Hash functions
const getAllHashes = () => {
    return db.prepare('SELECT hash FROM scam_hashes').all().map(row => row.hash);
};

const addHash = (hash) => {
    db.prepare('INSERT OR IGNORE INTO scam_hashes (hash) VALUES (?)').run(hash);
};

const removeHash = (hash) => {
    db.prepare('DELETE FROM scam_hashes WHERE hash = ?').run(hash);
};

module.exports = {
    getAction,
    setAction,
    getAllHashes,
    addHash,
    removeHash
};
