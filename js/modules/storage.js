/**
 * Storage utilities for IndexedDB operations and local storage
 */

const DB_NAME = 'NotezDB';
const DB_VERSION = 2; // Incremented for GitHub config storage
const STORE_NAME = 'notes';
const CONFIG_STORE_NAME = 'config';

let db;

// In-memory passphrase storage for the session
let sessionPassphrase = null;

// Function to set session passphrase
function setSessionPassphrase(passphrase) {
    sessionPassphrase = passphrase;
    console.log('Session passphrase set for note encryption/decryption');
}

// Function to get session passphrase
function getSessionPassphrase() {
    return sessionPassphrase;
}

// Function to clear session passphrase
function clearSessionPassphrase() {
    sessionPassphrase = null;
    console.log('Session passphrase cleared');
}

// Transaction queue to prevent overlapping database operations
let transactionQueue = Promise.resolve();

// Enhanced transaction queue for sync operations
// Sync operations have priority over regular operations
let syncTransactionQueue = Promise.resolve();

// Queue sync-specific database operations with higher priority
function queueSyncOperation(operation) {
    return syncTransactionQueue = syncTransactionQueue.then(operation);
}

// Queue regular database operations
function queueRegularOperation(operation) {
    return transactionQueue = transactionQueue.then(operation);
}

// Initialize IndexedDB
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            db = event.target.result;

            // Create notes store if it doesn't exist
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }

            // Create config store for non-sensitive settings
            // NOTE: GitHub tokens are now stored in the credentials store, not here
            if (!db.objectStoreNames.contains(CONFIG_STORE_NAME)) {
                db.createObjectStore(CONFIG_STORE_NAME, { keyPath: 'key' });
            }
        };
    });
}

// Encrypt note data for storage using user passphrase
async function encryptNoteData(note, passphrase = null) {
    try {
        if (!passphrase) {
            // No passphrase provided - store unencrypted for now
            console.warn('No passphrase provided for note encryption - storing unencrypted');
            return { ...note, isEncrypted: false };
        }

        const { encryptText } = window.CryptoUtils;

        // Encrypt title, content, and tags using user's passphrase
        const encryptedTitle = await encryptText(note.title || '', passphrase);
        const encryptedContent = await encryptText(note.content || '', passphrase);
        
        // Encrypt tags as JSON string
        const tagsJson = JSON.stringify(note.tags || []);
        const encryptedTags = await encryptText(tagsJson, passphrase);

        return {
            id: note.id, // Keep ID unencrypted for indexing
            createdAt: note.createdAt, // Keep timestamps unencrypted for sorting
            editedAt: note.editedAt,
            title: encryptedTitle,
            content: encryptedContent,
            tags: encryptedTags, // Store encrypted tags as string
            isEncrypted: true
        };
    } catch (error) {
        console.error('Failed to encrypt note data:', error);
        // Fallback to unencrypted storage
        return { ...note, isEncrypted: false };
    }
}

// Decrypt note data from storage using user passphrase
async function decryptNoteData(encryptedNote, passphrase = null) {
    try {
        if (!encryptedNote.isEncrypted) {
            // Note is not encrypted, return as-is
            return encryptedNote;
        }

        if (!passphrase) {
            // No passphrase provided - return placeholder content gracefully without throwing
            console.log('No passphrase available for encrypted note', encryptedNote.id, '- returning placeholder content');
            return {
                id: encryptedNote.id,
                createdAt: encryptedNote.createdAt,
                editedAt: encryptedNote.editedAt,
                title: '[ENCRYPTED - Enter passphrase to decrypt]',
                content: '[This note is encrypted and requires your passphrase to decrypt]',
                tags: [],
                isEncrypted: true // Keep as encrypted to indicate it needs passphrase
            };
        }

        const { decryptText } = window.CryptoUtils;

        // Decrypt title, content, and tags
        const decryptedTitle = await decryptText(encryptedNote.title, passphrase);
        const decryptedContent = await decryptText(encryptedNote.content, passphrase);
        
        // Decrypt tags and parse JSON
        const decryptedTagsJson = await decryptText(encryptedNote.tags, passphrase);
        const decryptedTags = JSON.parse(decryptedTagsJson);

        return {
            id: encryptedNote.id,
            createdAt: encryptedNote.createdAt,
            editedAt: encryptedNote.editedAt,
            title: decryptedTitle,
            content: decryptedContent,
            tags: decryptedTags,
            isEncrypted: false // Mark as decrypted
        };
    } catch (error) {
        console.error('Failed to decrypt note data:', error);
        throw new Error('Failed to decrypt note - check passphrase');
    }
}

