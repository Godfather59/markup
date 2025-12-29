import React, { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';

interface EditorProps {
    value: string;
    language: 'json' | 'xml';
    onChange: (value: string) => void;
    onPaste: (text: string) => void;
    matches: Array<{ from: number; to: number }>;
    currentMatchIndex: number;
}

export const Editor: React.FC<EditorProps> = ({
    value,
    language,
    onChange,
    onPaste,
    matches,
    currentMatchIndex,
}) => {
    const viewRef = React.useRef<EditorView | null>(null);

    const extensions = useMemo(() => {
        const langExtension = language === 'json' ? json() : xml();

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
                    backgroundColor: 'rgba(251, 191, 36, 0.3)',
                    outline: '1px solid rgba(251, 191, 36, 0.5)',
                },
                '.cm-search-match-active': {
                    backgroundColor: 'rgba(251, 191, 36, 0.5)',
                    outline: '2px solid rgb(251, 191, 36)',
                },
            }),
        ];
    }, [language, onPaste]);

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
        <div className="flex-1 overflow-hidden">
            <CodeMirror
                value={value}
                height="100%"
                theme={oneDark}
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
