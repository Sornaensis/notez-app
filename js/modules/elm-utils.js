/**
 * Utility functions that could potentially be moved to Elm
 * These are pure functions without side effects that operate on data
 */

// Action event deduplication logic
function deduplicateActionEvents(events, newActionEvent, actionType, noteId) {
    console.log(`Deduplicating ${actionType} action for note ${noteId}`);
    console.log('Current events count:', events.length);
    console.log('New event:', newActionEvent);

    // Special handling for 'updated' actions
    if (actionType === 'updated') {
        // Check if there's a recent 'updated' action for the same note (within 2 seconds)
        // This prevents rapid-fire duplicate updates but allows normal editing
        const recentUpdatedIndex = events.findIndex(event =>
            event.actionType === 'updated' &&
            event.noteId === noteId &&
            (Date.now() - event.timestamp) < 2000 // 2 seconds instead of 10
        );

        if (recentUpdatedIndex !== -1) {
            console.log(`Blocked duplicate 'updated' action for note ${noteId} - found recent action within 2 seconds`);
            // Return original events array unchanged to indicate the action was blocked
            return events;
        }
    }

    // Special handling for 'deleted' actions
    if (actionType === 'deleted') {
        // Remove any existing actions for this note (added, updated) since it's now deleted
        const filteredEvents = events.filter(event => event.noteId !== noteId);
        const removedCount = events.length - filteredEvents.length;

        if (removedCount > 0) {
            console.log(`Removed ${removedCount} existing actions for deleted note ${noteId}`);
            // If we removed existing actions, don't add the delete action (local creation + deletion = no action)
            return { skipNewAction: true, events: filteredEvents };
        }

        // Check if there's already a 'deleted' action for this note
        const hasDeletedAction = filteredEvents.some(event =>
            event.actionType === 'deleted' && event.noteId === noteId
        );

        if (hasDeletedAction) {
            console.log(`Blocked duplicate 'deleted' action for note ${noteId}`);
            // Return special marker to indicate delete action was blocked
            return { blocked: true, events: filteredEvents };
        }

        // No existing actions for this note, so allow the delete action (deleting a synced note)
        return filteredEvents;
    }

    // For 'added' actions, check if there's already an 'added' action for this note
    if (actionType === 'added') {
        const hasAddedAction = events.some(event =>
            event.actionType === 'added' && event.noteId === noteId
        );

        if (hasAddedAction) {
            console.log(`Blocked duplicate 'added' action for note ${noteId}`);
            // Convert to 'updated' action instead
            const updatedEvent = { ...newActionEvent, actionType: 'updated' };
            console.log(`Converting duplicate 'added' to 'updated' for note ${noteId}`);

            // Remove any recent 'updated' actions for this note to avoid duplicates
            const withoutRecentUpdates = events.filter(event =>
                !(event.actionType === 'updated' &&
                    event.noteId === noteId &&
                    (Date.now() - event.timestamp) < 10000)
            );

            return withoutRecentUpdates;
        }
    }

    return events;
}

// Note filtering logic
function filterNotes(searchQuery, filterTags, notes) {
    if (!searchQuery && (!filterTags || filterTags.length === 0)) {
        return notes;
    }

    return notes.filter(note => {
        // Search query filter
        let matchesSearch = true;
        if (searchQuery && searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase().trim();
            matchesSearch =
                note.title.toLowerCase().includes(query) ||
                note.content.toLowerCase().includes(query) ||
                note.tags.some(tag => tag.name.toLowerCase().includes(query));
        }

        // Tag filter
        let matchesTags = true;
        if (filterTags && filterTags.length > 0) {
            matchesTags = filterTags.every(filterTag =>
                note.tags.some(noteTag => noteTag.name === filterTag.name)
            );
        }

        return matchesSearch && matchesTags;
    });
}

// Note sorting logic
function sortNotesByDate(notes, ascending = false) {
    return [...notes].sort((a, b) => {
        const aTime = a.editedAt || a.createdAt || 0;
        const bTime = b.editedAt || b.createdAt || 0;
        return ascending ? aTime - bTime : bTime - aTime;
    });
}

// Tag filtering logic
function filterTagsByInput(input, tags) {
    if (!input || input.trim() === '') {
        return tags;
    }

    const lowerInput = input.toLowerCase().trim();
    return tags.filter(tag =>
        tag.name.toLowerCase().includes(lowerInput)
    );
}

