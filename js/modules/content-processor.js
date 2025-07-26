/**
 * Content processing utilities for markdown, syntax highlighting, and mermaid diagrams
 */

// Function to reset code blocks to their original state (removes highlighting)
function resetCodeBlocks() {
    // Try different selectors to find code blocks that might be highlighted
    const selectors = [
        '.code-block code',
        'pre code',
        'code[class*="language-"]',
        'code[class*="lang-"]',
        '.markdown-content pre code',
        '.markdown-content code',
        'code.hljs'  // specifically look for highlighted blocks
    ];

    let foundCodeBlocks = [];

    for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            foundCodeBlocks = foundCodeBlocks.concat(Array.from(elements));
        }
    }

    // Remove duplicates
    foundCodeBlocks = [...new Set(foundCodeBlocks)];

    console.log('Resetting', foundCodeBlocks.length, 'code blocks');

    foundCodeBlocks.forEach((block) => {
        // Check if this block has been highlighted and has preserved original data
        const originalText = block.getAttribute('data-original-text') || block.textContent || block.innerText;
        const originalClassName = block.getAttribute('data-original-class') ||
            block.className.replace(/\bhljs\b/g, '').replace(/\bhljs-\S+/g, '').trim();

        // CRITICAL: Restore to simple text structure that Elm expects
        // This prevents the replaceData error by ensuring only text nodes exist
        block.innerHTML = ''; // Clear all child elements
        block.textContent = originalText; // Set as simple text
        block.className = originalClassName; // Restore original class

        // Remove highlight.js data attributes
        block.removeAttribute('data-highlighted');
        // Keep our original data for future resets
        // block.removeAttribute('data-original-text');
        // block.removeAttribute('data-original-class');

        console.log('Reset code block - restored to plain text:', originalText.substring(0, 30) + '...');
    });
}

// Function to highlight code blocks (recreates content for clean state)
function highlightCodeBlocks() {
    // Try different selectors to find code blocks
    const selectors = [
        '.code-block code',
        'pre code',
        'code[class*="language-"]',
        'code[class*="lang-"]',
        '.markdown-content pre code',
        '.markdown-content code'
    ];

    let foundCodeBlocks = [];

    for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            console.log(`Found ${elements.length} code blocks with selector: ${selector}`);
            foundCodeBlocks = foundCodeBlocks.concat(Array.from(elements));
        }
    }

    // Remove duplicates
    foundCodeBlocks = [...new Set(foundCodeBlocks)];

    console.log('Total unique code blocks to highlight:', foundCodeBlocks.length);

    foundCodeBlocks.forEach((block, index) => {
        const originalText = block.textContent || block.innerText;
        const originalClassName = block.className.replace(/\bhljs\b/g, '').replace(/\bhljs-\S+/g, '').trim();

        console.log(`Processing code block ${index}:`, {
            hasText: !!originalText,
            className: originalClassName,
            parentTag: block.parentElement?.tagName,
            parentClass: block.parentElement?.className,
            textPreview: originalText?.substring(0, 50) + '...'
        });

        // Highlight if we have content
        if (originalText && originalText.trim()) {
            console.log(`Highlighting code block ${index} with language:`, originalClassName || 'auto-detect');

            // CRITICAL: Store original text as data attribute before highlighting
            // This preserves the original content for Elm's virtual DOM
            block.setAttribute('data-original-text', originalText);
            if (originalClassName) {
                block.setAttribute('data-original-class', originalClassName);
            }

            // Apply highlighting - this will modify the DOM structure
            try {
                // Ensure clean className before highlighting
                block.className = originalClassName || '';

                hljs.highlightElement(block);
                console.log(`Successfully highlighted code block ${index}`);
            } catch (error) {
                console.error(`Error highlighting code block ${index}:`, error);
            }
        } else {
            console.log(`Skipping code block ${index} - no content`);
        }
    });
}

