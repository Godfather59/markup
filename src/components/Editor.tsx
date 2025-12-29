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
    const extensions = useMemo(() => {
        const langExtension = language === 'json' ? json() : xml();

        return [
            langExtension,
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
    }, [language]);

    // Handle paste event for auto-detection only
    const handlePaste = (event: React.ClipboardEvent) => {
        const pastedText = event.clipboardData.getData('text');
        if (pastedText) {
            onPaste(pastedText);
        }
    };

    return (
        <div className="flex-1 overflow-hidden" onPaste={handlePaste}>
            <CodeMirror
                value={value}
                height="100%"
                theme={oneDark}
                extensions={extensions}
                onChange={onChange}
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
