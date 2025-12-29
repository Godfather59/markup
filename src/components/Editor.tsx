import React, { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import type { LanguageType } from './LanguageSelector';

interface EditorProps {
    value: string;
    language: LanguageType;
    onChange: (value: string) => void;
    onPaste: (text: string) => void;
    matches: Array<{ from: number; to: number }>;
    currentMatchIndex: number;
    isDarkMode: boolean;
    fontSize: number;
    wordWrap: boolean;
}

export const Editor: React.FC<EditorProps> = ({
    value,
    language,
    onChange,
    onPaste,
    matches,
    currentMatchIndex,
    isDarkMode,
    fontSize,
    wordWrap,
}) => {
    const viewRef = React.useRef<EditorView | null>(null);
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const [height, setHeight] = React.useState('100%');
    const [langExtension, setLangExtension] = React.useState(() => {
        // Default to JSON, will be updated when language changes
        return json();
    });

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

    // Load language extensions dynamically
    React.useEffect(() => {
        switch (language) {
            case 'json':
                setLangExtension(json());
                break;
            case 'xml':
                setLangExtension(xml());
                break;
            case 'html':
                import('@codemirror/lang-html').then(m => {
                    setLangExtension(m.html());
                });
                break;
            case 'css':
                import('@codemirror/lang-css').then(m => {
                    setLangExtension(m.css());
                });
                break;
            case 'yaml':
                import('@codemirror/lang-javascript').then(m => {
                    setLangExtension(m.javascript());
                });
                break;
            default:
                setLangExtension(json());
        }
    }, [language]);

    const extensions = useMemo(() => {

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
                '&': {
                    fontSize: `${fontSize}px`,
                },
                '.cm-content': {
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "source-code-pro", monospace',
                },
                '.cm-search-match': {
                    backgroundColor: isDarkMode ? 'rgba(251, 191, 36, 0.25)' : 'rgba(251, 191, 36, 0.15)',
                    outline: `2px solid ${isDarkMode ? 'rgba(251, 191, 36, 0.6)' : 'rgba(217, 119, 6, 0.8)'}`,
                    borderRadius: '2px',
                    padding: '1px 2px',
                },
                '.cm-search-match-active': {
                    backgroundColor: isDarkMode ? 'rgba(251, 191, 36, 0.5)' : 'rgba(251, 191, 36, 0.35)',
                    outline: `3px solid ${isDarkMode ? 'rgb(251, 191, 36)' : 'rgb(217, 119, 6)'}`,
                    borderRadius: '2px',
                    padding: '1px 2px',
                    fontWeight: '600',
                },
            }),
            wordWrap ? EditorView.lineWrapping : [],
        ];
    }, [langExtension, onPaste, isDarkMode, fontSize, wordWrap]);

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
