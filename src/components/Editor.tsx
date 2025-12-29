import React, { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { LanguageType } from './LanguageSelector';

interface EditorProps {
    value: string;
    language: LanguageType;
    onChange: (value: string) => void;
    onPaste: (text: string) => void;
    matches: Array<{ from: number; to: number }>;
    currentMatchIndex: number;
    isDarkMode: boolean;
}

export const Editor: React.FC<EditorProps> = ({
    value,
    language,
    onChange,
    onPaste,
    matches,
    currentMatchIndex,
    isDarkMode,
}) => {
    const viewRef = React.useRef<EditorView | null>(null);
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const [height, setHeight] = React.useState('100%');

    // Calculate height based on container
    React.useEffect(() => {
        const updateHeight = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setHeight(`${rect.height}px`);
            }
        };

        updateHeight();
        const resizeObserver = new ResizeObserver(updateHeight);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();
    }, []);

    const extensions = useMemo(() => {
        let langExtension;
        switch (language) {
            case 'json':
                langExtension = json();
                break;
            case 'xml':
                langExtension = xml();
                break;
            case 'html':
                langExtension = html();
                break;
            case 'css':
                langExtension = css();
                break;
            case 'yaml':
                // YAML uses JavaScript highlighting as fallback
                langExtension = javascript();
                break;
            default:
                langExtension = json();
        }

        // Custom paste handler to capture text for auto-detection
        // IMPORTANT: We return 'false' to allow CodeMirror's native paste behavior to continue
        const pasteHandler = EditorView.domEventHandlers({
            paste(event) {
                const text = event.clipboardData?.getData('text');
                if (text) {
                    onPaste(text);
                }
                return false;
            }
        });

        return [
            langExtension,
            pasteHandler,
            EditorView.theme({
                '.cm-search-match': {
                    backgroundColor: isDarkMode ? 'rgba(251, 191, 36, 0.3)' : 'rgba(251, 191, 36, 0.2)',
                    outline: `1px solid ${isDarkMode ? 'rgba(251, 191, 36, 0.5)' : 'rgba(251, 191, 36, 0.7)'}`,
                },
                '.cm-search-match-active': {
                    backgroundColor: isDarkMode ? 'rgba(251, 191, 36, 0.5)' : 'rgba(251, 191, 36, 0.4)',
                    outline: `2px solid ${isDarkMode ? 'rgb(251, 191, 36)' : 'rgb(217, 119, 6)'}`,
                },
            }),
        ];
    }, [language, onPaste, isDarkMode]);

    // Handle paste event for auto-detection only
    // (Removed prop-based handler as we use the extension now)
    /* const handlePaste = ... */

    // Update selection when current match changes
    React.useEffect(() => {
        if (!viewRef.current || matches.length === 0) return;

        const match = matches[currentMatchIndex];
        if (match) {
            viewRef.current.dispatch({
                selection: { anchor: match.from, head: match.to },
                scrollIntoView: true,
                effects: EditorView.scrollIntoView(match.from, { y: 'center' })
            });
        }
    }, [currentMatchIndex, matches]);

    return (
        <div ref={containerRef} className="flex-1 min-h-0 overflow-hidden">
            <CodeMirror
                value={value}
                height={height}
                theme={isDarkMode ? oneDark : undefined}
                extensions={extensions}
                onChange={onChange}
                onCreateEditor={(view) => {
                    viewRef.current = view;
                }}
                basicSetup={{
                    lineNumbers: true,
                    highlightActiveLineGutter: true,
                    highlightSpecialChars: true,
                    foldGutter: true,
                    drawSelection: true,
                    dropCursor: true,
                    allowMultipleSelections: true,
                    indentOnInput: true,
                    bracketMatching: true,
                    closeBrackets: true,
                    autocompletion: true,
                    rectangularSelection: true,
                    crosshairCursor: true,
                    highlightActiveLine: true,
                    highlightSelectionMatches: true,
                    closeBracketsKeymap: true,
                    searchKeymap: true,
                    foldKeymap: true,
                    completionKeymap: true,
                    lintKeymap: true,
                }}
            />
        </div>
    );
};
