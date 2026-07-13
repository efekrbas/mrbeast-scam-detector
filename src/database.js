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
