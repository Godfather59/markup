import React, { useState, useMemo, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Header } from './components/Header';
import { Editor } from './components/Editor';
import { SearchWidget } from './components/SearchWidget';
import { StatusBar } from './components/StatusBar';
import { IndentationType } from './components/IndentationSelector';
import { formatJSON, formatXML, minifyJSON, minifyXML } from './utils/formatters';
import { findMatches, replaceAll, replaceOne } from './utils/search';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

function App() {
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState<'json' | 'xml'>('json');
  const [indent, setIndent] = useState<IndentationType>(2);
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isReplaceVisible, setIsReplaceVisible] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  
  // Undo/Redo history
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Calculate line count
  const lineCount = useMemo(() => {
    if (!content) return 0;
    return content.split('\n').length;
  }, [content]);

  // Compute matches
  const matches = useMemo(() => {
    return findMatches(content, searchTerm, caseSensitive, useRegex);
  }, [content, searchTerm, caseSensitive, useRegex]);

  // Update content and add to history
  const updateContentWithHistory = useCallback((newContent: string) => {
    setContent(newContent);
    // Remove any history after current index (when undoing and then making changes)
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newContent);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Reset match index when matches change
  React.useEffect(() => {
    if (matches.length > 0 && currentMatchIndex >= matches.length) {
      setCurrentMatchIndex(0);
    }
  }, [matches.length, currentMatchIndex]);

  // Get indentation string for formatting
  const getIndentString = useCallback(() => {
    if (indent === 'tab') return '\t';
    return indent === 2 ? 2 : 4;
  }, [indent]);

  // Format handler
  const handleFormat = useCallback(() => {
    if (!content.trim()) {
      toast.error('Nothing to format');
      return;
    }

    try {
      const indentValue = getIndentString();
      const formatted = language === 'json' 
        ? formatJSON(content, indentValue) 
        : formatXML(content, typeof indentValue === 'number' ? ' '.repeat(indentValue) : indentValue);
      updateContentWithHistory(formatted);
      toast.success(`${language.toUpperCase()} formatted successfully!`);
    } catch (error) {
      toast.error((error as Error).message);
    }
  }, [content, language, getIndentString, updateContentWithHistory]);

  // Minify handler
  const handleMinify = useCallback(() => {
    if (!content.trim()) {
      toast.error('Nothing to minify');
      return;
    }

    try {
      const minified = language === 'json' ? minifyJSON(content) : minifyXML(content);
      updateContentWithHistory(minified);
      toast.success(`${language.toUpperCase()} minified successfully!`);
    } catch (error) {
      toast.error((error as Error).message);
    }
  }, [content, language, updateContentWithHistory]);

  // Undo handler
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  }, [history, historyIndex]);

  // Redo handler
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  }, [history, historyIndex]);

  // Clear handler
  const handleClear = useCallback(() => {
    updateContentWithHistory('');
    setSearchTerm('');
    setReplaceTerm('');
    setCurrentMatchIndex(0);
    toast.success('Editor cleared');
  }, [updateContentWithHistory]);

  // Toggle search
  const handleToggleSearch = useCallback(() => {
    setIsSearchVisible((prev) => !prev);
    if (!isSearchVisible) {
      setSearchTerm('');
      setReplaceTerm('');
      setIsReplaceVisible(false);
    }
  }, [isSearchVisible]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    setReplaceTerm('');
    setCurrentMatchIndex(0);
  }, []);

  const workerRef = React.useRef<Worker | null>(null);

  // Initialize worker
  React.useEffect(() => {
    workerRef.current = new Worker(new URL('./workers/format.worker.ts', import.meta.url), {
      type: 'module'
    });

    workerRef.current.onmessage = (e) => {
      const { type, content: formattedContent, language: detectedLang } = e.data;

      if (type === 'success') {
        updateContentWithHistory(formattedContent);
        toast.success(`${detectedLang.toUpperCase()} formatted!`);
      } else if (type === 'error') {
        // Just show error, content is already raw
        // toast.error(error); // Optional: don't spam errors on invalid partial pastes
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Auto-detection and formatting on paste
  const handlePaste = useCallback((pastedText: string) => {
    const trimmed = pastedText.trim();

    // NATIVE PASTE HANDLING:
    // We do NOT call setContent(pastedText) here anymore.
    // The native paste event in CodeMirror handles the insertion efficiently.
    // onChange will fire and update the state naturally.

    // Large file protection: Don't auto-format if > 1MB
    // This prevents the "freeze" when replacing massive content
    const MAX_AUTO_FORMAT_SIZE = 1000000; // 1MB

    if (trimmed.length > MAX_AUTO_FORMAT_SIZE) {
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        setLanguage('json');
        toast('Large JSON detected. Click Beautify to format.', { icon: '⚠️' });
      } else if (trimmed.startsWith('<')) {
        setLanguage('xml');
        toast('Large XML detected. Click Beautify to format.', { icon: '⚠️' });
      }
      return;
    }

    // 2. Detect language and send to worker for background formatting
    let detectedLang: 'json' | 'xml' | null = null;

    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      detectedLang = 'json';
      setLanguage('json');
    } else if (trimmed.startsWith('<')) {
      detectedLang = 'xml';
      setLanguage('xml');
    }

    if (detectedLang && workerRef.current) {
      // Send to worker - this happens off the main thread!
      workerRef.current.postMessage({
        type: 'format',
        content: pastedText,
        language: detectedLang,
        indent: indent,
        id: Date.now()
      });

      toast('Formatting...', { icon: '⏳', duration: 1000 });
    }
  }, []);

  // Search navigation
  const handleNext = useCallback(() => {
    if (matches.length > 0) {
      setCurrentMatchIndex((prev) => (prev + 1) % matches.length);
    }
  }, [matches.length]);

  const handlePrevious = useCallback(() => {
    if (matches.length > 0) {
      setCurrentMatchIndex((prev) => (prev - 1 + matches.length) % matches.length);
    }
  }, [matches.length]);

  // Replace one
  const handleReplaceOne = useCallback(() => {
    if (!searchTerm || matches.length === 0) return;

    const result = replaceOne(content, searchTerm, replaceTerm, currentMatchIndex, matches);
    updateContentWithHistory(result.content);
    
    // Recalculate matches after replacement
    const newMatches = findMatches(result.content, searchTerm, caseSensitive, useRegex);
    setCurrentMatchIndex(Math.min(result.newIndex, newMatches.length - 1));
    
    if (newMatches.length === 0) {
      toast.success('Replaced (no more matches)');
      setSearchTerm('');
      setReplaceTerm('');
    } else {
      toast.success(`Replaced (${newMatches.length} remaining)`);
    }
  }, [content, searchTerm, replaceTerm, currentMatchIndex, matches, caseSensitive, useRegex, updateContentWithHistory]);

  // Replace all
  const handleReplaceAll = useCallback(() => {
    if (!searchTerm) return;

    const newContent = replaceAll(content, searchTerm, replaceTerm, caseSensitive, useRegex);
    updateContentWithHistory(newContent);
    const count = matches.length;
    toast.success(`Replaced ${count} occurrence${count !== 1 ? 's' : ''}`);
    setSearchTerm('');
    setReplaceTerm('');
  }, [content, searchTerm, replaceTerm, caseSensitive, useRegex, matches.length, updateContentWithHistory]);

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    if (!content.trim()) {
      toast.error('Nothing to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(content);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  }, [content]);

  // Download file
  const handleDownload = useCallback(() => {
    if (!content.trim()) {
      toast.error('Nothing to download');
      return;
    }

    try {
      const extension = language === 'json' ? 'json' : 'xml';
      const mimeType = language === 'json' ? 'application/json' : 'application/xml';
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `formatted.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('File downloaded!');
    } catch (error) {
      toast.error('Failed to download file');
    }
  }, [content, language]);

  // Track content changes for undo/redo (only when typing directly)
  React.useEffect(() => {
    // Only add to history if content changed from typing (not from undo/redo/format)
    if (content !== history[historyIndex] && historyIndex === history.length - 1) {
      const newHistory = [...history, content];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      // Limit history size to prevent memory issues
      if (newHistory.length > 50) {
        setHistory(newHistory.slice(-50));
        setHistoryIndex(49);
      }
    }
  }, [content]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onFormat: handleFormat,
    onToggleSearch: handleToggleSearch,
    onClearSearch: handleClearSearch,
    onUndo: handleUndo,
    onRedo: handleRedo,
  });

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Header
        language={language}
        indent={indent}
        onLanguageChange={setLanguage}
        onIndentChange={setIndent}
        onFormat={handleFormat}
        onMinify={handleMinify}
        onClear={handleClear}
        onToggleSearch={handleToggleSearch}
        onCopy={handleCopy}
        onDownload={handleDownload}
        isSearchVisible={isSearchVisible}
        hasContent={!!content.trim()}
      />

      {isSearchVisible && (
        <div className="relative">
          <SearchWidget
            searchTerm={searchTerm}
            replaceTerm={replaceTerm}
            isReplaceVisible={isReplaceVisible}
            caseSensitive={caseSensitive}
            useRegex={useRegex}
            currentMatch={currentMatchIndex}
            totalMatches={matches.length}
            onSearchChange={setSearchTerm}
            onReplaceChange={setReplaceTerm}
            onToggleReplace={() => setIsReplaceVisible((prev) => !prev)}
            onToggleCaseSensitive={() => setCaseSensitive((prev) => !prev)}
            onToggleRegex={() => setUseRegex((prev) => !prev)}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onReplaceOne={handleReplaceOne}
            onReplaceAll={handleReplaceAll}
            onClose={() => setIsSearchVisible(false)}
          />
        </div>
      )}

      <Editor
        value={content}
        language={language}
        onChange={(newContent) => {
          setContent(newContent);
          // Update history for typing
          if (historyIndex === history.length - 1) {
            const newHistory = [...history, newContent];
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
            if (newHistory.length > 50) {
              setHistory(newHistory.slice(-50));
              setHistoryIndex(49);
            }
          }
        }}
        onPaste={handlePaste}
        matches={matches}
        currentMatchIndex={currentMatchIndex}
      />

      <StatusBar characterCount={content.length} lineCount={lineCount} language={language} />
    </div>
  );
}

export default App;
