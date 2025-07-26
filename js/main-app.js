/**
 * Main application orchestrator - refactored from monolithic index.html
 * This file coordinates all the modules and handles Elm port communication
 */

// Global app state
let app;

// Safe module access - check if modules are available before using them
function getSecurityUtils() {
    if (!window.SecurityUtils) {
        throw new Error('SecurityUtils module not loaded');
    }
    return window.SecurityUtils;
}

function getStorageUtils() {
    if (!window.StorageUtils) {
        throw new Error('StorageUtils module not loaded');
    }
    return window.StorageUtils;
}

function getCryptoUtils() {
    if (!window.CryptoUtils) {
        throw new Error('CryptoUtils module not loaded');
    }
    return window.CryptoUtils;
}

function getContentProcessor() {
    if (!window.ContentProcessor) {
        throw new Error('ContentProcessor module not loaded');
    }
    return window.ContentProcessor;
}

function getElmUtils() {
    if (!window.ElmUtils) {
        throw new Error('ElmUtils module not loaded');
    }
    return window.ElmUtils;
}

function getGitHubSync() {
    if (!window.GitHubSync) {
        console.error('🔧 Debug: GitHubSync module not found on window object');
        console.error('🔧 Debug: Available window properties:', Object.keys(window).filter(k => k.includes('Git') || k.includes('Sync')));
        throw new Error('GitHub sync module not loaded');
    }
    return window.GitHubSync;
}

// GitHub configuration management using modules with full object encryption
async function saveGitHubConfigToCredentials(config, passphrase) {
    try {
        const { secureLog, createSecureError } = getSecurityUtils();
        const { encryptObject } = getCryptoUtils();
        const { secureLocalStorageSetItem } = getStorageUtils();

        // Input validation
        if (!config || typeof config !== 'object') {
            throw createSecureError('Invalid configuration object', { configType: typeof config });
        }

        if (!passphrase || typeof passphrase !== 'string') {
            throw createSecureError('Passphrase is required for GitHub config encryption');
        }

        // Encrypt the entire config object (including all keys and values)
        const encryptedConfigBlob = await encryptObject(config, passphrase);
        
        // Store the encrypted blob in localStorage
        secureLocalStorageSetItem('notez-github-config-encrypted', encryptedConfigBlob);
        
        // Remove old plain-text config if it exists
        localStorage.removeItem('notez-github-config');
        
        secureLog.log('✅ GitHub config saved to localStorage successfully (entire object encrypted)');

        // Debug: Check what we actually saved (without revealing sensitive data)
        console.log('📝 Saved encrypted config verification:', {
            hasEncryptedData: !!(encryptedConfigBlob),
            encryptedDataLength: encryptedConfigBlob?.length || 0,
            configKeys: Object.keys(config),
            repositoryUrlSet: !!(config.repositoryUrl),
            hasToken: !!(config.personalAccessToken),
            enabled: config.enabled
        });
    } catch (error) {
        console.error('Failed to save GitHub config to localStorage:', error);
        throw error;
    }
}

async function loadGitHubConfigFromCredentials(passphrase = null) {
    try {
        const { decryptObject, isObjectEncrypted } = getCryptoUtils();

        // Try to load new encrypted config first
        const encryptedConfigBlob = localStorage.getItem('notez-github-config-encrypted');
        if (encryptedConfigBlob && isObjectEncrypted(encryptedConfigBlob)) {
            if (!passphrase) {
                console.log('Encrypted GitHub config found but no passphrase provided');
                return { requiresPassphrase: true };
            }
            
            try {
                const config = await decryptObject(encryptedConfigBlob, passphrase);
                console.log('✅ GitHub config loaded and decrypted successfully');
                console.log('📝 Loaded config verification:', {
                    repositoryUrl: config.repositoryUrl || '[NOT SET]',
                    hasToken: !!(config.personalAccessToken),
                    enabled: config.enabled,
                    lastSyncTime: config.lastSyncTime,
                    lastSyncRef: config.lastSyncRef || '[NOT SET]'
                });
                return config;
            } catch (error) {
                console.error('Failed to decrypt GitHub config:', error);
                throw new Error('Failed to decrypt GitHub config - check passphrase');
            }
        }

        // Fallback: try to load old partially-encrypted config for migration
        const oldConfigJson = localStorage.getItem('notez-github-config');
        if (oldConfigJson) {
            try {
                const config = JSON.parse(oldConfigJson);
                console.log('⚠️ Found old partially-encrypted GitHub config - migration needed');
                console.log('📝 Old config verification:', {
                    repositoryUrl: config.repositoryUrl || '[NOT SET]',
                    hasToken: !!(config.personalAccessToken),
                    enabled: config.enabled,
                    lastSyncTime: config.lastSyncTime,
                    lastSyncRef: config.lastSyncRef || '[NOT SET]'
                });
                return { ...config, needsMigration: true };
            } catch (error) {
                console.error('Failed to parse old GitHub config:', error);
            }
        }

        console.log('No GitHub config found in localStorage');
        return null;
    } catch (error) {
        console.error('Failed to load GitHub config from localStorage:', error);
        return null;
    }
}

