const Database = require('better-sqlite3');
const path = require('path');

// Initialize SQLite database
const db = new Database(path.join(__dirname, '..', 'settings.sqlite'));

// Create table if not exists
db.pragma('journal_mode = WAL');
db.prepare(`
    CREATE TABLE IF NOT EXISTS guild_settings (
        guild_id TEXT PRIMARY KEY,
        action TEXT DEFAULT 'delete'
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

module.exports = {
    getAction,
    setAction
};
