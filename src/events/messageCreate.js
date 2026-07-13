const { getAction } = require('../database');
const Tesseract = require('tesseract.js');

// Dolandırıcıların sık kullandığı kelimeler
const SUSPICIOUS_KEYWORDS = [
    'beastarcade',
    'crypto casino',
    'cryptocurrency casino',
    'casino',
    '3200',
    '3,200',
    '2500',
    '2,500',
    '2700',
    '3,450',
    'promo code',
    'promocode',
    'activate code',
    'vyro',
    'vyro.gg',
    'usdt',
    'usor',
    'withdraw',
    'withdrawal success',
    'specified wallet',
    'mrbeast'
];

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        // Botların kendi mesajlarını veya DM'leri yoksay
        if (message.author.bot || !message.guild) return;

        // Tarama ve silme/cezalandırma fonksiyonu
        const checkAndPunish = async (textToScan) => {
            if (!textToScan) return false;
            
            const lowerText = textToScan.toLowerCase();
            let matchCount = 0;
            for (const keyword of SUSPICIOUS_KEYWORDS) {
                if (lowerText.includes(keyword)) {
                    matchCount++;
                }
            }

            // Eğer yeterince şüpheliyse veya çok belirgin bir kelime içeriyorsa anında sil
            if (
                matchCount >= 2 ||
                lowerText.includes('beastarcade') ||
                lowerText.includes('vyro.gg') ||
                lowerText.includes('vyro') ||
                lowerText.includes('crypto casino') ||
                lowerText.includes('cryptocurrency casino') ||
                lowerText.includes('bot gas sng') ||
                lowerText.includes('sng amr') ||
                lowerText.includes('sossentut ution') ||
                lowerText.includes('withdrawal success') ||
                lowerText.includes('3450')
            ) {
                console.log("!!! SPAM DETECTED !!!");
                const action = getAction(message.guildId);

                // Önce mesajı sil
                if (message.deletable) {
                    await message.delete().catch(() => { });
                }

                // Seçilen cezaya göre işlem yap
                switch (action) {
                    case 'warn':
                        try {
                            await message.author.send(`⚠️ **Warning:** The content you shared in ${message.guild.name} was detected as malicious/spam and has been deleted. Please refrain from sharing such content.`);
                        } catch (e) { }
                        break;
                    case 'timeout_1h':
                        if (message.member.moderatable) {
                            try {
                                await message.author.send(`⏳ **Timeout:** You have been timed out in ${message.guild.name} for 1 hour for sharing malicious/spam content.`);
                            } catch (e) { }
                            await message.member.timeout(60 * 60 * 1000, 'MrBeast scam virus detected.');
                        }
                        break;
                    case 'timeout_1d':
                        if (message.member.moderatable) {
                            try {
                                await message.author.send(`⌛ **Timeout:** You have been timed out in ${message.guild.name} for 1 day for sharing malicious/spam content.`);
                            } catch (e) { }
                            await message.member.timeout(24 * 60 * 60 * 1000, 'MrBeast scam virus detected.');
                        }
                        break;
                    case 'timeout_1w':
                        if (message.member.moderatable) {
                            try {
                                await message.author.send(`📅 **Timeout:** You have been timed out in ${message.guild.name} for 1 week for sharing malicious/spam content.`);
                            } catch (e) { }
                            await message.member.timeout(7 * 24 * 60 * 60 * 1000, 'MrBeast scam virus detected.');
                        }
                        break;
                    case 'kick':
                        if (message.member.kickable) {
                            try {
                                await message.author.send(`🥾 **Kicked:** You have been kicked from ${message.guild.name} for sharing malicious/spam content.`);
                            } catch (e) { }
                            await message.member.kick('MrBeast scam virus detected.');
                        }
                        break;
                    case 'ban':
                        if (message.member.bannable) {
                            try {
                                await message.author.send(`🔨 **Banned:** You have been banned from ${message.guild.name} for sharing malicious/spam content.`);
                            } catch (e) { }
                            await message.member.ban({ reason: 'MrBeast scam virus detected.' });
                        }
                        break;
                    case 'delete':
                    default:
                        break;
                }
                return true; // Spam bulundu ve işlem yapıldı
            }
            return false;
        };

        // 1. Önce mesajın kendi metnini tara
        const isSpamText = await checkAndPunish(message.content);
        if (isSpamText) return; // Eğer metin spam ise fotoğraf taramaya gerek yok

        // 2. Mesajda fotoğraf varsa onları tara
        if (message.attachments.size > 0) {
            const imageAttachments = message.attachments.filter(att =>
                att.contentType && att.contentType.startsWith('image/')
            );

            if (imageAttachments.size > 0) {
                for (const [id, attachment] of imageAttachments) {
                    // Performans: 8 MB'dan büyük görselleri es geç
                    if (attachment.size > 8 * 1024 * 1024) {
                        console.log("Image is larger than 8MB, skipping.");
                        continue;
                    }

                    try {
                        // Resmi manuel olarak indir
                        const response = await fetch(attachment.url);
                        const arrayBuffer = await response.arrayBuffer();
                        const rawBuffer = Buffer.from(arrayBuffer);

                        // Jimp ile fotoğrafı oku ve OCR için optimize et
                        const Jimp = require('jimp');
                        const image = await Jimp.read(rawBuffer);

                        image.scale(2);
                        image.greyscale();
                        image.contrast(0.5); 

                        const processedBuffer = await image.getBufferAsync(Jimp.MIME_PNG);

                        const { data: { text } } = await Tesseract.recognize(
                            processedBuffer,
                            'eng',
                            { logger: m => { } }
                        );

                        console.log("--- OCR OUTPUT ---");
                        console.log(text);
                        console.log("------------------");

                        const isSpamImage = await checkAndPunish(text);
                        if (isSpamImage) break; // İlk resimde spam bulduysak diğerlerine bakmaya gerek yok

                    } catch (error) {
                        console.error('OCR Error:', error);
                    }
                }
            }
        }
    },
};
