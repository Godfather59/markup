import { useEffect } from 'react';

interface KeyboardShortcutHandlers {
    onFormat: () => void;
    onToggleSearch: () => void;
    onClearSearch: () => void;
}

/**
 * Custom hook for keyboard shortcuts
 * - Ctrl/Cmd + F: Format/Beautify
 * - Ctrl/Cmd + H: Toggle Search/Replace
 * - Esc: Clear Search
 */
export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const modifierKey = isMac ? event.metaKey : event.ctrlKey;

            // Ctrl/Cmd + F: Format
            if (modifierKey && event.key === 'f') {
                event.preventDefault();
                handlers.onFormat();
            }

            // Ctrl/Cmd + H: Toggle Search
            if (modifierKey && event.key === 'h') {
                event.preventDefault();
                handlers.onToggleSearch();
            }

            // Esc: Clear Search
            if (event.key === 'Escape') {
                handlers.onClearSearch();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handlers]);
}
