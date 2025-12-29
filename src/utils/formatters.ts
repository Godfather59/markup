/**
 * Format JSON with proper indentation
 * @param text - Raw JSON string
 * @returns Formatted JSON string
 * @throws Error if JSON is invalid
 */
export function formatJSON(text: string): string {
    try {
        const parsed = JSON.parse(text);
        return JSON.stringify(parsed, null, 2);
    } catch (error) {
        throw new Error('Invalid JSON: ' + (error as Error).message);
    }
}

/**
 * Format XML with proper indentation (optimized regex version)
 * @param text - Raw XML string
 * @returns Formatted XML string
 * @throws Error if XML is invalid
 */
export function formatXML(text: string): string {
    try {
        // Quick validation with DOMParser
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, 'text/xml');
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            throw new Error('Invalid XML');
        }

        // Fast regex-based formatting
        let formatted = text;

        // Remove existing whitespace between tags
        formatted = formatted.replace(/>\s*</g, '><');

        // Add newlines and indentation
        let indent = 0;
        const lines: string[] = [];

        // Split by tags
        const parts = formatted.split(/(<[^>]+>)/g);

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (!part || part.trim() === '') continue;

            // Check if it's a tag
            if (part.startsWith('<')) {
                // Closing tag
                if (part.startsWith('</')) {
                    indent = Math.max(0, indent - 1);
                    lines.push('  '.repeat(indent) + part);
                }
                // Self-closing tag
                else if (part.endsWith('/>') || part.match(/<\w+[^>]*\/>/)) {
                    lines.push('  '.repeat(indent) + part);
                }
                // Opening tag
                else if (part.startsWith('<?')) {
                    // XML declaration
                    lines.push(part);
                }
                else if (part.startsWith('<!')) {
                    // Comment or DOCTYPE
                    lines.push('  '.repeat(indent) + part);
                }
                else {
                    lines.push('  '.repeat(indent) + part);
                    indent++;
                }
            }
            // Text content
            else {
                const trimmed = part.trim();
                if (trimmed) {
                    lines.push('  '.repeat(indent) + trimmed);
                }
            }
        }

        return lines.join('\n');
    } catch (error) {
        throw new Error('Invalid XML: ' + (error as Error).message);
    }
}