// GitHub URL validation
function isValidGitHubUrl(url) {
    if (!url || typeof url !== 'string') return false;

    const trimmedUrl = url.trim();
    const githubRepoRegex = /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/;
    return githubRepoRegex.test(trimmedUrl);
}

// Parse markdown note from GitHub file content
function parseMarkdownNote(content, filename) {
    try {
        // Extract frontmatter if present
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

        let metadata = {};
        let noteContent = content;

        if (frontmatterMatch) {
            const frontmatter = frontmatterMatch[1];
            noteContent = frontmatterMatch[2];

            // Parse YAML-like frontmatter
            frontmatter.split('\n').forEach(line => {
                const match = line.match(/^(\w+):\s*(.*)$/);
                if (match) {
                    const key = match[1];
                    let value = match[2].trim();

                    // Remove quotes if present
                    if (value.startsWith('"') && value.endsWith('"')) {
                        value = value.slice(1, -1);
                    }

                    // Parse arrays (tags)
                    if (value.startsWith('[') && value.endsWith(']')) {
                        value = value.slice(1, -1).split(',').map(item =>
                            item.trim().replace(/"/g, '')
                        ).filter(item => item.length > 0);
                    }

                    metadata[key] = value;
                }
            });
        }

        // Extract note ID from filename or metadata
        let noteId;
        if (metadata.uniqueId) {
            noteId = parseInt(metadata.uniqueId);
        } else {
            const idMatch = filename.match(/_(\d+)\.md$/);
            if (idMatch) {
                noteId = parseInt(idMatch[1]);
            } else {
                // Generate a random ID if none found
                noteId = Date.now();
            }
        }

        // Parse timestamps
        const createdAt = metadata.created ? new Date(metadata.created).getTime() : Date.now();
        const editedAt = metadata.modified ? new Date(metadata.modified).getTime() : createdAt;

        // Parse tags
        const tags = Array.isArray(metadata.tags)
            ? metadata.tags.map(tagName => ({ name: tagName, id: tagName }))
            : [];

        return {
            id: noteId,
            title: metadata.title || 'Untitled',
            content: noteContent.trim(),
            tags: tags,
            createdAt: createdAt,
            editedAt: editedAt
        };
    } catch (error) {
        console.error('Error parsing markdown note:', error);
        return null;
    }
}

// Generate markdown from note
function noteToMarkdown(note) {
    // Create frontmatter
    const frontmatter = [
        '---',
        `title: "${escapeYaml(note.title)}"`,
        `uniqueId: "${note.id}"`,
        `tags: [${note.tags.map(tag => `"${escapeYaml(tag.name)}"`).join(', ')}]`,
        `created: "${new Date(note.createdAt).toISOString()}"`,
        `modified: "${new Date(note.editedAt).toISOString()}"`,
        '---',
        ''
    ].join('\n');

    return frontmatter + note.content;
}

// Escape YAML special characters
function escapeYaml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/"/g, '\\"');
}

// Calculate relative time strings
function formatRelativeTime(currentTime, timestamp) {
    const diff = currentTime - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (seconds > 30) return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
    return 'just now';
}

// Note preview generation
function generateNotePreview(content, maxLength = 150) {
    if (!content || typeof content !== 'string') return '';

    // Remove markdown formatting for preview
    let preview = content
        .replace(/#{1,6}\s+/g, '') // Remove headers
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.*?)\*/g, '$1') // Remove italic
        .replace(/`(.*?)`/g, '$1') // Remove inline code
        .replace(/```[\s\S]*?```/g, '[code block]') // Replace code blocks
        .replace(/!\[.*?\]\(.*?\)/g, '[image]') // Replace images
        .replace(/\[.*?\]\(.*?\)/g, '[link]') // Replace links
        .replace(/>\s+/g, '') // Remove blockquotes
        .replace(/[-*+]\s+/g, '') // Remove list markers
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .trim();

    if (preview.length > maxLength) {
        preview = preview.substring(0, maxLength) + '...';
    }

    return preview || 'Empty note';
}

// Export all utility functions
window.ElmUtils = {
    deduplicateActionEvents,
    filterNotes,
    sortNotesByDate,
    filterTagsByInput,
    isValidGitHubUrl,
    parseMarkdownNote,
    noteToMarkdown,
    escapeYaml,
    formatRelativeTime,
    generateNotePreview
};