/**
 * Find all matches of a search term in content
 * @param content - The text to search in
 * @param term - The search term
 * @param caseSensitive - Whether search should be case sensitive
 * @param useRegex - Whether to treat term as regex
 * @returns Array of match positions with from and to indices
 */
export function findMatches(
    content: string,
    term: string,
    caseSensitive: boolean = false,
    useRegex: boolean = false
): Array<{ from: number; to: number }> {
    if (!term) return [];

    const matches: Array<{ from: number; to: number }> = [];
    let regex: RegExp;

    try {
        if (useRegex) {
            regex = new RegExp(term, caseSensitive ? 'g' : 'gi');
        } else {
            const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            regex = new RegExp(escapedTerm, caseSensitive ? 'g' : 'gi');
        }

        let match;
        while ((match = regex.exec(content)) !== null) {
            matches.push({
                from: match.index,
                to: match.index + match[0].length,
            });
        }
    } catch (error) {
        // Invalid regex, return empty matches
        return [];
    }

    return matches;
}

/**
 * Replace all occurrences of a search term with replacement term
 * @param content - The text to search in
 * @param searchTerm - The search term
 * @param replaceTerm - The replacement text
 * @param caseSensitive - Whether search should be case sensitive
 * @param useRegex - Whether to treat term as regex
 * @returns Modified content
 */
export function replaceAll(
    content: string,
    searchTerm: string,
    replaceTerm: string,
    caseSensitive: boolean = false,
    useRegex: boolean = false
): string {
    if (!searchTerm) return content;

    try {
        let regex: RegExp;
        if (useRegex) {
            regex = new RegExp(searchTerm, caseSensitive ? 'g' : 'gi');
        } else {
            const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            regex = new RegExp(escapedTerm, caseSensitive ? 'g' : 'gi');
        }
        return content.replace(regex, replaceTerm);
    } catch (error) {
        console.error('Replace error:', error);
        return content;
    }
}

/**
 * Replace a single occurrence at a specific match index
 * @param content - The text to search in
 * @param searchTerm - The search term
 * @param replaceTerm - The replacement text
 * @param matchIndex - The index of the match to replace
 * @param matches - Array of all matches
 * @returns Modified content and new match index
 */
export function replaceOne(
    content: string,
    searchTerm: string,
    replaceTerm: string,
    matchIndex: number,
    matches: Array<{ from: number; to: number }>
): { content: string; newIndex: number } {
    if (!searchTerm || matchIndex < 0 || matchIndex >= matches.length) {
        return { content, newIndex: matchIndex };
    }

    const match = matches[matchIndex];
    const before = content.substring(0, match.from);
    const after = content.substring(match.to);
    const newContent = before + replaceTerm + after;

    // Adjust remaining match indices
    const lengthDiff = replaceTerm.length - (match.to - match.from);
    const newMatches = matches.map((m, i) => {
        if (i <= matchIndex) return m;
        return {
            from: m.from + lengthDiff,
            to: m.to + lengthDiff,
        };
    });

    // Move to next match or stay at current if it was the last
    const newIndex = matchIndex < newMatches.length - 1 ? matchIndex : Math.max(0, matchIndex - 1);

    return { content: newContent, newIndex };
}
