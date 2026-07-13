# MrBeast Scam Detector Discord Bot 🛡️

A powerful and reliable Discord bot designed to detect and automatically delete "MrBeast Casino / Vyro" scam images and text messages. Scammers frequently use manipulated images with fake promo codes and casino links. This bot uses OCR (Optical Character Recognition) to read the text inside images and take action instantly.

## Features ✨
- **Image Scanning (OCR):** Uses `tesseract.js` to read text embedded inside images.
- **Image Enhancement:** Pre-processes dark and tilted images using `jimp` (scaling, grayscale, and contrast enhancement) to ensure accurate reading.
- **Text Scanning:** Also scans regular text messages for scam links and keywords.
- **Customizable Punishments:** An interactive `/settings` command for Server Administrators to choose the punishment (Delete only, Warn, Kick, or Ban).
- **Persistent Settings:** Uses `better-sqlite3` to safely store server settings.
- **Size Limit Protection:** Ignores images larger than 8MB to prevent resource exhaustion.

## Installation 🚀

1. Clone or download this repository.
2. Make sure you have [Node.js](https://nodejs.org/) installed.
3. Open your terminal in the project directory and run:
   ```bash
   npm install
   ```
4. Open `src/config.json` and insert your bot's **Token** and **Client ID**.
5. Enable **MESSAGE CONTENT INTENT** and **SERVER MEMBERS INTENT** for your bot on the [Discord Developer Portal](https://discord.com/developers/applications).
6. Start the bot:
   ```bash
   node .
   ```

## Setup & Usage ⚙️
- Invite the bot to your server with **Administrator** permissions (or at least `Manage Messages`, `Kick Members`, and `Ban Members`).
- Type `/settings` in your server to open the configuration menu and select what the bot should do when it catches a scammer.