// Function to render Mermaid diagrams after dynamic content changes
function renderMermaidDiagrams() {
    // Clear all previous processing markers for re-rendering
    const allMermaidElements = document.querySelectorAll('.mermaid-diagram[data-mermaid]');
    console.log('Found', allMermaidElements.length, 'Mermaid diagrams to process');

    allMermaidElements.forEach(async (element) => {
        try {
            const mermaidCode = element.getAttribute('data-mermaid');
            const currentHash = element.getAttribute('data-content-hash');
            const processedHash = element.getAttribute('data-processed-hash');

            // Only re-render if content has actually changed
            if (processedHash && processedHash === currentHash) {
                console.log('Mermaid diagram unchanged, skipping re-render');
                return;
            }

            console.log('Processing Mermaid diagram:', mermaidCode.substring(0, 50) + '...');

            if (mermaidCode && mermaidCode.trim()) {
                // Clear the element and reset classes
                element.innerHTML = '';
                element.classList.add('mermaid');

                // Remove any previous processing markers to force re-rendering
                element.removeAttribute('data-processed');

                // Generate unique ID for this diagram
                const diagramId = 'mermaid-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

                // Render the mermaid diagram
                const { svg } = await mermaid.render(diagramId, mermaidCode);
                element.innerHTML = svg;
                element.setAttribute('data-processed', 'true');
                element.setAttribute('data-processed-hash', currentHash);
                console.log('Successfully rendered Mermaid diagram with ID:', diagramId);
            }
        } catch (error) {
            console.error('Mermaid rendering error:', error);
            element.innerHTML = '<p style="color: red; font-style: italic;">Error rendering diagram: ' + error.message + '</p>';
            element.setAttribute('data-processed', 'true');
            const currentHash = element.getAttribute('data-content-hash');
            element.setAttribute('data-processed-hash', currentHash);
        }
    });
}

// Function to clear all mermaid diagrams
function clearMermaidDiagrams() {
    console.log('Clearing all existing mermaid diagrams...');

    // Find all elements with mermaid-related classes or data attributes
    const mermaidElements = document.querySelectorAll('.mermaid, .mermaid-diagram, [data-mermaid], [data-processed="true"]');

    mermaidElements.forEach(element => {
        // Clear the innerHTML to remove any rendered mermaid content
        if (element.classList.contains('mermaid') || element.hasAttribute('data-processed')) {
            element.innerHTML = '';
        }

        // Remove mermaid-specific classes
        element.classList.remove('mermaid');

        // Remove processing attributes to allow fresh rendering
        element.removeAttribute('data-processed');
        element.removeAttribute('data-processed-hash');

        console.log('Cleared mermaid diagram element:', element.className || element.tagName);
    });

    // Also clear any mermaid-specific DOM artifacts that might be left behind
    // Mermaid sometimes creates additional elements in the DOM
    const mermaidSvgs = document.querySelectorAll('svg[id^="mermaid-"]');
    mermaidSvgs.forEach(svg => {
        console.log('Removing orphaned mermaid SVG:', svg.id);
        svg.remove();
    });

    console.log(`Cleared ${mermaidElements.length} mermaid elements and ${mermaidSvgs.length} orphaned SVGs`);
}

// Function to insert text at cursor position in the active textarea
function insertTextAtCursor(text) {
    // Find the currently focused textarea or input, or default to note textarea
    const activeElement = document.activeElement;
    let targetElement = null;

    if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
        targetElement = activeElement;
    } else {
        // Fallback to note textarea if no textarea is focused
        targetElement = document.querySelector('.note-textarea');
    }

    if (!targetElement) {
        console.warn('No textarea found to insert text into');
        return;
    }

    const startPos = targetElement.selectionStart;
    const endPos = targetElement.selectionEnd;
    const currentValue = targetElement.value;

    // Insert the text at cursor position
    const newValue = currentValue.substring(0, startPos) + text + currentValue.substring(endPos);
    targetElement.value = newValue;

    // Set cursor position after the inserted text
    const newCursorPos = startPos + text.length;
    targetElement.setSelectionRange(newCursorPos, newCursorPos);

    // Focus the element and trigger input event so Elm gets notified
    targetElement.focus();
    targetElement.dispatchEvent(new Event('input', { bubbles: true }));

    console.log('Inserted text at cursor:', text);
}