// Initialize Elm application and set up ports
function initializeElmApp() {
    app = Elm.Main.init({
        node: document.getElementById('app')
    });

    // Set up all port subscriptions IMMEDIATELY after app initialization
    setupPortSubscriptions();
    
    // Migrate existing unencrypted localStorage data to encrypted format
    migrateUnencryptedLocalStorageData();
}

// Migrate existing unencrypted localStorage data to encrypted format
async function migrateUnencryptedLocalStorageData() {
    console.log('🔄 Checking for unencrypted localStorage data to migrate...');
    
    try {
        const { migrateUnencryptedLocalStorageItem } = getStorageUtils();
        
        // List of localStorage keys to migrate
        const keysToMigrate = [
            'notez-tags',
            'notez-last-open-note',
            'notez-action-events',
            'notez-action-count',
            'notez-note-history',
            'notez-commit-cache'
        ];
        
        let migrationCount = 0;
        
        for (const key of keysToMigrate) {
            try {
                const success = await migrateUnencryptedLocalStorageItem(key);
                if (success) {
                    const hasUnencrypted = localStorage.getItem(key) !== null;
                    const hasEncrypted = localStorage.getItem(key + '-encrypted') !== null;
                    
                    if (hasUnencrypted && hasEncrypted) {
                        migrationCount++;
                        console.log(`✅ Migrated ${key} from unencrypted to encrypted storage`);
                    }
                }
            } catch (error) {
                console.warn(`⚠️ Failed to migrate ${key}:`, error);
            }
        }
        
        if (migrationCount > 0) {
            console.log(`🎉 Successfully migrated ${migrationCount} localStorage items to encrypted storage`);
        } else {
            console.log('ℹ️ No localStorage data migration needed');
        }
    } catch (error) {
        console.error('❌ Error during localStorage migration:', error);
    }
}

