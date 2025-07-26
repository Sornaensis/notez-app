/**
 * Security utilities and secure logging functions
 */

// Secure logging utility to prevent sensitive data exposure
const secureLog = {
    // Sensitive data patterns to redact
    sensitivePatterns: [
        /ghp_[a-zA-Z0-9]{36}/g, // GitHub Personal Access Tokens
        /github_pat_[a-zA-Z0-9_]{82}/g, // GitHub fine-grained PATs
        /passphrase/gi, // Passphrase references
        /password/gi, // Password references
        /token/gi, // Generic token references
        /secret/gi, // Secret references
        /key/gi, // Key references
    ],

    // Redact sensitive information from objects and strings
    redactSensitiveData: function (data) {
        if (typeof data === 'string') {
            let redacted = data;
            this.sensitivePatterns.forEach(pattern => {
                redacted = redacted.replace(pattern, '[REDACTED]');
            });
            return redacted;
        } else if (typeof data === 'object' && data !== null) {
            const redacted = {};
            for (const [key, value] of Object.entries(data)) {
                // Redact sensitive keys
                if (key.toLowerCase().includes('passphrase') ||
                    key.toLowerCase().includes('token') ||
                    key.toLowerCase().includes('password') ||
                    key.toLowerCase().includes('secret') ||
                    key.toLowerCase().includes('key')) {

                    if (typeof value === 'string') {
                        redacted[key] = value.length > 0 ? '[REDACTED]' : value;
                    } else if (typeof value === 'number') {
                        redacted[key] = value; // Keep lengths for debugging
                    } else {
                        redacted[key] = '[REDACTED]';
                    }
                } else {
                    redacted[key] = typeof value === 'object' ? this.redactSensitiveData(value) : value;
                }
            }
            return redacted;
        }
        return data;
    },

    // Secure console.log replacement
    log: function (message, ...args) {
        const redactedMessage = this.redactSensitiveData(message);
        const redactedArgs = args.map(arg => this.redactSensitiveData(arg));
        console.log(redactedMessage, ...redactedArgs);
    },

    // Secure console.error replacement
    error: function (message, ...args) {
        const redactedMessage = this.redactSensitiveData(message);
        const redactedArgs = args.map(arg => this.redactSensitiveData(arg));
        console.error(redactedMessage, ...redactedArgs);
    },

    // Secure console.warn replacement
    warn: function (message, ...args) {
        const redactedMessage = this.redactSensitiveData(message);
        const redactedArgs = args.map(arg => this.redactSensitiveData(arg));
        console.warn(redactedMessage, ...redactedArgs);
    }
};

// Security functions for input validation and sanitization
function sanitizeHtml(input) {
    if (!input || typeof input !== 'string') return '';

    // Create a temporary div to leverage browser's HTML parsing
    const tempDiv = document.createElement('div');
    tempDiv.textContent = input;
    return tempDiv.innerHTML;
}

function sanitizeForMarkdown(input) {
    if (!input || typeof input !== 'string') return '';

    // Remove potential XSS vectors while preserving markdown functionality
    return input
        .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Remove iframe tags
        .replace(/<object[^>]*>.*?<\/object>/gi, '') // Remove object tags
        .replace(/<embed[^>]*>/gi, '') // Remove embed tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/vbscript:/gi, '') // Remove vbscript: protocol
        .replace(/data:(?!image\/(?:png|jpe?g|gif|svg|webp);base64,)/gi, '') // Remove data: protocol except for images
        .replace(/on\w+\s*=/gi, ''); // Remove event handlers
}

function normalizeGitHubRepositoryUrl(url) {
    if (!url || typeof url !== 'string') return '';

    let normalized = url.trim();

    // Convert http to https for security
    if (normalized.startsWith('http://github.com/')) {
        normalized = normalized.replace('http://github.com/', 'https://github.com/');
    }

    // Remove trailing slash for consistency
    if (normalized.endsWith('/')) {
        normalized = normalized.slice(0, -1);
    }

    return normalized;
}

function validateGitHubRepositoryUrl(url) {
    if (!url || typeof url !== 'string') return false;

    // First normalize the URL
    const normalizedUrl = normalizeGitHubRepositoryUrl(url);

    // Strict validation for GitHub repository URLs
    const githubRepoRegex = /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/;
    return githubRepoRegex.test(normalizedUrl);
}

function validateGitHubToken(token) {
    if (!token || typeof token !== 'string') return false;

    // Validate GitHub token format (either encrypted or valid GitHub token format)
    if (window.CryptoUtils && window.CryptoUtils.isTokenEncrypted(token)) {
        // For encrypted tokens, check if it looks like encrypted data (base64-like)
        const base64Regex = /^[A-Za-z0-9+/=]{40,}$/;
        return base64Regex.test(token);
    }

    // Check for valid GitHub token patterns
    const githubTokenRegex = /^(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{82})$/;
    return githubTokenRegex.test(token);
}

// Rate limiting implementation
const rateLimiters = new Map();

function checkRateLimit(key, maxRequests = 5, windowMs = 60000) {
    const now = Date.now();
    const limiter = rateLimiters.get(key) || { count: 0, resetTime: now + windowMs };

    // Reset if window has expired
    if (now > limiter.resetTime) {
        limiter.count = 0;
        limiter.resetTime = now + windowMs;
    }

    if (limiter.count >= maxRequests) {
        return false; // Rate limit exceeded
    }

    limiter.count++;
    rateLimiters.set(key, limiter);
    return true;
}