// Function to get cursor character position in the active textarea
function getCursorCharacterPosition() {
    try {
        // Find the currently focused textarea or input, or default to note textarea
        const activeElement = document.activeElement;
        let targetElement = null;

        if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
            targetElement = activeElement;
        } else {
            // Default to the note textarea
            targetElement = document.querySelector('.note-textarea');
        }

        if (!targetElement) {
            console.warn('No target element found for cursor character position');
            return 0;
        }

        const cursorPos = targetElement.selectionStart;
        console.log('Cursor character position:', cursorPos);
        return cursorPos;

    } catch (error) {
        console.error('Error getting cursor character position:', error);
        return 0;
    }
}

// Function to get cursor position in pixels relative to the page
function getCursorPosition() {
    try {
        // Find the currently focused textarea or input, or default to note textarea
        const activeElement = document.activeElement;
        let targetElement = null;

        if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
            targetElement = activeElement;
        } else {
            // Default to the note textarea
            targetElement = document.querySelector('.note-textarea');
        }

        if (!targetElement) {
            console.warn('No target element found for cursor position');
            return { x: 0, y: 0 };
        }

        // Get the current cursor position
        const cursorPos = targetElement.selectionStart;
        const styles = window.getComputedStyle(targetElement);
        
        // Get padding and border values
        const paddingLeft = parseInt(styles.paddingLeft, 10) || 0;
        const paddingTop = parseInt(styles.paddingTop, 10) || 0;
        const borderLeft = parseInt(styles.borderLeftWidth, 10) || 0;
        const borderTop = parseInt(styles.borderTopWidth, 10) || 0;
        const lineHeight = parseInt(styles.lineHeight, 10) || parseInt(styles.fontSize, 10) || 16;
        
        // Create a mirror div to measure text positioning
        const mirrorDiv = document.createElement('div');
        mirrorDiv.style.position = 'absolute';
        mirrorDiv.style.visibility = 'hidden';
        mirrorDiv.style.top = '-9999px';
        mirrorDiv.style.left = '-9999px';
        
        // Copy all relevant styles to ensure accurate measurement
        const propertiesToCopy = [
            'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight',
            'letterSpacing', 'wordSpacing', 'textTransform', 'textIndent',
            'whiteSpace', 'wordWrap', 'overflowWrap', 'padding', 'border',
            'boxSizing', 'width'
        ];
        
        propertiesToCopy.forEach(prop => {
            mirrorDiv.style[prop] = styles[prop];
        });
        
        // Set the width to match the textarea's content width
        const contentWidth = targetElement.clientWidth - paddingLeft - parseInt(styles.paddingRight, 10);
        mirrorDiv.style.width = contentWidth + 'px';
        mirrorDiv.style.whiteSpace = 'pre-wrap';
        mirrorDiv.style.wordWrap = 'break-word';
        
        // Get text up to cursor and split it into before-cursor and at-cursor parts
        const textBeforeCursor = targetElement.value.substring(0, cursorPos);
        const textAtCursor = targetElement.value.substring(cursorPos, cursorPos + 1) || ' ';
        
        // Create spans to measure position
        const beforeSpan = document.createElement('span');
        beforeSpan.textContent = textBeforeCursor;
        
        const cursorSpan = document.createElement('span');
        cursorSpan.textContent = textAtCursor;
        cursorSpan.style.background = 'red'; // For debugging, will be invisible anyway
        
        mirrorDiv.appendChild(beforeSpan);
        mirrorDiv.appendChild(cursorSpan);
        
        // Add to DOM to measure
        document.body.appendChild(mirrorDiv);
        
        // Get the position of the cursor span within the mirror div
        const cursorSpanRect = cursorSpan.getBoundingClientRect();
        const mirrorRect = mirrorDiv.getBoundingClientRect();
        
        // Calculate cursor position relative to the mirror div
        const cursorXInMirror = cursorSpanRect.left - mirrorRect.left;
        const cursorYInMirror = cursorSpanRect.top - mirrorRect.top;
        
        // Get textarea position and scroll
        const textareaRect = targetElement.getBoundingClientRect();
        const textareaScrollTop = targetElement.scrollTop;
        const textareaScrollLeft = targetElement.scrollLeft;
        
        // Calculate final cursor position accounting for textarea position, padding, and scroll
        const cursorX = textareaRect.left + paddingLeft + borderLeft + cursorXInMirror - textareaScrollLeft;
        const cursorY = textareaRect.top + paddingTop + borderTop + cursorYInMirror - textareaScrollTop + lineHeight;
        
        // Account for page scroll to get absolute position
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft || 0;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        
        const absoluteCursorX = cursorX + scrollX;
        const absoluteCursorY = cursorY + scrollY;
        
        // Clean up
        document.body.removeChild(mirrorDiv);
        
        console.log('Cursor position calculated:', { x: absoluteCursorX, y: absoluteCursorY });
        console.log('Textarea scroll:', { top: textareaScrollTop, left: textareaScrollLeft });
        console.log('Cursor in mirror:', { x: cursorXInMirror, y: cursorYInMirror });
        console.log('Textarea bounds:', textareaRect);
        console.log('Line height:', lineHeight);
        
        return { x: absoluteCursorX, y: absoluteCursorY };
        
    } catch (error) {
        console.error('Error getting cursor position:', error);
        return { x: 0, y: 0 };
    }
}

