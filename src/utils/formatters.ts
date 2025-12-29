import { parseJSONError, parseXMLError } from './errorParser';

/**
 * Format JSON with proper indentation
 * @param text - Raw JSON string
 * @param indent - Indentation (number of spaces or '\t' for tabs)
 * @returns Formatted JSON string
 * @throws Error if JSON is invalid (with line number info)
 */
export function formatJSON(text: string, indent: number | string = 2): string {
    try {
        const parsed = JSON.parse(text);
        return JSON.stringify(parsed, null, indent);
    } catch (error) {
        const parsed = parseJSONError(error as Error, text);
        const errorMsg = parsed.line 
            ? `Invalid JSON at line ${parsed.line}: ${parsed.message}`
            : `Invalid JSON: ${parsed.message}`;
        throw new Error(errorMsg);
    }
}

/**
 * Format XML with proper indentation (optimized regex version)
 * @param text - Raw XML string
 * @param indent - Indentation string (e.g., '  ', '    ', '\t')
 * @returns Formatted XML string
 * @throws Error if XML is invalid (with line number info)
 */
export function formatXML(text: string, indent: string = '  '): string {
    try {
        // Quick validation with DOMParser
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, 'text/xml');
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            const errorText = parserError.textContent || 'Invalid XML';
            const parsed = parseXMLError(new Error(errorText), text);
            const errorMsg = parsed.line 
                ? `Invalid XML at line ${parsed.line}: ${parsed.message}`
                : `Invalid XML: ${parsed.message}`;
            throw new Error(errorMsg);
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
        const parsed = parseXMLError(error as Error, text);
        const errorMsg = parsed.line 
            ? `Invalid XML at line ${parsed.line}: ${parsed.message}`
            : `Invalid XML: ${parsed.message}`;
        throw new Error(errorMsg);
    }
}

/**
 * Minify JSON by removing all whitespace
 * @param text - JSON string
 * @returns Minified JSON string
 * @throws Error if JSON is invalid
 */
export function minifyJSON(text: string): string {
    try {
        const parsed = JSON.parse(text);
        return JSON.stringify(parsed);
    } catch (error) {
        throw new Error('Invalid JSON: ' + (error as Error).message);
    }
}

/**
 * Minify XML by removing all unnecessary whitespace
 * @param text - XML string
 * @returns Minified XML string
 * @throws Error if XML is invalid
 */
export function minifyXML(text: string): string {
    try {
        // Quick validation with DOMParser
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, 'text/xml');
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            throw new Error('Invalid XML');
        }

        // Remove comments and unnecessary whitespace
        let minified = text
            .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
            .replace(/>\s+</g, '><') // Remove whitespace between tags
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/>\s/g, '>') // Remove spaces after >
            .replace(/\s</g, '<') // Remove spaces before <
            .trim();

        return minified;
    } catch (error) {
        throw new Error('Invalid XML: ' + (error as Error).message);
    }
}

/**
 * Format HTML with proper indentation
 * @param text - Raw HTML string
 * @param indent - Indentation string (e.g., '  ', '    ', '\t')
 * @returns Formatted HTML string
 */
export function formatHTML(text: string, indent: string = '  '): string {
    try {
        // Use DOMParser to parse and format HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        
        // Simple formatting using XML formatter (HTML is similar to XML)
        return formatXML(text, indent);
    } catch (error) {
        throw new Error('Invalid HTML: ' + (error as Error).message);
    }
}

/**
 * Format CSS with proper indentation
 * @param text - Raw CSS string
 * @param indent - Indentation string (e.g., '  ', '    ', '\t')
 * @returns Formatted CSS string
 */
export function formatCSS(text: string, indent: string = '  '): string {
    try {
        let formatted = text;
        let indentLevel = 0;
        const lines: string[] = [];
        
        // Remove existing whitespace
        formatted = formatted.replace(/\s*{\s*/g, ' { ').replace(/\s*}\s*/g, ' } ').replace(/\s*;\s*/g, '; ');
        
        // Split by braces and semicolons
        const parts = formatted.split(/([{};])/);
        
        for (const part of parts) {
            const trimmed = part.trim();
            if (!trimmed) continue;
            
            if (trimmed === '{') {
                lines.push(indent.repeat(indentLevel) + trimmed);
                indentLevel++;
            } else if (trimmed === '}') {
                indentLevel = Math.max(0, indentLevel - 1);
                lines.push(indent.repeat(indentLevel) + trimmed);
            } else if (trimmed === ';') {
                const lastLine = lines[lines.length - 1];
                if (lastLine && !lastLine.endsWith(';') && !lastLine.endsWith('{') && !lastLine.endsWith('}')) {
                    lines[lines.length - 1] = lastLine + ';';
                }
            } else {
                lines.push(indent.repeat(indentLevel) + trimmed);
            }
        }
        
        return lines.join('\n');
    } catch (error) {
        throw new Error('Invalid CSS: ' + (error as Error).message);
    }
}

/**
 * Format YAML with proper indentation
 * @param text - Raw YAML string
 * @param indent - Indentation (number of spaces)
 * @returns Formatted YAML string
 */
export function formatYAML(text: string, indent: number = 2): string {
    try {
        // Import js-yaml dynamically to avoid bundle bloat
        const yaml = require('js-yaml');
        const obj = yaml.load(text);
        return yaml.dump(obj, { indent: indent, lineWidth: -1 });
    } catch (error) {
        throw new Error('Invalid YAML: ' + (error as Error).message);
    }
}

/**
 * Minify HTML
 */
export function minifyHTML(text: string): string {
    return minifyXML(text); // HTML minification is similar to XML
}

/**
 * Minify CSS
 */
export function minifyCSS(text: string): string {
    return text
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\s*{\s*/g, '{') // Remove spaces around {
        .replace(/\s*}\s*/g, '}') // Remove spaces around }
        .replace(/\s*;\s*/g, ';') // Remove spaces around ;
        .replace(/\s*:\s*/g, ':') // Remove spaces around :
        .trim();
}

/**
 * Minify YAML
 */
export function minifyYAML(text: string): string {
    try {
        const yaml = require('js-yaml');
        const obj = yaml.load(text);
        return yaml.dump(obj, { indent: 0, lineWidth: -1, noRefs: true });
    } catch (error) {
        throw new Error('Invalid YAML: ' + (error as Error).message);
    }
}
