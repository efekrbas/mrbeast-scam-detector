const { getAction, getAllHashes } = require('../database');
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

// Hamming distance calculating function for 64-bit strings
function getHammingDistance(hash1, hash2) {
    if (!hash1 || !hash2) return 64;
    // jimp.hash(2) bazen baştaki 0'ları atabildiği için 64 karaktere tamamlıyoruz
    const h1 = hash1.padStart(64, '0');
    const h2 = hash2.padStart(64, '0');
    let distance = 0;
    for (let i = 0; i < 64; i++) {
        if (h1[i] !== h2[i]) distance++;
    }
    return distance;
}

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        // Botların kendi mesajlarını veya DM'leri yoksay
        if (message.author.bot || !message.guild) return;

        // Tarama ve silme/cezalandırma fonksiyonu
        const checkAndPunish = async (isSpam, reason) => {
            if (!isSpam) return false;

            console.log(`!!! SPAM DETECTED !!! [Reason: ${reason}]`);
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
        };

        const scanText = (textToScan) => {
            if (!textToScan) return false;
            
            const lowerText = textToScan.toLowerCase();
            let matchCount = 0;
            for (const keyword of SUSPICIOUS_KEYWORDS) {
                if (lowerText.includes(keyword)) {
                    matchCount++;
                }
            }

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
                return true;
            }
            return false;
        };

        // 1. Önce mesajın kendi metnini tara
        const isSpamText = scanText(message.content);
        if (isSpamText) {
            await checkAndPunish(true, "Text Match");
            return; // Eğer metin spam ise fotoğraf taramaya gerek yok
        }

        // 2. Mesajda fotoğraf varsa onları tara
        if (message.attachments.size > 0) {
            const imageAttachments = message.attachments.filter(att =>
                att.contentType && att.contentType.startsWith('image/')
            );

            if (imageAttachments.size > 0) {
                const savedHashes = getAllHashes();

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

                        // Jimp ile fotoğrafı oku
                        const Jimp = require('jimp');
                        const image = await Jimp.read(rawBuffer);

                        // --- pHash Kontrolü ---
                        // 64-bit binary hash oluştur
                        const imageHash = image.hash(2);
                        console.log(`Image Hash: ${imageHash}`);

                        let isHashMatch = false;
                        for (const savedHash of savedHashes) {
                            const distance = getHammingDistance(imageHash, savedHash);
                            // 5 bit veya daha az fark varsa (çok yüksek benzerlik)
                            if (distance <= 5) {
                                isHashMatch = true;
                                break;
                            }
                        }

                        if (isHashMatch) {
                            const punished = await checkAndPunish(true, "pHash Match");
                            if (punished) break;
                        }

                        // --- OCR Kontrolü --- (Eğer pHash eşleşmediyse son çare OCR yap)
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

                        const isSpamImage = scanText(text);
                        if (isSpamImage) {
                            const punished = await checkAndPunish(true, "OCR Match");
                            if (punished) break; // İlk resimde spam bulduysak diğerlerine bakmaya gerek yok
                        }

                    } catch (error) {
                        console.error('Processing Error:', error);
                    }
                }
            }
        }
    },
};