// Function to process all dynamic content
function processMarkdownContent() {
    console.log('Processing markdown content...');

    // CRITICAL: Clear all existing mermaid content first to prevent duplication
    // This is essential because Elm's virtual DOM creates new elements, 
    // but old rendered SVG content might still exist in the DOM
    clearMermaidDiagrams();

    // First, reset all code blocks to clean state
    resetCodeBlocks();

    // Debug: Check what elements actually exist in the DOM
    const allCodeElements = document.querySelectorAll('code');
    const preCodeElements = document.querySelectorAll('pre code');
    const codeBlockElements = document.querySelectorAll('.code-block code');

    console.log('DOM Debug - Found elements:');
    console.log('- All code elements:', allCodeElements.length);
    console.log('- pre > code elements:', preCodeElements.length);
    console.log('- .code-block code elements:', codeBlockElements.length);

    // Log actual structure
    allCodeElements.forEach((el, i) => {
        console.log(`Code element ${i}:`, {
            className: el.className,
            parentClassName: el.parentElement?.className,
            textContent: el.textContent?.substring(0, 50) + '...'
        });
    });

    // Wait a brief moment for Elm's virtual DOM to update the content
    // then highlight code blocks with fresh content
    setTimeout(() => {
        highlightCodeBlocks();
        renderMermaidDiagrams();
    }, 15); // Reduced timeout for better responsiveness
}

// Debounce function to prevent excessive processing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize mermaid configuration
function initializeMermaid() {
    if (typeof mermaid !== 'undefined') {
        mermaid.initialize({
            startOnLoad: false, // We'll handle initialization manually
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: 'inherit',
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true
            }
        });
    } else {
        console.warn('Mermaid library not loaded yet, skipping initialization');
    }
}

// Initialize syntax highlighting
function initializeSyntaxHighlighting() {
    if (typeof hljs !== 'undefined') {
        hljs.highlightAll();
    } else {
        console.warn('Highlight.js library not loaded yet, skipping initialization');
    }
}

// Export functions
window.ContentProcessor = {
    processMarkdownContent,
    clearMermaidDiagrams,
    insertTextAtCursor,
    getCursorPosition,
    getCursorCharacterPosition,
    resetCodeBlocks,
    highlightCodeBlocks,
    renderMermaidDiagrams,
    initializeMermaid,
    initializeSyntaxHighlighting,
    debounce
};