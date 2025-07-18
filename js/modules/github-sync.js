/**
 * GitHub Sync Module - Handles GitHub API integration and sync operations
 * Extracted from the original monolithic index.html for better organization
 */

// Cache constants
const COMMIT_CACHE_KEY = 'notez-commit-cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to get storage utilities
function getStorageUtils() {
    if (!window.StorageUtils) {
        throw new Error('StorageUtils module not loaded');
    }
    return window.StorageUtils;
}

// Generate integrity hash for cache entry
async function generateCacheHash(data) {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(JSON.stringify(data)));
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify cache entry integrity
async function verifyCacheIntegrity(entry) {
    try {
        const dataToHash = { sha: entry.sha, timestamp: entry.timestamp };
        const expectedHash = await generateCacheHash(dataToHash);
        return entry.integrity === expectedHash;
    } catch (error) {
        console.error('Error verifying cache integrity:', error);
        return false;
    }
}

// Get cached commit SHA for a repository
async function getCachedCommitSha(repoUrl) {
    try {
        const { encryptedLocalStorageGetItem, encryptedLocalStorageSetItem } = getStorageUtils();
        const cache = await encryptedLocalStorageGetItem(COMMIT_CACHE_KEY) || {};
        const entry = cache[repoUrl];

        if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
            // Verify cache integrity
            if (entry.integrity && await verifyCacheIntegrity(entry)) {
                return entry.sha;
            } else {
                console.warn('Cache integrity check failed, removing corrupted entry');
                delete cache[repoUrl];
                await encryptedLocalStorageSetItem(COMMIT_CACHE_KEY, cache);
            }
        }
    } catch (error) {
        console.error('Error reading commit cache:', error);
    }
    return null;
}

// Set cached commit SHA for a repository
async function setCachedCommitSha(repoUrl, sha) {
    try {
        const { encryptedLocalStorageGetItem, encryptedLocalStorageSetItem } = getStorageUtils();
        const cache = await encryptedLocalStorageGetItem(COMMIT_CACHE_KEY) || {};
        const timestamp = Date.now();
        const dataToHash = { sha, timestamp };
        const integrity = await generateCacheHash(dataToHash);

        cache[repoUrl] = { sha, timestamp, integrity };
        await encryptedLocalStorageSetItem(COMMIT_CACHE_KEY, cache);
    } catch (error) {
        console.error('Error writing commit cache:', error);
    }
}

// Clear commit cache for a specific repository to force fresh API calls
async function clearCachedCommitSha(repoUrl) {
    try {
        const { encryptedLocalStorageGetItem, encryptedLocalStorageSetItem } = getStorageUtils();
        const cache = await encryptedLocalStorageGetItem(COMMIT_CACHE_KEY) || {};
        if (cache[repoUrl]) {
            delete cache[repoUrl];
            await encryptedLocalStorageSetItem(COMMIT_CACHE_KEY, cache);
        }
    } catch (error) {
        console.error('Error clearing commit cache:', error);
    }
}

// Helper function to get authorization header
function getAuthorizationHeader(token) {
    return token.startsWith('ghp_') ? `token ${token}` : `Bearer ${token}`;
}

// Compare commits between two refs
async function compareCommits(repositoryUrl, token, baseCommit, headCommit) {
    try {
        const url = new URL(repositoryUrl);
        const pathParts = url.pathname.split('/').filter(part => part.length > 0);
        const owner = pathParts[0];
        const repo = pathParts[1];
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/compare/${baseCommit}...${headCommit}`;

        const headers = {
            'Authorization': getAuthorizationHeader(token),
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28'
        };

        const response = await fetch(apiUrl, { method: 'GET', headers: headers });
        if (!response.ok) {
            throw new Error(`Failed to compare commits: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error comparing commits:', error);
        throw error;
    }
}

