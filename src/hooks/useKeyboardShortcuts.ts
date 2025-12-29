import { useEffect } from 'react';

interface KeyboardShortcutHandlers {
    onFormat: () => void;
    onToggleSearch: () => void;
    onClearSearch: () => void;
    onUndo?: () => void;
    onRedo?: () => void;
}

/**
 * Custom hook for keyboard shortcuts
 * - Ctrl/Cmd + F: Toggle Search/Replace (standard browser behavior)
 * - Ctrl/Cmd + B: Format/Beautify
 * - Ctrl/Cmd + Z: Undo
 * - Ctrl/Cmd + Shift + Z: Redo
 * - Esc: Clear Search
 */
export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const modifierKey = isMac ? event.metaKey : event.ctrlKey;

            // Ctrl/Cmd + F: Toggle Search (standard browser find behavior)
            if (modifierKey && event.key === 'f') {
                event.preventDefault();
                handlers.onToggleSearch();
            }

            // Ctrl/Cmd + B: Format/Beautify
            if (modifierKey && event.key === 'b') {
                event.preventDefault();
                handlers.onFormat();
            }

            // Ctrl/Cmd + Z: Undo
            if (modifierKey && event.key === 'z' && !event.shiftKey) {
                event.preventDefault();
                handlers.onUndo?.();
            }

            // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: Redo
            if ((modifierKey && event.shiftKey && event.key === 'z') || (modifierKey && event.key === 'y')) {
                event.preventDefault();
                handlers.onRedo?.();
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
