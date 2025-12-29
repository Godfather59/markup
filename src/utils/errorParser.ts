/**
 * Parse JSON error to extract line number
 */
export function parseJSONError(error: Error, content: string): { message: string; line?: number } {
    const message = error.message;
    
    // Try to extract line number from error message
    // Common patterns: "at line X column Y" or "Unexpected token at position X"
    const lineMatch = message.match(/line (\d+)|position (\d+)|at position (\d+)/i);
    
    if (lineMatch) {
        const position = parseInt(lineMatch[1] || lineMatch[2] || lineMatch[3] || '0');
        const lines = content.substring(0, position).split('\n');
        return {
            message: message.replace(/at line \d+|at position \d+|position \d+/gi, '').trim() || message,
            line: lines.length
        };
    }
    
    // Try to find position from "Unexpected token" errors
    const tokenMatch = message.match(/Unexpected token.*?at position (\d+)/i);
    if (tokenMatch) {
        const position = parseInt(tokenMatch[1]);
        const lines = content.substring(0, position).split('\n');
        return {
            message: message,
            line: lines.length
        };
    }
    
    return { message };
}

/**
 * Parse XML error to extract line number
 */
export function parseXMLError(error: Error, content: string): { message: string; line?: number } {
    const message = error.message;
    
    // XML parser errors often include line numbers
    const lineMatch = message.match(/line (\d+)|at line (\d+)/i);
    
    if (lineMatch) {
        const line = parseInt(lineMatch[1] || lineMatch[2] || '0');
        return {
            message: message.replace(/at line \d+|line \d+/gi, '').trim() || message,
            line
        };
    }
    
    return { message };
}