// Save notes to IndexedDB with encryption
async function saveNotesToDB(notes, isSyncOperation = false, passphrase = null) {
    // Use provided passphrase or session passphrase
    const passphraseToUse = passphrase || getSessionPassphrase();
    
    // Queue this transaction to prevent overlapping operations
    // Use sync queue for sync operations, regular queue for normal operations
    const queueFunction = isSyncOperation ? queueSyncOperation : queueRegularOperation;
    return queueFunction(async () => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(`Starting database transaction for ${notes.length} notes`);

                // Pre-encrypt all notes before starting the transaction
                // This prevents async operations inside the transaction that could cause it to close
                const encryptedNotes = [];
                for (const note of notes) {
                    try {
                        const encryptedNote = await encryptNoteData(note, passphraseToUse);
                        encryptedNotes.push(encryptedNote);
                    } catch (error) {
                        console.error('Failed to encrypt note:', note.id, error);
                        // Fallback to unencrypted storage for this note
                        encryptedNotes.push({ ...note, isEncrypted: false });
                    }
                }

                console.log(`Encrypted ${encryptedNotes.length} notes, starting database transaction`);

                // Now perform the synchronous database operations
                const transaction = db.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);

                // Clear existing notes
                const clearRequest = store.clear();
                clearRequest.onsuccess = () => {
                    console.log('Cleared existing notes, adding new notes');
                    // Add all pre-encrypted notes synchronously
                    for (const encryptedNote of encryptedNotes) {
                        store.add(encryptedNote);
                    }
                };

                clearRequest.onerror = () => {
                    console.error('Failed to clear existing notes:', clearRequest.error);
                    reject(new Error('Failed to clear existing notes: ' + clearRequest.error));
                };

                transaction.oncomplete = () => {
                    console.log('Database transaction completed successfully');
                    resolve();
                };

                transaction.onerror = () => {
                    console.error('Database transaction failed:', transaction.error);
                    reject(new Error('Database transaction failed: ' + transaction.error));
                };
            } catch (error) {
                console.error('Failed to save notes:', error);
                reject(new Error('Failed to save notes: ' + error.message));
            }
        });
    }).catch(error => {
        console.error('Transaction queue error:', error);
        throw error;
    });
}

// Load notes from IndexedDB with decryption
async function loadNotesFromDB(isSyncOperation = false, passphrase = null) {
    // Use provided passphrase or session passphrase
    const passphraseToUse = passphrase || getSessionPassphrase();
    
    // Queue this transaction to prevent overlapping operations
    // Use sync queue for sync operations, regular queue for normal operations
    const queueFunction = isSyncOperation ? queueSyncOperation : queueRegularOperation;
    return queueFunction(async () => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log('Starting database read transaction');
                const transaction = db.transaction([STORE_NAME], 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.getAll();

                request.onsuccess = async () => {
                    try {
                        const encryptedNotes = request.result || [];
                        console.log(`Loaded ${encryptedNotes.length} encrypted notes from database`);
                        const decryptedNotes = [];

                        for (const encryptedNote of encryptedNotes) {
                            try {
                                const decryptedNote = await decryptNoteData(encryptedNote, passphraseToUse);
                                decryptedNotes.push(decryptedNote);
                            } catch (error) {
                                console.warn('Failed to decrypt note:', encryptedNote.id, error.message);
                                // If decryption fails, include note with placeholder content
                                decryptedNotes.push({
                                    ...encryptedNote,
                                    title: '[ENCRYPTED - Enter passphrase to decrypt]',
                                    content: '[This note is encrypted and requires your passphrase to decrypt]',
                                    tags: [],
                                    isEncrypted: true // Keep as encrypted to indicate it needs passphrase
                                });
                            }
                        }

                        console.log(`Successfully decrypted ${decryptedNotes.length} notes`);
                        resolve(decryptedNotes);
                    } catch (error) {
                        // If decryption fails, return empty array (data may be corrupted)
                        console.warn('Failed to decrypt some notes, returning empty array');
                        resolve([]);
                    }
                };
                request.onerror = () => {
                    console.error('Database read operation failed:', request.error);
                    reject(new Error('Database operation failed: ' + request.error));
                };
            } catch (error) {
                console.error('Failed to load notes:', error);
                reject(new Error('Failed to load notes: ' + error.message));
            }
        });
    }).catch(error => {
        console.error('Transaction queue error during load:', error);
        throw error;
    });
}

