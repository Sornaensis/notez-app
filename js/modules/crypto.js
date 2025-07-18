/**
 * Crypto utilities for encryption, decryption, and security functions
 */

// Secure random number generation with fallback
function secureRandomBytes(length) {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        return crypto.getRandomValues(new Uint8Array(length));
    } else if (typeof msCrypto !== 'undefined' && msCrypto.getRandomValues) {
        // Fallback for older Internet Explorer
        return msCrypto.getRandomValues(new Uint8Array(length));
    } else {
        // Fallback for environments without crypto API (should not happen in modern browsers)
        console.warn('⚠️  No cryptographically secure random number generator available. Using Math.random() fallback.');
        const bytes = new Uint8Array(length);
        for (let i = 0; i < length; i++) {
            bytes[i] = Math.floor(Math.random() * 256);
        }
        return bytes;
    }
}

// Derive key from passphrase using PBKDF2
async function deriveKey(passphrase, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(passphrase),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 600000, // Increased from 100,000 to 600,000+ per OWASP 2023 recommendation
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

// Encrypt text using AES-GCM
async function encryptText(text, passphrase) {
    const enc = new TextEncoder();
    const salt = secureRandomBytes(16);
    const iv = secureRandomBytes(12);

    const key = await deriveKey(passphrase, salt);
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        enc.encode(text)
    );

    // Combine salt, iv, and encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    // Convert to base64 for storage
    return btoa(String.fromCharCode.apply(null, combined));
}

// Decrypt text using AES-GCM
async function decryptText(encryptedData, passphrase) {
    try {
        if (!encryptedData || typeof encryptedData !== 'string') {
            throw new Error('Invalid encrypted data: must be a non-empty string. Received: ' + (typeof encryptedData) + ' with value: ' + encryptedData);
        }

        if (!passphrase || typeof passphrase !== 'string') {
            throw new Error('Invalid passphrase: must be a non-empty string. Received: ' + (typeof passphrase));
        }

        // Convert from base64
        const combined = new Uint8Array(atob(encryptedData).split('').map(char => char.charCodeAt(0)));

        // Extract salt, iv, and encrypted data
        const salt = combined.slice(0, 16);
        const iv = combined.slice(16, 28);
        const encrypted = combined.slice(28);

        if (salt.length !== 16) {
            throw new Error('Invalid salt length: expected 16, got ' + salt.length);
        }

        if (iv.length !== 12) {
            throw new Error('Invalid IV length: expected 12, got ' + iv.length);
        }

        if (encrypted.length === 0) {
            throw new Error('No encrypted data found');
        }

        const key = await deriveKey(passphrase, salt);
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encrypted
        );

        const dec = new TextDecoder();
        return dec.decode(decrypted);
    } catch (error) {
        console.error('decryptText error:', error);

        // Provide more specific error messages based on the error type
        if (error.message.includes('Invalid encrypted data')) {
            throw new Error('No valid encrypted token found. The GitHub token may not be properly stored.');
        } else if (error.message.includes('Invalid passphrase')) {
            throw new Error('Passphrase is required but was not provided.');
        } else if (error.message.includes('Invalid salt length') || error.message.includes('Invalid IV length')) {
            throw new Error('Corrupted encrypted data. The stored token appears to be damaged.');
        } else if (error.name === 'OperationError' || error.message.includes('decrypt')) {
            throw new Error('Incorrect passphrase or corrupted data.');
        } else {
            throw new Error('Decryption failed: ' + error.message);
        }
    }
}

// Helper function to detect if a token is encrypted
function isTokenEncrypted(token) {
    if (!token) return false;
    // Plain GitHub tokens start with these prefixes
    return !token.startsWith('ghp_') && !token.startsWith('github_pat_');
}

// Test encryption/decryption functionality
async function testEncryptionDecryption(testText = "test-token-12345", testPassphrase = "test-passphrase") {
    console.log('=== Testing Encryption/Decryption ===');
    console.log('Test text:', testText);
    console.log('Test passphrase:', testPassphrase);

    try {
        // Test encryption
        console.log('\n1. Testing encryption...');
        const encrypted = await encryptText(testText, testPassphrase);
        console.log('Encryption successful, encrypted length:', encrypted.length);
        console.log('Encrypted data (first 50 chars):', encrypted.substring(0, 50) + '...');

        // Test decryption
        console.log('\n2. Testing decryption...');
        const decrypted = await decryptText(encrypted, testPassphrase);
        console.log('Decryption successful, decrypted text:', decrypted);

        // Verify they match
        if (decrypted === testText) {
            console.log('✓ Encryption/Decryption test PASSED');
            return { success: true, encrypted, decrypted };
        } else {
            console.log('✗ Encryption/Decryption test FAILED - texts do not match');
            return { success: false, error: 'Decrypted text does not match original' };
        }
    } catch (error) {
        console.error('✗ Encryption/Decryption test FAILED with error:', error);
        return { success: false, error: error.message };
    }
}

// Encrypt an entire object by converting to JSON first
async function encryptObject(obj, passphrase) {
    if (!obj || typeof obj !== 'object') {
        throw new Error('Invalid object: must be a non-null object');
    }
    
    if (!passphrase || typeof passphrase !== 'string') {
        throw new Error('Invalid passphrase: must be a non-empty string');
    }
    
    try {
        const jsonString = JSON.stringify(obj);
        return await encryptText(jsonString, passphrase);
    } catch (error) {
        throw new Error('Failed to encrypt object: ' + error.message);
    }
}

// Decrypt an object by decrypting the JSON and parsing it
async function decryptObject(encryptedData, passphrase) {
    if (!encryptedData || typeof encryptedData !== 'string') {
        throw new Error('Invalid encrypted data: must be a non-empty string');
    }
    
    if (!passphrase || typeof passphrase !== 'string') {
        throw new Error('Invalid passphrase: must be a non-empty string');
    }
    
    try {
        const jsonString = await decryptText(encryptedData, passphrase);
        return JSON.parse(jsonString);
    } catch (error) {
        if (error.message.includes('Unexpected token') || error.message.includes('JSON')) {
            throw new Error('Failed to parse decrypted data as JSON - data may be corrupted or passphrase incorrect');
        }
        throw new Error('Failed to decrypt object: ' + error.message);
    }
}

// Check if data appears to be an encrypted object (base64 encoded)
function isObjectEncrypted(data) {
    if (!data || typeof data !== 'string') return false;
    
    // Check if it looks like base64 encoded data (encrypted objects will be base64)
    // Base64 regex pattern
    const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
    
    // Must be reasonable length (encrypted data is usually longer than plain text)
    // and match base64 pattern
    return data.length > 50 && base64Pattern.test(data);
}

// Export functions
window.CryptoUtils = {
    encryptText,
    decryptText,
    encryptObject,
    decryptObject,
    isTokenEncrypted,
    isObjectEncrypted,
    testEncryptionDecryption,
    secureRandomBytes
};