// Secure error handling without information disclosure
function createSecureError(message, details = null) {
    const error = new Error(message);

    // Log detailed error for debugging (only in development)
    if (details && console && console.error) {
        secureLog.error('Detailed error information:', details);
    }

    return error;
}

// Helper function to sanitize filenames for safe storage
function sanitizeFilename(title) {
    return title
        .toLowerCase()
        .replace(/ /g, '_')
        .replace(/\//g, '_')
        .replace(/\\/g, '_')
        .replace(/:/g, '_')
        .replace(/\*/g, '_')
        .replace(/\?/g, '_')
        .replace(/"/g, '_')
        .replace(/</g, '_')
        .replace(/>/g, '_')
        .replace(/\|/g, '_')
        .replace(/\./g, '_')
        .replace(/\n/g, '_')
        .replace(/\r/g, '_')
        .replace(/\t/g, '_')
        .trim()
        .substring(0, 50) || 'untitled';
}

// Diagnostic function to test Credentials API capabilities
async function testCredentialsAPI() {
    console.log('=== Credentials API Diagnostic Test ===');

    // Test 1: Check basic API availability
    console.log('1. Checking API availability...');
    console.log('navigator.credentials:', !!navigator.credentials);
    console.log('navigator.credentials.store:', !!(navigator.credentials && navigator.credentials.store));
    console.log('navigator.credentials.get:', !!(navigator.credentials && navigator.credentials.get));
    console.log('window.PasswordCredential:', !!window.PasswordCredential);

    if (!navigator.credentials || !navigator.credentials.store || !window.PasswordCredential) {
        console.log('❌ Credentials API not fully supported');
        return false;
    }

    // Test 2: Try storing and retrieving a test credential
    console.log('2. Testing credential storage and retrieval...');
    try {
        const testCredential = new PasswordCredential({
            id: 'notez-test-credential',
            password: 'test-password-123',
            name: 'Test Credential'
        });

        await navigator.credentials.store(testCredential);
        console.log('✓ Test credential stored successfully');

        // Try to retrieve it
        const retrieved = await navigator.credentials.get({
            password: true,
            mediation: 'silent'
        });

        if (retrieved && retrieved.id === 'notez-test-credential' && retrieved.password === 'test-password-123') {
            console.log('✓ Test credential retrieved successfully');
            return true;
        } else {
            console.log('⚠ Test credential could not be retrieved properly');
            console.log('Retrieved:', retrieved ? { id: retrieved.id, hasPassword: !!retrieved.password } : 'null');
            return false;
        }
    } catch (error) {
        console.log('❌ Test credential storage/retrieval failed:', error);
        return false;
    }
}

// Migration function to move existing GitHub config from IndexedDB to credentials store
async function migrateGitHubConfigToCredentials() {
    try {
        // Get safe access to storage utilities
        const getStorageUtils = () => {
            if (typeof window.StorageUtils !== 'undefined') {
                return window.StorageUtils;
            }
            console.warn('StorageUtils module not loaded');
            return null;
        };

        const storageUtils = getStorageUtils();
        if (!storageUtils) {
            console.warn('Cannot perform migration: StorageUtils module not available');
            return;
        }

        // Check if we already have credentials stored
        const existingConfig = await storageUtils.loadGitHubConfigFromCredentials();
        if (existingConfig && existingConfig.personalAccessToken) {
            console.log('GitHub credentials already exist in credentials store, skipping migration');
            return;
        }

        // Try to load from IndexedDB
        const oldConfig = await new Promise((resolve) => {
            try {
                // Access the DB through storage utils if possible
                if (!storageUtils.getDB || !storageUtils.getDB()) {
                    resolve(null);
                    return;
                }

                const db = storageUtils.getDB();
                const transaction = db.transaction(['config'], 'readonly');
                const store = transaction.objectStore('config');
                const request = store.get('github');

                request.onsuccess = () => {
                    const result = request.result;
                    resolve(result && result.value ? result.value : null);
                };
                request.onerror = () => resolve(null);
            } catch (error) {
                console.warn('Error accessing IndexedDB during migration:', error);
                resolve(null);
            }
        });

        if (oldConfig && oldConfig.personalAccessToken) {
            console.log('Migrating GitHub configuration from IndexedDB to credentials store');
            await storageUtils.saveGitHubConfigToCredentials(oldConfig);

            // Remove from IndexedDB after successful migration
            try {
                const db = storageUtils.getDB();
                if (db) {
                    const transaction = db.transaction(['config'], 'readwrite');
                    const store = transaction.objectStore('config');
                    store.delete('github');
                    console.log('Removed GitHub config from IndexedDB after migration');
                }
            } catch (error) {
                console.warn('Failed to remove GitHub config from IndexedDB after migration:', error);
            }
        }
    } catch (error) {
        console.warn('Migration from IndexedDB to credentials store failed:', error);
    }
}

// Export functions
window.SecurityUtils = {
    secureLog,
    sanitizeHtml,
    sanitizeForMarkdown,
    normalizeGitHubRepositoryUrl,
    validateGitHubRepositoryUrl,
    validateGitHubToken,
    checkRateLimit,
    createSecureError,
    sanitizeFilename,
    testCredentialsAPI,
    migrateGitHubConfigToCredentials
};