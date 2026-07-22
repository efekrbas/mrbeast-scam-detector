# Discord Scam Detector (AI-Powered Anti-Scam Framework) 🛡️

A powerful, modular, and AI-driven Discord bot framework designed to detect and automatically delete sophisticated image-based scams (like fake giveaways, crypto scams, or the "MrBeast Casino / Vyro" scams). Scammers frequently bypass standard text filters by using manipulated images, collages, and blurry screenshots with fake promo codes. 

This bot uses a multi-layered Artificial Intelligence approach combining **Optical Character Recognition (OCR)** and **Perceptual Hashing (pHash)** to instantly catch and punish scammers.

## Core Technologies ✨
- **Perceptual Hashing (Computer Vision):** Uses `jimp` to generate a 64-bit structural DNA of malicious images. Even if scammers crop, darken, or add emojis to the scam image, the bot uses a *Hamming Distance* algorithm to detect the match and delete the message in milliseconds—without even needing OCR.
- **Machine Learning OCR:** Uses `tesseract.js` (LSTM Neural Networks) to read text embedded inside images that slip past the pHash filter. 
- **Image Enhancement:** Pre-processes dark and tilted images (scaling, grayscale, and contrast enhancement) to ensure accurate OCR reading.
- **Dynamic Database & Management:** Uses `better-sqlite3` to safely store server settings and malicious image hashes persistently.

## Commands ⚙️
- `/settings` - Opens an interactive menu for Server Administrators to choose the punishment (Delete only, Warn, Timeout (1H/1D/1W), Kick, or Ban).
- `/hashes add <hash>` - Teaches the bot a new malicious image layout by saving its 64-bit hash to the database.
- `/hashes remove <hash>` - Removes a hash from the database.
- `/hashes list` - Lists all currently blacklisted image hashes.

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

## Getting Image Hashes
When the bot is running, it automatically logs the 64-bit pHash of every uploaded image to the console:
```text
Image Hash: 1011001110001110...
```
Simply copy this hash from your terminal and use `/hashes add <hash>` in your Discord server to train the AI to automatically delete that specific image layout.
