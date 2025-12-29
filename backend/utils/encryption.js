const crypto = require('crypto');

const ALGO = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

const encrypt = (text) => {
    if (!text) return text;
    const secret = process.env.ENCRYPTION_KEY || 'default-secret-key-must-be-32-chars-long-123';
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGO, Buffer.from(secret, 'utf8'), iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    // Format: iv:encrypted:tag
    return `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
};

const decrypt = (encryptedText) => {
    if (!encryptedText || !encryptedText.includes(':')) return encryptedText;

    try {
        const secret = process.env.ENCRYPTION_KEY || 'default-secret-key-must-be-32-chars-long-123';
        const [ivHex, encrypted, tagHex] = encryptedText.split(':');

        const iv = Buffer.from(ivHex, 'hex');
        const tag = Buffer.from(tagHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGO, Buffer.from(secret, 'utf8'), iv);
        decipher.setAuthTag(tag);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error);
        return encryptedText; // Fallback to original text if decryption fails
    }
};

module.exports = { encrypt, decrypt };