// Clear all data from IndexedDB
function clearAllData() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }

        const transaction = db.transaction([STORE_NAME, CONFIG_STORE_NAME], 'readwrite');
        const notesStore = transaction.objectStore(STORE_NAME);
        const configStore = transaction.objectStore(CONFIG_STORE_NAME);

        let clearedStores = 0;
        const totalStores = 2;

        const checkCompletion = () => {
            clearedStores++;
            if (clearedStores === totalStores) {
                resolve();
            }
        };

        const notesRequest = notesStore.clear();
        notesRequest.onsuccess = checkCompletion;
        notesRequest.onerror = () => reject(new Error('Failed to clear notes store: ' + notesRequest.error));

        const configRequest = configStore.clear();
        configRequest.onsuccess = checkCompletion;
        configRequest.onerror = () => reject(new Error('Failed to clear config store: ' + configRequest.error));
    });
}

// Secure wrapper for localStorage.setItem
function secureLocalStorageSetItem(key, value) {
    try {
        validateStorageData(key, value);
        localStorage.setItem(key, value);
    } catch (error) {
        console.error('Failed to validate storage data:', error);
        throw error;
    }
}

// Validate that no sensitive data is being stored in localStorage
function validateStorageData(key, data) {
    // Only validate if it's a string that might contain sensitive data
    if (typeof data === 'string') {
        // Check for unencrypted GitHub tokens
        if (data.includes('ghp_') || data.includes('github_pat_')) {
            throw new Error(`Attempted to store unencrypted GitHub token in localStorage key: ${key}`);
        }

        // Check for other potentially sensitive patterns
        const sensitivePatterns = [
            /password["\s]*[:=]["\s]*[^"]+/i,
            /passphrase["\s]*[:=]["\s]*[^"]+/i,
            /secret["\s]*[:=]["\s]*[^"]+/i,
        ];

        for (const pattern of sensitivePatterns) {
            if (pattern.test(data)) {
                console.warn(`Potentially sensitive data detected in localStorage key: ${key}`);
                break;
            }
        }
    }
}

// Encrypted localStorage wrapper functions
async function encryptedLocalStorageSetItem(key, data, passphrase = null) {
    try {
        // Use provided passphrase or session passphrase
        const passphraseToUse = passphrase || getSessionPassphrase();
        
        if (!passphraseToUse) {
            console.warn(`No passphrase available for encrypting localStorage key: ${key} - storing unencrypted as fallback`);
            // Fallback to unencrypted storage with validation
            validateStorageData(key, JSON.stringify(data));
            localStorage.setItem(key, JSON.stringify(data));
            return;
        }

        // Get crypto utilities
        const { encryptObject } = window.CryptoUtils;
        if (!encryptObject) {
            throw new Error('CryptoUtils not available for encryption');
        }

        // Encrypt the data
        const encryptedData = await encryptObject(data, passphraseToUse);
        
        // Store with encrypted suffix to distinguish from unencrypted data
        const encryptedKey = key + '-encrypted';
        localStorage.setItem(encryptedKey, encryptedData);
        
        // Remove old unencrypted version if it exists
        localStorage.removeItem(key);
        
        console.log(`✅ Encrypted data stored in localStorage: ${encryptedKey}`);
    } catch (error) {
        console.error(`Failed to encrypt and store localStorage key: ${key}`, error);
        throw error;
    }
}

async function encryptedLocalStorageGetItem(key, passphrase = null) {
    try {
        // Use provided passphrase or session passphrase
        const passphraseToUse = passphrase || getSessionPassphrase();
        
        // Try to get encrypted version first
        const encryptedKey = key + '-encrypted';
        const encryptedData = localStorage.getItem(encryptedKey);
        
        if (encryptedData) {
            if (!passphraseToUse) {
                console.warn(`Found encrypted data for key: ${key} but no passphrase available - returning null`);
                return null;
            }
            
            // Get crypto utilities
            const { decryptObject, isObjectEncrypted } = window.CryptoUtils;
            if (!decryptObject || !isObjectEncrypted) {
                throw new Error('CryptoUtils not available for decryption');
            }
            
            // Verify it's encrypted data
            if (!isObjectEncrypted(encryptedData)) {
                throw new Error(`Data for key ${encryptedKey} does not appear to be encrypted`);
            }
            
            // Decrypt the data
            const decryptedData = await decryptObject(encryptedData, passphraseToUse);
            console.log(`✅ Decrypted data loaded from localStorage: ${encryptedKey}`);
            return decryptedData;
        }
        
        // Fallback to unencrypted version for migration
        const unencryptedData = localStorage.getItem(key);
        if (unencryptedData) {
            try {
                const parsedData = JSON.parse(unencryptedData);
                console.log(`⚠️ Found unencrypted data for key: ${key} - migration recommended`);
                return parsedData;
            } catch (error) {
                console.warn(`Failed to parse unencrypted data for key: ${key}`, error);
                return null;
            }
        }
        
        // No data found
        return null;
    } catch (error) {
        console.error(`Failed to decrypt and load localStorage key: ${key}`, error);
        return null;
    }
}

// Migration function to convert unencrypted data to encrypted
async function migrateUnencryptedLocalStorageItem(key, passphrase = null) {
    try {
        // Check if we already have encrypted version
        const encryptedKey = key + '-encrypted';
        if (localStorage.getItem(encryptedKey)) {
            console.log(`Encrypted version already exists for key: ${key}`);
            return true;
        }
        
        // Get unencrypted data
        const unencryptedData = localStorage.getItem(key);
        if (!unencryptedData) {
            console.log(`No unencrypted data found for key: ${key}`);
            return true;
        }
        
        try {
            const parsedData = JSON.parse(unencryptedData);
            console.log(`Migrating unencrypted data to encrypted for key: ${key}`);
            
            // Store as encrypted
            await encryptedLocalStorageSetItem(key, parsedData, passphrase);
            
            console.log(`✅ Successfully migrated key: ${key} to encrypted storage`);
            return true;
        } catch (error) {
            console.error(`Failed to migrate key: ${key}`, error);
            return false;
        }
    } catch (error) {
        console.error(`Error during migration of key: ${key}`, error);
        return false;
    }
}

// Remove both encrypted and unencrypted versions of a localStorage item
function removeEncryptedLocalStorageItem(key) {
    const encryptedKey = key + '-encrypted';
    localStorage.removeItem(key);
    localStorage.removeItem(encryptedKey);
    console.log(`Removed both encrypted and unencrypted versions of key: ${key}`);
}

// Export functions
window.StorageUtils = {
    initDB,
    saveNotesToDB,
    loadNotesFromDB,
    clearAllData,
    secureLocalStorageSetItem,
    validateStorageData,
    // Session passphrase management
    setSessionPassphrase,
    getSessionPassphrase,
    clearSessionPassphrase,
    // Encrypted localStorage functions
    encryptedLocalStorageSetItem,
    encryptedLocalStorageGetItem,
    migrateUnencryptedLocalStorageItem,
    removeEncryptedLocalStorageItem,
    // Expose database constants for other modules
    DB_NAME,
    DB_VERSION,
    STORE_NAME,
    CONFIG_STORE_NAME
};