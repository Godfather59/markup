// Format JSON with proper indentation
function formatJSON(text: string, indent: number | string = 2): string {
    try {
        const parsed = JSON.parse(text);
        return JSON.stringify(parsed, null, indent);
    } catch (error) {
        throw new Error('Invalid JSON: ' + (error as Error).message);
    }
}

// Format XML with proper indentation (Regex-based, Worker-safe)
function formatXML(text: string, indent: string = '  '): string {
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
        let indentLevel = 0;
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
                    indentLevel = Math.max(0, indentLevel - 1);
                    lines.push(indent.repeat(indentLevel) + part);
                }
                // Self-closing tag
                else if (part.endsWith('/>') || part.match(/<\w+[^>]*\/>/)) {
                    lines.push(indent.repeat(indentLevel) + part);
                }
                // Opening tag
                else if (part.startsWith('<?')) {
                    // XML declaration
                    lines.push(part);
                }
                else if (part.startsWith('<!')) {
                    // Comment or DOCTYPE
                    lines.push(indent.repeat(indentLevel) + part);
                }
                else {
                    lines.push(indent.repeat(indentLevel) + part);
                    indentLevel++;
                }
            }
            // Text content
            else {
                const trimmed = part.trim();
                if (trimmed) {
                    lines.push(indent.repeat(indentLevel) + trimmed);
                }
            }
        }

        return lines.join('\n');
    } catch (error) {
        throw new Error('Invalid XML: ' + (error as Error).message);
    }
}

// Handle messages from main thread
self.onmessage = (e: MessageEvent) => {
    const { type, content, language, indent, id } = e.data;

    if (type === 'format') {
        try {
            let formatted = content;
            if (language === 'json') {
                const indentValue = indent === 'tab' ? '\t' : (indent === 4 ? 4 : 2);
                formatted = formatJSON(content, indentValue);
            } else if (language === 'xml') {
                const indentValue = indent === 'tab' ? '\t' : (indent === 4 ? '    ' : '  ');
                formatted = formatXML(content, indentValue);
            }

            self.postMessage({
                type: 'success',
                content: formatted,
                language,
                id
            });
        } catch (error) {
            self.postMessage({
                type: 'error',
                error: (error as Error).message,
                id
            });
        }
    }
};