// Set up all port communications with Elm
function setupPortSubscriptions() {
    const { saveNotesToDB, loadNotesFromDB } = getStorageUtils();

    // Storage ports
    app.ports.saveNotes.subscribe(function (notes) {
        saveNotesToDB(notes).catch(console.error);
    });

    app.ports.loadNotes.subscribe(function () {
        loadNotesFromDB()
            .then(async notes => {
                app.ports.notesLoaded.send(notes);
                
                // Auto-load last note during startup ONLY if GitHub sync is not configured
                // If GitHub sync is configured, Elm will handle the loading sequence after passphrase verification
                const timeSinceLoad = performance.now();
                const isStartupContext = timeSinceLoad < 10000; // Within 10 seconds of page load
                
                if (isStartupContext && notes.length > 0) {
                    // Check if GitHub sync is configured by looking for encrypted config
                    const encryptedConfigBlob = localStorage.getItem('notez-github-config-encrypted');
                    const hasGitHubConfig = encryptedConfigBlob !== null;
                    
                    if (!hasGitHubConfig) {
                        console.log('🔍 Auto-loading last note during startup (no GitHub sync configured)');
                        // Delay to ensure notes are processed by Elm first
                        setTimeout(async () => {
                            try {
                                const { encryptedLocalStorageGetItem } = getStorageUtils();
                                const noteId = await encryptedLocalStorageGetItem('notez-last-open-note');
                                if (noteId !== null) {
                                    console.log('🔍 Auto-triggering lastOpenNoteLoaded during startup');
                                    app.ports.lastOpenNoteLoaded.send(noteId);
                                }
                            } catch (error) {
                                console.error('Failed to load last open note ID:', error);
                            }
                        }, 500);
                    } else {
                        console.log('🔍 GitHub sync configured - skipping auto-loading, will be handled by Elm after passphrase verification');
                    }
                }
            })
            .catch(console.error);
    });

    app.ports.loadNotesForSync.subscribe(function () {
        loadNotesFromDB(true)  // Mark as sync operation
            .then(notes => {
                app.ports.notesLoadedForSync.send(notes);
            })
            .catch(console.error);
    });

    // Tag management ports
    app.ports.saveTags.subscribe(async function (tags) {
        try {
            const { encryptedLocalStorageSetItem } = getStorageUtils();
            await encryptedLocalStorageSetItem('notez-tags', tags);
        } catch (error) {
            console.error('Failed to save tags:', error);
        }
    });

    app.ports.loadTags.subscribe(async function () {
        try {
            const { encryptedLocalStorageGetItem } = getStorageUtils();
            const tags = await encryptedLocalStorageGetItem('notez-tags') || [];
            app.ports.tagsLoaded.send(tags);
        } catch (error) {
            console.error('Failed to load tags:', error);
            app.ports.tagsLoaded.send([]);
        }
    });

    // GitHub configuration ports
    app.ports.saveGitHubConfig.subscribe(async function (config) {
        try {
            console.log('Saving GitHub config (legacy method):', {
                configType: typeof config,
                configKeys: config ? Object.keys(config) : 'no keys',
                repositoryUrl: config?.repositoryUrl || '[NOT SET]',
                hasToken: !!(config?.personalAccessToken),
                tokenLength: config?.personalAccessToken?.length || 0,
                enabled: config?.enabled,
                lastSyncTime: config?.lastSyncTime,
                lastSyncRef: config?.lastSyncRef || '[NOT SET]'
            });
            
            // For backward compatibility, try to save with old method if no passphrase-based config exists
            const encryptedConfigBlob = localStorage.getItem('notez-github-config-encrypted');
            if (!encryptedConfigBlob) {
                // No encrypted config exists yet, use old method with a temporary passphrase
                // This is for migration purposes only
                const tempPassphrase = 'notez-default-migration-key-' + Date.now();
                await saveGitHubConfigToCredentials(config, tempPassphrase);
                console.log('GitHub config saved successfully (legacy method with temporary passphrase for migration)');
            } else {
                console.warn('Encrypted config exists - cannot save without passphrase. Use saveGitHubConfigWithPassphrase instead.');
            }
        } catch (error) {
            console.error('Failed to save GitHub config:', error);
        }
    });

    app.ports.saveGitHubConfigWithPassphrase.subscribe(async function (data) {
        try {
            console.log('Saving GitHub config with passphrase:', {
                configType: typeof data.config,
                configKeys: data.config ? Object.keys(data.config) : 'no keys',
                hasPassphrase: !!(data.passphrase),
                passphraseLength: data.passphrase?.length || 0
            });
            
            await saveGitHubConfigToCredentials(data.config, data.passphrase);
            console.log('GitHub config saved successfully with passphrase');
        } catch (error) {
            console.error('Failed to save GitHub config with passphrase:', error);
        }
    });

    app.ports.loadGitHubConfig.subscribe(async function () {
        try {
            console.log('Loading GitHub config...');
            const config = await loadGitHubConfigFromCredentials();
            if (config) {
                if (config.requiresPassphrase) {
                    // Send a special signal that passphrase is required
                    app.ports.gitHubConfigLoaded.send({
                        repositoryUrl: '',
                        personalAccessToken: '',
                        lastSyncTime: 0,
                        lastSyncRef: '',
                        enabled: false,
                        requiresPassphrase: true
                    });
                } else {
                    app.ports.gitHubConfigLoaded.send(config);
                }
            } else {
                // Send empty config if none exists
                console.log('No config found, sending empty config');
                app.ports.gitHubConfigLoaded.send({
                    repositoryUrl: '',
                    personalAccessToken: '',
                    lastSyncTime: 0,
                    lastSyncRef: '',
                    enabled: false
                });
            }
        } catch (error) {
            console.error('Failed to load GitHub config:', error);
            // Send empty config on error
            app.ports.gitHubConfigLoaded.send({
                repositoryUrl: '',
                personalAccessToken: '',
                lastSyncTime: 0,
                lastSyncRef: '',
                enabled: false,
                error: error.message
            });
        }
    });

    app.ports.loadGitHubConfigWithPassphrase.subscribe(async function (passphrase) {
        try {
            console.log('Loading GitHub config with passphrase...');
            const { setSessionPassphrase } = getStorageUtils();
            
            const config = await loadGitHubConfigFromCredentials(passphrase);
            if (config && !config.requiresPassphrase) {
                // Store the passphrase in session for note operations
                setSessionPassphrase(passphrase);
                console.log('GitHub config loaded successfully with passphrase');
                app.ports.gitHubConfigLoaded.send(config);
            } else if (config && config.requiresPassphrase) {
                // Still requires passphrase - wrong passphrase provided
                app.ports.gitHubConfigLoaded.send({
                    repositoryUrl: '',
                    personalAccessToken: '',
                    lastSyncTime: 0,
                    lastSyncRef: '',
                    enabled: false,
                    requiresPassphrase: true,
                    error: 'Invalid passphrase'
                });
            } else {
                // No config found
                app.ports.gitHubConfigLoaded.send({
                    repositoryUrl: '',
                    personalAccessToken: '',
                    lastSyncTime: 0,
                    lastSyncRef: '',
                    enabled: false
                });
            }
        } catch (error) {
            console.error('Failed to load GitHub config with passphrase:', error);
            app.ports.gitHubConfigLoaded.send({
                repositoryUrl: '',
                personalAccessToken: '',
                lastSyncTime: 0,
                lastSyncRef: '',
                enabled: false,
                error: error.message
            });
        }
    });

    // Encryption/Decryption ports
    app.ports.encryptWithPassphrase.subscribe(async function (data) {
        try {
            const { encryptText } = getCryptoUtils();
            const encryptedToken = await encryptText(data.text, data.passphrase);
            app.ports.encryptionCompleted.send({ success: true, result: encryptedToken });
        } catch (error) {
            console.error('Encryption failed:', error);
            app.ports.encryptionCompleted.send({ success: false, error: error.message });
        }
    });

    app.ports.decryptWithPassphrase.subscribe(async function (data) {
        try {
            const { secureLog } = getSecurityUtils();
            const { decryptText } = getCryptoUtils();
            const { setSessionPassphrase } = getStorageUtils();

            secureLog.log('Decryption port called with data:', {
                encryptedTextLength: data.encryptedText ? data.encryptedText.length : 'undefined',
                passphraseProvided: !!data.passphrase,
                passphraseLength: data.passphrase ? data.passphrase.length : 0,
                encryptedTextSample: data.encryptedText ? data.encryptedText.substring(0, 50) + '...' : 'undefined'
            });

            const decryptedToken = await decryptText(data.encryptedText, data.passphrase);
            
            // Store the passphrase in session for note encryption/decryption
            setSessionPassphrase(data.passphrase);
            
            secureLog.log('Decryption successful, token length:', decryptedToken.length);
            secureLog.log('Session passphrase stored for note operations');
            
            app.ports.decryptionCompleted.send({ success: true, result: decryptedToken });
        } catch (error) {
            const { secureLog } = getSecurityUtils();
            secureLog.error('Decryption failed:', error);
            app.ports.decryptionCompleted.send({ success: false, error: error.message });
        }
    });

    // Set session passphrase port
    app.ports.setSessionPassphrase.subscribe(function (passphrase) {
        try {
            console.log('🔑 setSessionPassphrase port called with passphrase length:', passphrase.length);
            const { setSessionPassphrase } = getStorageUtils();
            setSessionPassphrase(passphrase);
            console.log('✅ Session passphrase set for note encryption/decryption');
        } catch (error) {
            console.error('❌ Failed to set session passphrase:', error);
        }
    });

    // Content processing ports
    app.ports.clearMermaidDiagrams.subscribe(function () {
        console.log('Clearing mermaid diagrams via Elm port...');
        const { clearMermaidDiagrams } = getContentProcessor();
        clearMermaidDiagrams();
    });

    app.ports.insertNoteLinkText.subscribe(function (completionText) {
        console.log('Inserting note link completion text:', completionText);
        const { insertTextAtCursor } = getContentProcessor();
        insertTextAtCursor(completionText);
    });

    app.ports.getCursorPosition.subscribe(function () {
        console.log('Getting cursor position...');
        const { getCursorPosition } = getContentProcessor();
        const position = getCursorPosition();
        app.ports.cursorPositionReceived.send(position);
    });

    app.ports.getCursorCharacterPosition.subscribe(function () {
        console.log('Getting cursor character position...');
        const { getCursorCharacterPosition } = getContentProcessor();
        const charPos = getCursorCharacterPosition();
        app.ports.cursorCharacterPositionReceived.send(charPos);
    });

    app.ports.insertTabAtCursor.subscribe(function (tabText) {
        console.log('Inserting tab at cursor:', tabText);
        const { insertTextAtCursor } = getContentProcessor();
        insertTextAtCursor(tabText);
    });

    app.ports.processMarkdownContent.subscribe(function () {
        // Use immediate processing for port calls (user-initiated)
        console.log('Processing markdown content via Elm port...');
        const { processMarkdownContent } = getContentProcessor();

        // Add a very small delay to ensure DOM is updated
        setTimeout(() => {
            processMarkdownContent();
        }, 5);
    });

    // Action tracking ports
    app.ports.deduplicateActions.subscribe(async function (data) {
        try {
            const { encryptedLocalStorageGetItem, encryptedLocalStorageSetItem } = getStorageUtils();
            
            const actionEvent = data.actionEvent;
            const shouldSave = data.shouldSave;
            const removeActionTypes = data.removeActionTypes || [];

            // Get existing action events from encrypted localStorage
            let events = await encryptedLocalStorageGetItem('notez-action-events') || [];

            console.log(`Processing ${data.actionType} action for note ${data.noteId}`, {
                shouldSave,
                removeActionTypes,
                existingEventsCount: events.length
            });

            // Remove specified action types for this note
            if (removeActionTypes.length > 0) {
                const beforeCount = events.length;
                events = events.filter(event =>
                    !(event.noteId === data.noteId && removeActionTypes.includes(event.actionType))
                );
                const removedCount = beforeCount - events.length;
                console.log(`Removed ${removedCount} existing actions of types [${removeActionTypes.join(', ')}] for note ${data.noteId}`);
            }

            // Add the new action if Elm says we should
            if (shouldSave) {
                console.log(`Adding ${data.actionType} action for note ${data.noteId}`);
                events.push(actionEvent);
            } else {
                console.log(`Blocked ${data.actionType} action for note ${data.noteId}`);
            }

            // Keep only the last 1000 events to prevent localStorage from growing too large
            if (events.length > 1000) {
                events.splice(0, events.length - 1000);
            }

            // Save back to encrypted localStorage
            await encryptedLocalStorageSetItem('notez-action-events', events);

            // Send the updated events back to Elm to keep the model in sync
            app.ports.actionEventsLoaded.send(events);

            console.log(`Final events count: ${events.length}`);
        } catch (error) {
            console.error('Failed to process action event:', error);
        }
    });

    // Mobile viewport detection
    app.ports.detectMobileViewport.subscribe(function () {
        const isMobile = window.innerWidth <= 768;
        app.ports.mobileViewportChanged.send(isMobile);
    });

    // Action tracking ports
    app.ports.saveActionCount.subscribe(async function (count) {
        try {
            const { encryptedLocalStorageSetItem } = getStorageUtils();
            await encryptedLocalStorageSetItem('notez-action-count', count);
        } catch (error) {
            console.error('Failed to save action count:', error);
        }
    });

    app.ports.loadActionCount.subscribe(async function () {
        try {
            const { encryptedLocalStorageGetItem } = getStorageUtils();
            const count = await encryptedLocalStorageGetItem('notez-action-count') || 0;
            app.ports.actionCountLoaded.send(count);
        } catch (error) {
            console.error('Failed to load action count:', error);
            app.ports.actionCountLoaded.send(0);
        }
    });

    app.ports.loadActionEvents.subscribe(async function () {
        try {
            const { encryptedLocalStorageGetItem } = getStorageUtils();
            const events = await encryptedLocalStorageGetItem('notez-action-events') || [];
            app.ports.actionEventsLoaded.send(events);
        } catch (error) {
            console.error('Failed to load action events:', error);
            app.ports.actionEventsLoaded.send([]);
        }
    });

    app.ports.clearActionEvents.subscribe(function () {
        try {
            const { removeEncryptedLocalStorageItem } = getStorageUtils();
            console.log('Clearing action events and action count after successful sync');
            removeEncryptedLocalStorageItem('notez-action-events');
            removeEncryptedLocalStorageItem('notez-action-count');

            // Send the reset action count and empty events list back to Elm to update the UI
            app.ports.actionCountLoaded.send(0);
            app.ports.actionEventsLoaded.send([]);
        } catch (error) {
            console.error('Failed to clear action events and count:', error);
        }
    });

    // Note history ports
    app.ports.saveLastOpenNote.subscribe(async function (noteId) {
        try {
            const { encryptedLocalStorageSetItem } = getStorageUtils();
            await encryptedLocalStorageSetItem('notez-last-open-note', noteId);
            console.log('Saved last open note ID:', noteId);
        } catch (error) {
            console.error('Failed to save last open note:', error);
        }
    });

    app.ports.loadLastOpenNote.subscribe(async function () {
        try {
            const { encryptedLocalStorageGetItem } = getStorageUtils();
            console.log('🔍 loadLastOpenNote called');
            const noteId = await encryptedLocalStorageGetItem('notez-last-open-note');
            console.log('🔍 noteId from encrypted localStorage:', noteId);
            if (noteId !== null) {
                console.log('🔍 Loading last open note ID:', noteId);

                // Add a longer delay to ensure notes are loaded first
                setTimeout(() => {
                    console.log('🔍 Sending lastOpenNoteLoaded for note ID:', noteId);
                    app.ports.lastOpenNoteLoaded.send(noteId);
                }, 300);
            } else {
                console.log('🔍 No last open note found in encrypted localStorage');
            }
        } catch (error) {
            console.error('Failed to load last open note:', error);
        }
    });

    app.ports.saveNoteHistory.subscribe(async function (historyData) {
        try {
            const { encryptedLocalStorageSetItem } = getStorageUtils();
            await encryptedLocalStorageSetItem('notez-note-history', historyData);
            console.log('Saved note history:', historyData);
        } catch (error) {
            console.error('Failed to save note history:', error);
        }
    });

    app.ports.loadNoteHistory.subscribe(async function () {
        try {
            const { encryptedLocalStorageGetItem } = getStorageUtils();
            const history = await encryptedLocalStorageGetItem('notez-note-history');
            if (history !== null) {
                console.log('Loading note history:', history);
                app.ports.noteHistoryLoaded.send(history);
            } else {
                console.log('No note history found, starting with empty history');
                app.ports.noteHistoryLoaded.send({ noteHistory: [], historyIndex: 0 });
            }
        } catch (error) {
            console.error('Failed to load note history:', error);
            // Send empty history on error
            app.ports.noteHistoryLoaded.send({ noteHistory: [], historyIndex: 0 });
        }
    });

    // Data management ports
    app.ports.clearAllData.subscribe(async function () {
        console.log('Clearing all data...');

        try {
            const { clearAllData, removeEncryptedLocalStorageItem } = getStorageUtils();

            // Clear IndexedDB using storage module
            await clearAllData();

            // Clear encrypted localStorage items
            removeEncryptedLocalStorageItem('notez-tags');
            removeEncryptedLocalStorageItem('notez-last-open-note');
            removeEncryptedLocalStorageItem('notez-action-events');
            removeEncryptedLocalStorageItem('notez-action-count');
            removeEncryptedLocalStorageItem('notez-note-history');

            // Clear localStorage completely to ensure no data remains
            localStorage.clear();

            // Clear sessionStorage
            sessionStorage.clear();

            // Clear any cached credentials
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
            }

            console.log('All data cleared successfully');
            app.ports.clearDataCompleted.send({ success: true, result: 'Data cleared successfully' });

        } catch (error) {
            console.error('Error clearing data:', error);
            app.ports.clearDataCompleted.send({ success: false, error: error.message });
        }
    });

    // Config import/export ports
    app.ports.exportGitHubConfig.subscribe(async function (config) {
        try {
            const configJson = JSON.stringify(config, null, 2);

            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(configJson);
                console.log('Configuration copied to clipboard');
                app.ports.configExported.send({ success: true, result: 'Configuration copied to clipboard' });
            } else {
                // Fallback for browsers without clipboard API
                const textArea = document.createElement('textarea');
                textArea.value = configJson;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                console.log('Configuration copied to clipboard (fallback method)');
                app.ports.configExported.send({ success: true, result: 'Configuration copied to clipboard' });
            }
        } catch (error) {
            console.error('Error copying configuration to clipboard:', error);
            app.ports.configExported.send({ success: false, error: error.message });
        }
    });

    app.ports.importGitHubConfig.subscribe(async function (configJson) {
        try {
            const { secureLocalStorageSetItem } = getStorageUtils();

            const config = JSON.parse(configJson);

            // Validate the config structure
            if (!config.repositoryUrl || !config.personalAccessToken) {
                throw new Error('Invalid configuration: missing required fields (repositoryUrl or personalAccessToken)');
            }

            // Clean the config: remove sync history from imported configuration
            const cleanConfig = {
                repositoryUrl: config.repositoryUrl,
                personalAccessToken: config.personalAccessToken,
                enabled: config.enabled || false,
                lastSyncTime: 0, // Reset sync time for new instance
                lastSyncRef: '' // Reset sync ref for new instance
            };

            // Store the cleaned imported config
            secureLocalStorageSetItem('notez-github-config', JSON.stringify(cleanConfig));
            console.log('Configuration imported successfully (sync history reset)');

            app.ports.configImported.send({ success: true, result: 'Configuration imported successfully' });

        } catch (error) {
            console.error('Error importing configuration:', error);
            let errorMessage = 'Invalid JSON format';
            if (error.message.includes('missing required fields')) {
                errorMessage = error.message;
            } else if (error instanceof SyntaxError) {
                errorMessage = 'Invalid JSON format: ' + error.message;
            } else {
                errorMessage = error.message;
            }
            app.ports.configImported.send({ success: false, error: errorMessage });
        }
    });

    // GitHub Sync ports
    app.ports.startGitHubSync.subscribe(async function (syncData) {
        try {
            console.log('Starting GitHub sync with data:', syncData);
            console.log('🔧 Debug: window.GitHubSync =', window.GitHubSync);
            console.log('🔧 Debug: typeof window.GitHubSync =', typeof window.GitHubSync);

            const gitHubSync = getGitHubSync();
            const result = await gitHubSync.performGitHubSyncWithEvents(syncData);
            console.log('GitHub sync completed successfully:', result);

            // Clear commit cache to prevent race conditions with background checks
            try {
                await gitHubSync.clearCachedCommitSha(syncData.config.repositoryUrl);
            } catch (cacheError) {
                console.warn('Failed to clear commit cache:', cacheError);
            }

            // Reload notes after sync completion
            try {
                await new Promise(resolve => setTimeout(resolve, 200));
                console.log('Loading notes after sync completion...');

                const { loadNotesFromDB } = getStorageUtils();
                const notes = await loadNotesFromDB();
                console.log(`Sending ${notes.length} notes to Elm app after sync`);
                app.ports.notesLoaded.send(notes);

                // Notify Elm about updated notes so it can refresh the editor if needed
                if (result.updatedNoteIds && result.updatedNoteIds.length > 0) {
                    console.log('📨 Notifying Elm about notes updated during sync');
                    for (const noteId of result.updatedNoteIds) {
                        console.log(`📨 Notifying Elm that note ${noteId} was updated during sync`);
                        app.ports.noteUpdatedDuringSync.send({ noteId: noteId });
                    }
                }

                // Send success message with commit SHA after notes are reloaded
                const syncResult = {
                    message: result.message,
                    commitSha: result.latestCommitSha || null
                };
                app.ports.syncCompleted.send({ tag: 'Ok', contents: JSON.stringify(syncResult) });
            } catch (error) {
                console.error('Failed to reload notes after sync:', error);
                app.ports.syncCompleted.send({ tag: 'Err', contents: 'Sync completed but failed to reload notes: ' + error.message });
            }

        } catch (error) {
            console.error('GitHub sync failed:', error);

            // Check if this is an authentication or permission error
            if (error.message.includes('401') || error.message.includes('403') ||
                error.message.includes('Unauthorized') || error.message.includes('Forbidden') ||
                error.message.includes('Bad credentials') || error.message.includes('authentication')) {
                // Send authentication error through syncFailed port if available
                if (app.ports.syncFailed) {
                    app.ports.syncFailed.send({
                        tag: 'Ok',
                        contents: JSON.stringify({
                            error: error.message,
                            type: 'authentication'
                        })
                    });
                } else {
                    // Fallback for older versions
                    app.ports.syncCompleted.send({ tag: 'Err', contents: error.message });
                }
            } else {
                // Send other errors through syncCompleted port
                app.ports.syncCompleted.send({ tag: 'Err', contents: error.message });
            }
        }
    });

    app.ports.forcePullFromGitHub.subscribe(async function (encodedConfig) {
        try {
            console.log('Starting force pull from GitHub...');

            const gitHubSync = getGitHubSync();

            // Decode the config from Elm
            let config;
            try {
                config = JSON.parse(JSON.stringify(encodedConfig));
                console.log('Decoded config for force pull:', {
                    repositoryUrl: config.repositoryUrl || '[NOT SET]',
                    hasToken: !!(config.personalAccessToken),
                    tokenLength: config.personalAccessToken?.length || 0,
                    enabled: config.enabled
                });
            } catch (error) {
                console.error('Failed to decode force pull config:', error);
                app.ports.syncCompleted.send({ tag: 'Err', contents: 'Failed to decode GitHub configuration for force pull' });
                return;
            }

            const result = await gitHubSync.performForcePullFromGitHub(config);
            console.log('Force pull completed successfully:', result);

            // Clear commit cache to prevent race conditions with background checks
            try {
                await gitHubSync.clearCachedCommitSha(config.repositoryUrl);
            } catch (cacheError) {
                console.warn('Failed to clear commit cache:', cacheError);
            }

            // Reload notes after force pull completion
            try {
                await new Promise(resolve => setTimeout(resolve, 200));
                console.log('Loading notes after force pull completion...');

                const { loadNotesFromDB } = getStorageUtils();
                const notes = await loadNotesFromDB();
                console.log(`Sending ${notes.length} notes to Elm app after force pull`);
                app.ports.notesLoaded.send(notes);

                // For force pull, all notes are potentially updated
                if (result.updatedNotes && result.updatedNotes.length > 0) {
                    console.log('📨 Notifying Elm about all notes updated during force pull');
                    for (const note of result.updatedNotes) {
                        app.ports.noteUpdatedDuringSync.send({ noteId: note.id });
                    }
                }

                // Send success message after notes are reloaded
                const syncResult = {
                    message: result.message,
                    commitSha: result.commitSha,
                };
                app.ports.syncCompleted.send({ tag: 'Ok', contents: JSON.stringify(syncResult) });

                // Send reset action count and empty events back to Elm to update the UI
                app.ports.actionCountLoaded.send(0);
                app.ports.actionEventsLoaded.send([]);
            } catch (error) {
                console.error('Failed to reload notes after force pull:', error);
                app.ports.syncCompleted.send({ tag: 'Err', contents: 'Force pull completed but failed to reload notes: ' + error.message });
            }

        } catch (error) {
            console.error('Force pull failed:', error);

            // Check if this is an authentication or permission error
            if (error.message.includes('401') || error.message.includes('403') ||
                error.message.includes('Unauthorized') || error.message.includes('Forbidden') ||
                error.message.includes('Bad credentials') || error.message.includes('authentication')) {
                // Send authentication error through syncFailed port if available
                if (app.ports.syncFailed) {
                    app.ports.syncFailed.send({
                        tag: 'Ok',
                        contents: JSON.stringify({
                            error: error.message,
                            type: 'authentication'
                        })
                    });
                } else {
                    // Fallback for older versions
                    app.ports.syncCompleted.send({ tag: 'Err', contents: error.message });
                }
            } else {
                // Send other errors through syncCompleted port
                app.ports.syncCompleted.send({ tag: 'Err', contents: error.message });
            }
        }
    });

    // Mobile UI ports
    app.ports.setMobileNotesBrowserOpen.subscribe(function (isOpen) {
        if (isOpen) {
            document.body.classList.add('mobile-notes-browser-open');
        } else {
            document.body.classList.remove('mobile-notes-browser-open');
        }
    });

    console.log('✅ All port subscriptions set up successfully');
}