// GitHub sync functionality
window.GitHubSync = {
    // Main sync function that handles incremental updates based on action events
    // 
    // SYNC REF FIX: This function now correctly handles the lastSyncRef by:
    // 1. Pulling remote changes first
    // 2. Pushing local changes and collecting commit SHAs from each push operation
    // 3. Using the final commit SHA from the last push as the lastSyncRef
    //    instead of trying to fetch the remote HEAD (which had race conditions)
    //
    // This ensures that the lastSyncRef always represents the final state after 
    // all local changes have been pushed, eliminating the sync issue.
    async performGitHubSyncWithEvents(syncData) {
        try {
            const config = syncData.config;
            const actionEvents = syncData.actionEvents || [];

            console.log('Starting GitHub sync...');

            if (actionEvents.length === 0) {
                console.log('No action events to process - sync will only pull remote changes');
            }

            // Security check: Verify we're working with a decrypted token for sync
            if (config.personalAccessToken && window.CryptoUtils.isTokenEncrypted(config.personalAccessToken)) {
                throw new Error('Cannot sync with encrypted token - token must be decrypted for API calls');
            }

            // Reminder: This token is temporarily decrypted ONLY for this sync operation
            // It should NEVER be saved back to storage in this state

            // For now, implement a basic sync that pulls remote changes
            // This is a simplified version to get sync working
            let finalRemoteRef = null;
            const updatedNoteIds = [];

            // Step 1: Get current remote HEAD
            try {
                finalRemoteRef = await this.getLatestCommitSha(config.repositoryUrl, config.personalAccessToken, 'main', true);
            } catch (error) {
                console.warn('Could not get remote HEAD:', error.message);
                finalRemoteRef = config.lastSyncRef; // Use last known ref as fallback
            }

            // Step 2: Check for incremental remote changes
            let hasRemoteChanges = false;
            if (config.lastSyncRef && config.lastSyncRef !== finalRemoteRef) {
                console.log('Remote changes detected');
                hasRemoteChanges = true;
            } else if (!config.lastSyncRef) {
                console.log('No previous sync reference, treating as initial sync');
                hasRemoteChanges = true;
            }

            // Step 3: Pull remote changes if any
            if (hasRemoteChanges) {
                try {
                    console.log('Pulling changes from remote...');
                    const incrementalChanges = await this.fetchChangedNotesSinceLastSync(config);

                    if (incrementalChanges.hasChanges) {
                        console.log(`Found ${incrementalChanges.changedNotes.length} changed notes and ${incrementalChanges.deletedFiles.length} deleted files`);

                        // Apply changes to local storage
                        const localNotes = await window.StorageUtils.loadNotesFromDB();
                        const mergedNotes = [...localNotes];

                        // Process changed/added notes
                        for (const remoteNote of incrementalChanges.changedNotes) {
                            const localNoteIndex = mergedNotes.findIndex(local => local.id === remoteNote.id);
                            if (localNoteIndex === -1) {
                                // New note from remote
                                mergedNotes.push({ ...remoteNote });
                                updatedNoteIds.push(remoteNote.id);
                            } else {
                                // Check if remote is newer
                                const localNote = mergedNotes[localNoteIndex];
                                if (Number(remoteNote.editedAt) > Number(localNote.editedAt)) {
                                    mergedNotes[localNoteIndex] = { ...remoteNote };
                                    updatedNoteIds.push(remoteNote.id);
                                }
                            }
                        }

                        // Process deleted files
                        for (const deletedFile of incrementalChanges.deletedFiles) {
                            const match = deletedFile.match(/_(\d+)\.md$/);
                            if (match) {
                                const noteId = parseInt(match[1]);
                                const noteIndex = mergedNotes.findIndex(note => note.id === noteId);
                                if (noteIndex !== -1) {
                                    mergedNotes.splice(noteIndex, 1);
                                }
                            }
                        }

                        // Save merged notes
                        await window.StorageUtils.saveNotesToDB(mergedNotes, true);
                        console.log('Successfully applied remote changes');
                    }
                } catch (error) {
                    console.error('Failed to pull remote changes:', error);
                    // Continue with sync even if pull fails
                }
            }

            // Step 4: Push local changes to GitHub
            let pushResults = { pushedCount: 0, errors: [], commitShas: [], lastCommitSha: null };
            if (actionEvents.length > 0) {
                try {
                    // Get current local notes for push operations
                    const localNotes = await window.StorageUtils.loadNotesFromDB();

                    // Push local changes to GitHub
                    pushResults = await this.pushLocalChangesToGitHub(config, actionEvents, localNotes);

                    if (pushResults.errors.length > 0) {
                        console.warn(`Some push operations failed:`, pushResults.errors);
                    }

                    // Use the commit SHA from the final push operation as our sync reference
                    if (pushResults.pushedCount > 0 && pushResults.lastCommitSha) {
                        finalRemoteRef = pushResults.lastCommitSha;
                        console.log(`✅ Using final push commit SHA as lastSyncRef: ${finalRemoteRef}`);
                    } else {
                        // Fallback: If we don't have a commit SHA from push, try to get remote HEAD
                        try {
                            finalRemoteRef = await this.getLatestCommitSha(config.repositoryUrl, config.personalAccessToken, 'main', true);
                            console.log(`⚠️  Fallback: Using remote HEAD as lastSyncRef: ${finalRemoteRef}`);
                        } catch (error) {
                            console.warn('Could not get updated remote HEAD after push:', error.message);
                            // Continue with existing finalRemoteRef
                        }
                    }

                } catch (error) {
                    console.error('Failed to push local changes to GitHub:', error);
                    // Don't fail the entire sync if push fails - we still pulled remote changes
                    pushResults.errors.push({ error: error.message });
                }
            }

            const resultMessage = this.buildSyncResultMessage(hasRemoteChanges, pushResults, updatedNoteIds);

            return {
                message: resultMessage,
                latestCommitSha: finalRemoteRef,
                updatedNoteIds: updatedNoteIds
            };

        } catch (error) {
            console.error('GitHub sync with events failed:', error);
            throw new Error('Sync failed: ' + error.message);
        }
    },

    // Force pull function that overwrites local notes with remote content
    async performForcePullFromGitHub(config) {
        try {
            console.log('Starting force pull from GitHub repository:', config.repositoryUrl);

            // Security check: Verify we're working with a decrypted token
            if (config.personalAccessToken && window.CryptoUtils.isTokenEncrypted(config.personalAccessToken)) {
                throw new Error('Cannot force pull with encrypted token - token must be decrypted for API calls');
            }

            // Step 1: Pull all notes from GitHub
            console.log('Pulling notes from GitHub...');
            let remoteNotes = [];
            try {
                remoteNotes = await this.pullNotesFromGitHub(config);
                console.log(`Successfully pulled ${remoteNotes.length} notes from GitHub`);
            } catch (error) {
                console.log('No existing notes found in repository or error pulling:', error.message);
                // For empty repositories, we'll just clear local notes
                remoteNotes = [];
            }

            // Step 2: Clear all local notes (delete everything)
            console.log('Clearing all local notes...');
            try {
                await window.StorageUtils.saveNotesToDB([], true);  // Mark as sync operation
                console.log('Local notes cleared successfully');
            } catch (error) {
                console.error('Failed to clear local notes:', error);
                throw new Error('Force pull failed: Unable to clear local notes - ' + error.message);
            }

            // Step 3: Save the remote notes as local notes (recreate everything from remote)
            if (remoteNotes.length > 0) {
                console.log(`Saving ${remoteNotes.length} notes from remote repository...`);
                try {
                    await window.StorageUtils.saveNotesToDB(remoteNotes, true);  // Mark as sync operation
                    console.log('Successfully recreated all notes from remote repository');
                } catch (error) {
                    console.error('Failed to save remote notes:', error);
                    throw new Error('Force pull failed: Unable to save remote notes - ' + error.message);
                }
            } else {
                console.log('No notes found in remote repository - local storage is now empty');
            }

            // Step 4: Clear all action events since we've just done a complete reset
            console.log('Clearing action events after force pull...');
            const { removeEncryptedLocalStorageItem } = getStorageUtils();
            removeEncryptedLocalStorageItem('notez-action-events');
            removeEncryptedLocalStorageItem('notez-action-count');

            // Step 5: Get the current remote HEAD to return as the sync reference
            let finalRemoteRef = null;
            try {
                finalRemoteRef = await this.getLatestCommitSha(config.repositoryUrl, config.personalAccessToken, 'main', true);
            } catch (error) {
                console.warn('Could not get current remote HEAD after force pull:', error.message);
                // For force pull, we don't have a fallback since we didn't make any commits
                finalRemoteRef = null;
            }

            // Return success message
            const message = remoteNotes.length > 0
                ? `Force pull completed: Deleted all local notes and recreated ${remoteNotes.length} notes from repository`
                : 'Force pull completed: Deleted all local notes (remote repository is empty)';

            return {
                message: message,
                commitSha: finalRemoteRef, // Return the current remote HEAD as the sync reference
                updatedNotes: remoteNotes // Return the notes so caller can notify about updates
            };

        } catch (error) {
            console.error('Force pull from GitHub failed:', error);
            throw new Error('Force pull failed: ' + error.message);
        }
    },

    // Function to fetch only changed markdown files since last sync
    async fetchChangedNotesSinceLastSync(config) {
        try {
            if (!config.lastSyncRef) {
                console.log('❌ No last sync reference found, performing full sync');
                const fullNotes = await this.pullNotesFromGitHub(config);
                return { changedNotes: fullNotes, deletedFiles: [], hasChanges: fullNotes.length > 0 };
            }

            console.log(`🔍 Checking for upstream changes since last sync: ${config.lastSyncRef}`);

            // Step 1: Get current HEAD ref to check if there are ANY upstream changes
            // Force refresh to ensure we get the latest commit SHA, not cached
            const currentRef = await this.getLatestCommitSha(config.repositoryUrl, config.personalAccessToken, 'main', true);
            console.log(`📍 Current remote HEAD: ${currentRef}`);

            if (config.lastSyncRef === currentRef) {
                console.log('✅ Repository unchanged since last sync - no upstream changes detected');
                console.log('📝 This is the correct behavior - incremental sync working as intended');
                return { changedNotes: [], deletedFiles: [], hasChanges: false };
            }

            console.log(`🚀 Upstream changes detected! Performing INCREMENTAL sync from ${config.lastSyncRef} to ${currentRef}`);
            console.log(`📊 This will fetch ONLY the files that changed, not the entire repository`);

            // Step 2: Compare commits to get ONLY the files that changed between lastSyncRef and currentRef
            console.log('Comparing commits to identify changed files...');
            const comparison = await this.compareCommits(config.repositoryUrl, config.personalAccessToken, config.lastSyncRef, currentRef);

            console.log('📋 Commit comparison result:', {
                totalFiles: comparison.files ? comparison.files.length : 0,
                commits: comparison.commits ? comparison.commits.length : 0,
                files: comparison.files ? comparison.files.map(f => ({ name: f.filename, status: f.status })) : []
            });

            // Step 3: Filter for markdown files only
            const changedMarkdownFiles = comparison.files.filter(file =>
                file.filename.endsWith('.md') &&
                (file.status === 'added' || file.status === 'modified')
            );

            const deletedMarkdownFiles = comparison.files.filter(file =>
                file.filename.endsWith('.md') && file.status === 'removed'
            );

            console.log(`📄 Filtered results: ${changedMarkdownFiles.length} changed and ${deletedMarkdownFiles.length} deleted markdown files since last sync`);
            console.log('Changed markdown files:', changedMarkdownFiles.map(f => ({ name: f.filename, status: f.status })));
            console.log('Deleted markdown files:', deletedMarkdownFiles.map(f => ({ name: f.filename, status: f.status })));

            // Step 4: Fetch content for each changed markdown file (only the ones that changed!)
            const changedNotes = [];
            const url = new URL(config.repositoryUrl);
            const pathParts = url.pathname.split('/').filter(part => part.length > 0);
            const owner = pathParts[0];
            const repo = pathParts[1];
            const apiBase = `https://api.github.com/repos/${owner}/${repo}`;

            const headers = {
                'Authorization': this.getAuthorizationHeader(config.personalAccessToken),
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28'
            };

            console.log('Fetching content for changed files...');
            for (const file of changedMarkdownFiles) {
                try {
                    console.log(`Fetching content for changed file: ${file.filename}`);
                    const encodedFilePath = encodeURIComponent(file.filename);
                    const fileContentResponse = await fetch(`${apiBase}/contents/${encodedFilePath}`, {
                        method: 'GET',
                        headers: headers
                    });

                    if (fileContentResponse.ok) {
                        const fileData = await fileContentResponse.json();
                        const content = atob(fileData.content.replace(/\s/g, ''));
                        console.log(`📄 Fetched content for ${file.filename}, length: ${content.length}`);
                        const note = this.parseMarkdownNote(content, file.filename);
                        if (note) {
                            changedNotes.push(note);
                            console.log(`✅ Successfully parsed and added changed note: ${note.title} (ID: ${note.id})`);
                        } else {
                            console.warn(`⚠️  Failed to parse note from ${file.filename}`);
                        }
                    } else {
                        console.error(`Failed to fetch content for ${file.filename}: ${fileContentResponse.status}`);
                    }
                } catch (error) {
                    console.error(`Error fetching file ${file.filename}:`, error);
                }
            }

            console.log(`✅ Successfully fetched and parsed ${changedNotes.length} changed notes from upstream`);
            console.log('Changed notes:', changedNotes.map(note => ({ id: note.id, title: note.title })));

            return {
                changedNotes,
                deletedFiles: deletedMarkdownFiles.map(f => f.filename),
                hasChanges: changedNotes.length > 0 || deletedMarkdownFiles.length > 0
            };

        } catch (error) {
            console.error('❌ Error during incremental sync:', error);

            // Provide specific error handling for common issues
            if (error.message.includes('404')) {
                console.warn('⚠️  Repository or branch not found - this may be a new repository');
            } else if (error.message.includes('403')) {
                console.warn('⚠️  API rate limit or authorization issue detected');
            } else if (error.message.includes('Invalid last sync reference')) {
                console.warn('⚠️  Last sync reference is invalid - repository history may have been rewritten');
            }

            // Only fall back to full sync in extreme cases
            console.error(`💥 INCREMENTAL SYNC FAILED - this should be rare!`);
            console.log('🔄 Falling back to full sync as last resort (this defeats the purpose of incremental sync)');
            try {
                const fullNotes = await this.pullNotesFromGitHub(config);
                console.log(`⚠️  Fallback complete: fetched ${fullNotes.length} notes via FULL sync (this is slow!)`);
                return { changedNotes: fullNotes, deletedFiles: [], hasChanges: fullNotes.length > 0 };
            } catch (fullSyncError) {
                console.error('❌ Full sync fallback also failed:', fullSyncError);
                // Return empty result if both incremental and full sync fail
                return { changedNotes: [], deletedFiles: [], hasChanges: false };
            }
        }
    },

    // Helper function to get authorization header
    getAuthorizationHeader(token) {
        // GitHub tokens can be either classic PATs (ghp_) or fine-grained PATs (github_pat_)
        return `token ${token}`;
    },

    // Helper function to clear cached commit SHA
    async clearCachedCommitSha(repositoryUrl) {
        try {
            const { encryptedLocalStorageGetItem, encryptedLocalStorageSetItem } = getStorageUtils();
            const cache = await encryptedLocalStorageGetItem(COMMIT_CACHE_KEY) || {};
            if (cache[repositoryUrl]) {
                delete cache[repositoryUrl];
                await encryptedLocalStorageSetItem(COMMIT_CACHE_KEY, cache);
                console.log(`🗑️  Cleared commit cache for ${repositoryUrl}`);
            }
        } catch (error) {
            console.error('Error clearing commit cache:', error);
        }
    },

    // Helper function to pull notes from GitHub repository
    async pullNotesFromGitHub(config) {
        try {
            const url = new URL(config.repositoryUrl);
            const pathParts = url.pathname.split('/').filter(part => part.length > 0);

            if (pathParts.length < 2) {
                throw new Error('Invalid repository URL format');
            }

            const owner = pathParts[0];
            const repo = pathParts[1];
            const apiBase = `https://api.github.com/repos/${owner}/${repo}`;

            const headers = {
                'Authorization': this.getAuthorizationHeader(config.personalAccessToken),
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28'
            };

            console.log(`Attempting to fetch contents from: ${apiBase}/contents`);

            // First, check if the repository exists by fetching repo info
            try {
                const repoResponse = await fetch(apiBase, {
                    method: 'GET',
                    headers: headers
                });

                if (!repoResponse.ok) {
                    if (repoResponse.status === 404) {
                        throw new Error(`Repository '${owner}/${repo}' not found. Please check the repository URL.`);
                    } else if (repoResponse.status === 403) {
                        throw new Error(`Access denied to repository '${owner}/${repo}'. Please check your token permissions.`);
                    }
                    throw new Error(`Failed to access repository: ${repoResponse.status}`);
                }
                console.log(`Repository ${owner}/${repo} exists and is accessible`);
            } catch (repoError) {
                throw new Error(`Repository access failed: ${repoError.message}`);
            }

            // Fetch repository contents
            const contentsResponse = await fetch(`${apiBase}/contents`, {
                method: 'GET',
                headers: headers
            });

            if (!contentsResponse.ok) {
                if (contentsResponse.status === 403) {
                    throw new Error(`Access denied. Please ensure your token has 'Contents' repository permissions.`);
                } else if (contentsResponse.status === 404) {
                    // Repository exists but is empty or path doesn't exist - this is okay for first sync
                    console.log('Repository appears to be empty - treating as no existing notes');
                    return [];
                }
                throw new Error(`Failed to fetch repository contents: ${contentsResponse.status}`);
            }

            const files = await contentsResponse.json();
            const markdownFiles = files.filter(file => file.name.endsWith('.md') && file.type === 'file');

            console.log(`Found ${markdownFiles.length} markdown files in repository`);

            // Fetch content of each markdown file
            const remoteNotes = [];
            for (const file of markdownFiles) {
                try {
                    // URL encode the file path to handle any special characters
                    const encodedFilePath = encodeURIComponent(file.path);

                    // For private repositories, we need to use the API endpoint with authentication
                    // instead of the raw download_url which may not work for private repos
                    const fileContentResponse = await fetch(`${apiBase}/contents/${encodedFilePath}`, {
                        method: 'GET',
                        headers: headers
                    });

                    if (fileContentResponse.ok) {
                        const fileData = await fileContentResponse.json();
                        // GitHub API returns base64 encoded content
                        try {
                            const content = atob(fileData.content.replace(/\s/g, ''));
                            const note = this.parseMarkdownNote(content, file.name);
                            if (note) {
                                remoteNotes.push(note);
                            }
                        } catch (decodeError) {
                            console.error(`Failed to decode content for ${file.name}:`, decodeError);
                        }
                    } else {
                        console.error(`Failed to fetch content for ${file.name}: ${fileContentResponse.status}`);
                    }
                } catch (error) {
                    console.error(`Error fetching file ${file.name}:`, error);
                }
            }

            return remoteNotes;

        } catch (error) {
            console.error('Error pulling notes from GitHub:', error);
            throw error;
        }
    },

    // Helper function to parse markdown note content
    parseMarkdownNote(content, filename) {
        try {
            const lines = content.split('\n');
            if (lines[0] !== '---') {
                return null; // No frontmatter
            }

            let frontmatterEnd = -1;
            for (let i = 1; i < lines.length; i++) {
                if (lines[i] === '---') {
                    frontmatterEnd = i;
                    break;
                }
            }

            if (frontmatterEnd === -1) {
                return null; // Malformed frontmatter
            }

            // Parse frontmatter
            const frontmatterLines = lines.slice(1, frontmatterEnd);
            const metadata = {};

            for (const line of frontmatterLines) {
                const colonIndex = line.indexOf(':');
                if (colonIndex > 0) {
                    const key = line.substring(0, colonIndex).trim();
                    const value = line.substring(colonIndex + 1).trim().replace(/^"(.*)"$/, '$1');
                    metadata[key] = value;
                }
            }

            // Extract content after frontmatter
            const noteContent = lines.slice(frontmatterEnd + 1).join('\n').trim();

            // Parse tags if they exist
            let tags = [];
            if (metadata.tags) {
                // Remove brackets and split by comma
                const tagString = metadata.tags.replace(/[\[\]]/g, '');
                if (tagString.trim()) {
                    tags = tagString.split(',').map(tag => ({
                        name: tag.trim().replace(/^"(.*)"$/, '$1')
                    }));
                }
            }

            return {
                id: parseInt(metadata.uniqueId) || Date.now(),
                title: metadata.title || 'Untitled',
                content: noteContent,
                createdAt: metadata.created ? new Date(metadata.created).getTime() : Date.now(),
                editedAt: metadata.modified ? new Date(metadata.modified).getTime() : (metadata.created ? new Date(metadata.created).getTime() : Date.now()),
                tags: tags
            };

        } catch (error) {
            console.error('Error parsing markdown note:', error);
            return null;
        }
    },

    // Helper function to get latest commit SHA
    async getLatestCommitSha(repositoryUrl, token, branch = 'main', bypassCache = false) {
        try {
            const url = new URL(repositoryUrl);
            const pathParts = url.pathname.split('/').filter(part => part.length > 0);

            if (pathParts.length < 2) {
                throw new Error('Invalid repository URL format');
            }

            const owner = pathParts[0];
            const repo = pathParts[1];
            const apiUrl = `https://api.github.com/repos/${owner}/${repo}/branches/${branch}`;

            const headers = {
                'Authorization': this.getAuthorizationHeader(token),
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28'
            };

            // Note: Cannot use Cache-Control header due to CORS restrictions
            // GitHub API will return fresh data by default

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Branch '${branch}' not found in repository '${owner}/${repo}'`);
                }
                throw new Error(`Failed to fetch branch info: ${response.status}`);
            }

            const branchData = await response.json();
            return branchData.commit.sha;

        } catch (error) {
            console.error('Error getting latest commit SHA:', error);
            throw error;
        }
    },

    // Cache management functions
    async getCachedCommitSha(repoUrl) {
        return await getCachedCommitSha(repoUrl);
    },

    async setCachedCommitSha(repoUrl, sha) {
        return await setCachedCommitSha(repoUrl, sha);
    },

    async clearCachedCommitSha(repoUrl) {
        return await clearCachedCommitSha(repoUrl);
    },

    async compareCommits(repositoryUrl, token, baseCommit, headCommit) {
        return await compareCommits(repositoryUrl, token, baseCommit, headCommit);
    },

    // Helper function to push local changes to GitHub based on action events
    async pushLocalChangesToGitHub(config, actionEvents, localNotes) {
        if (!actionEvents || actionEvents.length === 0) {
            console.log('No local changes to push');
            return { pushedCount: 0, errors: [], commitShas: [], lastCommitSha: null };
        }

        console.log(`Pushing ${actionEvents.length} local changes to GitHub...`);

        const pushedFiles = [];
        const errors = [];
        const commitShas = []; // Track commit SHAs from each push operation

        for (const event of actionEvents) {
            try {
                let commitSha = null;
                switch (event.actionType) {
                    case 'added':
                    case 'updated':
                        commitSha = await this.pushNoteToGitHub(config, event, localNotes);
                        pushedFiles.push(event.noteTitle);
                        break;

                    case 'deleted':
                        commitSha = await this.deleteNoteFromGitHub(config, event);
                        pushedFiles.push(`Deleted: ${event.noteTitle}`);
                        break;

                    case 'renamed':
                        commitSha = await this.renameNoteInGitHub(config, event, localNotes);
                        pushedFiles.push(`Renamed: ${event.oldFilename} → ${event.noteTitle}`);
                        break;

                    default:
                        console.warn(`Unknown action type: ${event.actionType}`);
                }

                // Collect commit SHA if available
                if (commitSha) {
                    commitShas.push(commitSha);
                    console.log(`Pushed ${event.actionType} operation with commit SHA: ${commitSha}`);
                }

            } catch (error) {
                console.error(`Failed to process action event ${event.id}:`, error);
                errors.push({
                    event: event,
                    error: error.message
                });
            }
        }

        if (pushedFiles.length > 0) {
            console.log(`✅ Successfully pushed ${pushedFiles.length} changes to GitHub`);
            console.log(`📋 Collected ${commitShas.length} commit SHAs from push operations`);
        }
        if (errors.length > 0) {
            console.warn(`⚠️  ${errors.length} errors occurred during push`);
        }

        return {
            pushedCount: pushedFiles.length,
            errors: errors,
            pushedFiles: pushedFiles,
            commitShas: commitShas, // Return the collected commit SHAs
            lastCommitSha: commitShas.length > 0 ? commitShas[commitShas.length - 1] : null // The final commit SHA
        };
    },

    // Helper function to push a single note to GitHub (create or update)
    async pushNoteToGitHub(config, actionEvent, localNotes) {
        // Find the note in local storage
        const note = localNotes.find(n => n.id === actionEvent.noteId);
        if (!note) {
            throw new Error(`Note with ID ${actionEvent.noteId} not found in local storage`);
        }

        // Generate filename for the note
        const filename = this.generateNoteFilename(note);

        // Convert note to markdown content
        const markdownContent = this.noteToMarkdown(note);

        // Create commit message
        const commitMessage = actionEvent.actionType === 'added'
            ? `Add note: ${note.title}`
            : `Update note: ${note.title}`;

        // Use GitHub API to create/update the file
        const result = await this.createOrUpdateFileInGitHub(
            config.repositoryUrl,
            config.personalAccessToken,
            filename,
            markdownContent,
            commitMessage
        );

        // Return the commit SHA from the API response
        return result?.commit?.sha || null;
    },

    // Helper function to delete a note from GitHub
    async deleteNoteFromGitHub(config, actionEvent) {
        // Generate filename for the deleted note
        const filename = actionEvent.oldFilename || this.generateFilenameFromEvent(actionEvent);

        // First, get the file SHA (required for deletion)
        const fileSha = await this.getFileSha(config.repositoryUrl, config.personalAccessToken, filename);
        if (!fileSha) {
            console.warn(`File ${filename} not found in repository, skipping deletion`);
            return null;
        }

        // Delete the file using GitHub API
        const result = await this.deleteFileInGitHub(
            config.repositoryUrl,
            config.personalAccessToken,
            filename,
            fileSha,
            `Delete note: ${actionEvent.noteTitle}`
        );

        // Return the commit SHA from the API response
        return result?.commit?.sha || null;
    },

    // Helper function to rename a note in GitHub (delete old, create new)
    async renameNoteInGitHub(config, actionEvent, localNotes) {
        // Find the note in local storage to get current content
        const note = localNotes.find(n => n.id === actionEvent.noteId);
        if (!note) {
            throw new Error(`Note with ID ${actionEvent.noteId} not found in local storage`);
        }

        const oldFilename = actionEvent.oldFilename;
        const newFilename = this.generateNoteFilename(note);

        if (!oldFilename) {
            console.warn('No old filename provided for rename operation, treating as update');
            return await this.pushNoteToGitHub(config, actionEvent, localNotes);
        }

        // Step 1: Create the new file
        const markdownContent = this.noteToMarkdown(note);
        const createResult = await this.createOrUpdateFileInGitHub(
            config.repositoryUrl,
            config.personalAccessToken,
            newFilename,
            markdownContent,
            `Rename note: ${oldFilename} → ${newFilename}`
        );

        // Step 2: Delete the old file
        let finalCommitSha = createResult?.commit?.sha || null;
        try {
            const oldFileSha = await this.getFileSha(config.repositoryUrl, config.personalAccessToken, oldFilename);
            if (oldFileSha) {
                const deleteResult = await this.deleteFileInGitHub(
                    config.repositoryUrl,
                    config.personalAccessToken,
                    oldFilename,
                    oldFileSha,
                    `Remove old file after rename: ${oldFilename}`
                );
                // Use the delete operation's commit SHA as the final one
                finalCommitSha = deleteResult?.commit?.sha || finalCommitSha;
            }
        } catch (error) {
            console.warn(`Failed to delete old file ${oldFilename} after rename:`, error);
            // Don't fail the entire operation if old file deletion fails
        }

        return finalCommitSha;
    },

    // Helper function to create or update a file in GitHub
    async createOrUpdateFileInGitHub(repositoryUrl, token, filePath, content, commitMessage) {
        const url = new URL(repositoryUrl);
        const pathParts = url.pathname.split('/').filter(part => part.length > 0);

        if (pathParts.length < 2) {
            throw new Error('Invalid repository URL format');
        }

        const owner = pathParts[0];
        const repo = pathParts[1];
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}`;

        // Get existing file SHA if it exists (needed for updates)
        let existingFileSha = null;
        try {
            existingFileSha = await this.getFileSha(repositoryUrl, token, filePath);
        } catch (error) {
            // Expected for new files
        }

        const headers = {
            'Authorization': this.getAuthorizationHeader(token),
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json'
        };

        const requestBody = {
            message: commitMessage,
            content: btoa(unescape(encodeURIComponent(content))) // Base64 encode with proper UTF-8 handling
        };

        // Add SHA if updating existing file
        if (existingFileSha) {
            requestBody.sha = existingFileSha;
        }

        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create/update file ${filePath}: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        console.log(`File ${filePath} ${existingFileSha ? 'updated' : 'created'} successfully`);
        return result;
    },

    // Helper function to delete a file from GitHub
    async deleteFileInGitHub(repositoryUrl, token, filePath, fileSha, commitMessage) {
        const url = new URL(repositoryUrl);
        const pathParts = url.pathname.split('/').filter(part => part.length > 0);

        if (pathParts.length < 2) {
            throw new Error('Invalid repository URL format');
        }

        const owner = pathParts[0];
        const repo = pathParts[1];
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}`;

        const headers = {
            'Authorization': this.getAuthorizationHeader(token),
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json'
        };

        const requestBody = {
            message: commitMessage,
            sha: fileSha
        };

        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to delete file ${filePath}: ${response.status} ${response.statusText} - ${errorText}`);
        }

        console.log(`File ${filePath} deleted successfully`);
        return await response.json();
    },

    // Helper function to get file SHA from GitHub
    async getFileSha(repositoryUrl, token, filePath) {
        const url = new URL(repositoryUrl);
        const pathParts = url.pathname.split('/').filter(part => part.length > 0);

        if (pathParts.length < 2) {
            throw new Error('Invalid repository URL format');
        }

        const owner = pathParts[0];
        const repo = pathParts[1];
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}`;

        const headers = {
            'Authorization': this.getAuthorizationHeader(token),
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28'
        };

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: headers
        });

        if (response.status === 404) {
            return null; // File doesn't exist
        }

        if (!response.ok) {
            throw new Error(`Failed to get file info for ${filePath}: ${response.status} ${response.statusText}`);
        }

        const fileData = await response.json();
        return fileData.sha;
    },

    // Helper function to generate filename for a note
    generateNoteFilename(note) {
        // Generate a safe filename based on note title and ID
        const safeTitle = note.title
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '') // Remove special characters
            .replace(/\s+/g, '_') // Replace spaces with underscores
            .substring(0, 50); // Limit length

        return `${safeTitle}_${note.id}.md`;
    },

    // Helper function to generate filename from action event (for deletions)
    generateFilenameFromEvent(actionEvent) {
        const safeTitle = actionEvent.noteTitle
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '') // Remove special characters
            .replace(/\s+/g, '_') // Replace spaces with underscores
            .substring(0, 50); // Limit length

        return `${safeTitle}_${actionEvent.noteId}.md`;
    },

    // Helper function to convert note to markdown format
    noteToMarkdown(note) {
        const frontMatter = [
            '---',
            `title: "${note.title.replace(/"/g, '\\"')}"`,
            `uniqueId: "${note.id}"`,
            `tags: [${note.tags.map(tag => `"${tag.name.replace(/"/g, '\\"')}"`).join(', ')}]`,
            `created: "${new Date(note.createdAt).toISOString()}"`,
            `modified: "${new Date(note.editedAt).toISOString()}"`,
            '---',
            ''
        ].join('\n');

        return frontMatter + note.content;
    },

    // Helper function to build sync result message
    buildSyncResultMessage(hasRemoteChanges, pushResults, updatedNoteIds) {
        const remotePart = hasRemoteChanges
            ? `Applied ${updatedNoteIds.length} remote changes to local notes`
            : 'No remote changes detected';

        const localPart = pushResults.pushedCount > 0
            ? `Pushed ${pushResults.pushedCount} local changes to GitHub`
            : 'No local changes to push';

        const errorPart = pushResults.errors.length > 0
            ? ` (${pushResults.errors.length} errors occurred)`
            : '';

        return `Sync completed: ${remotePart}. ${localPart}${errorPart}`;
    }
};

console.log('GitHub Sync module loaded successfully');
