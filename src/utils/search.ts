/**
 * Find all matches of a search term in content
 * @param content - The text to search in
 * @param term - The search term
 * @returns Array of match positions with from and to indices
 */
export function findMatches(
    content: string,
    term: string
): Array<{ from: number; to: number }> {
    if (!term) return [];

    const matches: Array<{ from: number; to: number }> = [];
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    let match;

    while ((match = regex.exec(content)) !== null) {
        matches.push({
            from: match.index,
            to: match.index + match[0].length,
        });
    }

    return matches;
}

/**
 * Replace all occurrences of a search term with replacement term
 * @param content - The text to search in
 * @param searchTerm - The search term (can be regex)
 * @param replaceTerm - The replacement text
 * @returns Modified content
 */
export function replaceAll(
    content: string,
    searchTerm: string,
    replaceTerm: string
): string {
    if (!searchTerm) return content;

    try {
        // Escape special regex characters for literal search
        const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedTerm, 'gi');
        return content.replace(regex, replaceTerm);
    } catch (error) {
        console.error('Replace error:', error);
        return content;
    }
}