// Initialize the application
async function initializeApp() {
    try {
        // Initialize database
        const { initDB } = getStorageUtils();
        await initDB();
        console.log('✅ Database initialized successfully');

        // Initialize content processing libraries
        const { initializeMermaid, initializeSyntaxHighlighting } = getContentProcessor();
        initializeMermaid();
        initializeSyntaxHighlighting();

        // Initialize PWA features
        window.PWAUtils.initializeServiceWorker();

        // Initialize Elm application
        initializeElmApp();

        // Set up content processing observer
        setupContentProcessingObserver();

        // Initial mobile detection
        const initialIsMobile = window.innerWidth <= 768;
        app.ports.mobileViewportChanged.send(initialIsMobile);

        console.log('✅ Application initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize application:', error);
    }
}

// Set up content processing with MutationObserver
function setupContentProcessingObserver() {
    const { debounce, processMarkdownContent } = getContentProcessor();
    const debouncedProcess = debounce(processMarkdownContent, 50);

    // Set up a MutationObserver to watch for content changes
    const observer = new MutationObserver((mutations) => {
        let shouldProcess = false;
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        if (node.classList && (
                            node.classList.contains('markdown-content') ||
                            node.classList.contains('markdown-preview-container') ||
                            node.classList.contains('markdown-preview-pane') ||
                            node.classList.contains('note-content-box')
                        )) {
                            shouldProcess = true;
                        } else if (node.querySelector && (
                            node.querySelector('.code-block') ||
                            node.querySelector('.mermaid-diagram') ||
                            node.querySelector('.markdown-content')
                        )) {
                            shouldProcess = true;
                        }
                    }
                });
            } else if (mutation.type === 'attributes' &&
                mutation.target.classList &&
                mutation.target.classList.contains('markdown-content')) {
                shouldProcess = true;
            }
        });

        if (shouldProcess) {
            debouncedProcess();
        }
    });

    // Start observing when the page is loaded
    document.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Initial processing
        processMarkdownContent();
    });

    // Set up window resize listener for mobile viewport changes
    let resizeTimeout;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (app && app.ports.mobileViewportChanged) {
                const isMobile = window.innerWidth <= 768;
                app.ports.mobileViewportChanged.send(isMobile);
            }
        }, 100); // Debounce resize events
    });
}

// Debug function for manual testing (can be called from browser console)
window.debugGitHubConfig = async function () {
    console.log('=== GitHub Configuration Debug ===');

    try {
        const securityUtils = getSecurityUtils();
        const storageUtils = getStorageUtils();
        const cryptoUtils = getCryptoUtils();

        // Test Credentials API
        console.log('\n1. Testing Credentials API...');
        await securityUtils.testCredentialsAPI();

        // Check localStorage fallback
        console.log('\n2. Checking localStorage fallback...');
        const fallbackConfig = storageUtils.loadGitHubConfigFromLocalStorage();
        console.log('Fallback config:', fallbackConfig ? {
            repositoryUrl: fallbackConfig.repositoryUrl || '[NOT SET]',
            hasToken: !!(fallbackConfig.personalAccessToken),
            tokenLength: fallbackConfig.personalAccessToken?.length || 0,
            tokenIsEncrypted: cryptoUtils.isTokenEncrypted(fallbackConfig.personalAccessToken),
            enabled: fallbackConfig.enabled
        } : 'No fallback config found');

        // Check public config in localStorage
        console.log('\n3. Checking public config in localStorage...');
        const publicConfigStr = localStorage.getItem('notez-github-config');
        if (publicConfigStr) {
            try {
                const publicConfig = JSON.parse(publicConfigStr);
                console.log('Public config:', {
                    repositoryUrl: publicConfig.repositoryUrl || '[NOT SET]',
                    hasToken: !!(publicConfig.personalAccessToken),
                    tokenLength: publicConfig.personalAccessToken?.length || 0,
                    tokenIsEncrypted: cryptoUtils.isTokenEncrypted(publicConfig.personalAccessToken),
                    enabled: publicConfig.enabled,
                    lastSyncTime: publicConfig.lastSyncTime,
                    lastSyncRef: publicConfig.lastSyncRef || '[NOT SET]'
                });
            } catch (error) {
                console.log('Error parsing public config:', error);
            }
        } else {
            console.log('No public config found');
        }

        // Try to load the complete configuration
        console.log('\n4. Loading complete configuration...');
        const completeConfig = await storageUtils.loadGitHubConfigFromCredentials();
        console.log('Complete config result:', completeConfig ? {
            repositoryUrl: completeConfig.repositoryUrl || '[NOT SET]',
            hasToken: !!(completeConfig.personalAccessToken),
            tokenLength: completeConfig.personalAccessToken?.length || 0,
            tokenIsEncrypted: cryptoUtils.isTokenEncrypted(completeConfig.personalAccessToken),
            enabled: completeConfig.enabled,
            lastSyncTime: completeConfig.lastSyncTime,
            lastSyncRef: completeConfig.lastSyncRef || '[NOT SET]'
        } : 'No configuration loaded');

        console.log('\n=== Security Check Results ===');
        if (completeConfig && completeConfig.personalAccessToken) {
            if (cryptoUtils.isTokenEncrypted(completeConfig.personalAccessToken)) {
                console.log('✅ Token is properly encrypted in storage');
            } else {
                console.error('❌ SECURITY ISSUE: Token is stored in plain text!');
            }
        } else {
            console.log('ℹ️ No token found in storage');
        }

        console.log('\n=== Debug Complete ===');
        return completeConfig;

    } catch (error) {
        console.error('Debug function failed:', error);
        console.log('This may be due to missing modules. Ensure all JS modules are loaded.');
        return null;
    }
};

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}