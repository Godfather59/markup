import React, { useState, useMemo, useCallback, Suspense, lazy } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Header } from './components/Header';
import { Editor } from './components/Editor';
import { StatusBar } from './components/StatusBar';
import type { IndentationType } from './components/IndentationSelector';
import type { LanguageType } from './components/LanguageSelector';
import { formatJSON, formatXML } from './utils/formatters';

// Lazy load components that are not immediately visible
const SearchWidget = lazy(() => import('./components/SearchWidget').then(m => ({ default: m.SearchWidget })));
const LoadingSpinner = lazy(() => import('./components/LoadingSpinner').then(m => ({ default: m.LoadingSpinner })));
const KeyboardShortcutsModal = lazy(() => import('./components/KeyboardShortcutsModal').then(m => ({ default: m.KeyboardShortcutsModal })));
const SettingsPanel = lazy(() => import('./components/SettingsPanel').then(m => ({ default: m.SettingsPanel })));
import { findMatches, replaceAll, replaceOne } from './utils/search';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

function App() {
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState<LanguageType>('json');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [indent, setIndent] = useState<IndentationType>(2);
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isReplaceVisible, setIsReplaceVisible] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState(false);

  // Undo/Redo history
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Load from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('markup-beautifier-content');
    const savedLanguage = localStorage.getItem('markup-beautifier-language') as LanguageType | null;
    const savedIndent = localStorage.getItem('markup-beautifier-indent') as IndentationType | null;
    const savedTheme = localStorage.getItem('markup-beautifier-theme');
    const savedFontSize = localStorage.getItem('markup-beautifier-fontSize');
    const savedWordWrap = localStorage.getItem('markup-beautifier-wordWrap');

    if (saved) {
      setContent(saved);
      setHistory([saved]);
    }
    if (savedLanguage) setLanguage(savedLanguage);
    if (savedIndent) setIndent(savedIndent);
    if (savedTheme === 'light') setIsDarkMode(false);
    if (savedFontSize) setFontSize(Number(savedFontSize));
    if (savedWordWrap === 'true') setWordWrap(true);
  }, []);

  // Apply theme to document root
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Save to localStorage
  React.useEffect(() => {
    if (content) {
      localStorage.setItem('markup-beautifier-content', content);
    }
    localStorage.setItem('markup-beautifier-language', language);
    localStorage.setItem('markup-beautifier-indent', String(indent));
    localStorage.setItem('markup-beautifier-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('markup-beautifier-fontSize', String(fontSize));
    localStorage.setItem('markup-beautifier-wordWrap', String(wordWrap));
  }, [content, language, indent, isDarkMode, fontSize, wordWrap]);

  // Calculate line count
  const lineCount = useMemo(() => {
    if (!content) return 0;
    return content.split('\n').length;
  }, [content]);

  // Calculate word count
  const wordCount = useMemo(() => {
    if (!content.trim()) return 0;
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
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

  // Format handler with dynamic imports for less common formatters
  const handleFormat = useCallback(async () => {
    if (!content.trim()) {
      toast.error('Nothing to format');
      return;
    }

    setIsLoading(true);
    try {
      const indentValue = getIndentString();
      let formatted: string;

      switch (language) {
        case 'json':
          formatted = formatJSON(content, indentValue);
          break;
        case 'xml':
          formatted = formatXML(content, typeof indentValue === 'number' ? ' '.repeat(indentValue) : indentValue);
          break;
        case 'html': {
          const { formatHTML } = await import('./utils/formatters');
          formatted = formatHTML(content, typeof indentValue === 'number' ? ' '.repeat(indentValue) : indentValue);
          break;
        }
        case 'css': {
          const { formatCSS } = await import('./utils/formatters');
          formatted = formatCSS(content, typeof indentValue === 'number' ? ' '.repeat(indentValue) : indentValue);
          break;
        }
        case 'yaml': {
          const { formatYAML } = await import('./utils/formatters');
          formatted = await formatYAML(content, typeof indentValue === 'number' ? indentValue : 2);
          break;
        }
        default:
          formatted = formatJSON(content, indentValue);
      }

      updateContentWithHistory(formatted);
      toast.success(`${language.toUpperCase()} formatted successfully!`);
    } catch (error) {
      toast.error((error as Error).message, { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  }, [content, language, getIndentString, updateContentWithHistory]);

  // Minify handler with dynamic imports
  const handleMinify = useCallback(async () => {
    if (!content.trim()) {
      toast.error('Nothing to minify');
      return;
    }

    setIsLoading(true);
    try {
      let minified: string;

      switch (language) {
        case 'json': {
          const { minifyJSON } = await import('./utils/formatters');
          minified = minifyJSON(content);
          break;
        }
        case 'xml': {
          const { minifyXML } = await import('./utils/formatters');
          minified = minifyXML(content);
          break;
        }
        case 'html': {
          const { minifyHTML } = await import('./utils/formatters');
          minified = minifyHTML(content);
          break;
        }
        case 'css': {
          const { minifyCSS } = await import('./utils/formatters');
          minified = minifyCSS(content);
          break;
        }
        case 'yaml': {
          const { minifyYAML } = await import('./utils/formatters');
          minified = await minifyYAML(content);
          break;
        }
        default: {
          const { minifyJSON } = await import('./utils/formatters');
          minified = minifyJSON(content);
        }
      }

      updateContentWithHistory(minified);
      toast.success(`${language.toUpperCase()} minified successfully!`);
    } catch (error) {
      toast.error((error as Error).message, { duration: 5000 });
    } finally {
      setIsLoading(false);
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
    try {
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
    } catch (error) {
      console.error('Failed to initialize worker:', error);
      toast.error('Worker initialization failed. Some features may be disabled.');
    }
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
    let detectedLang: LanguageType | null = null;

    // Auto-detect language
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      detectedLang = 'json';
      setLanguage('json');
    } else if (trimmed.startsWith('<?xml') || (trimmed.startsWith('<') && trimmed.includes('</'))) {
      detectedLang = 'xml';
      setLanguage('xml');
    } else if (trimmed.startsWith('<!DOCTYPE') || (trimmed.startsWith('<html') || trimmed.startsWith('<div'))) {
      detectedLang = 'html';
      setLanguage('html');
    } else if (trimmed.includes('{') && trimmed.includes('}') && trimmed.includes(':')) {
      // Could be CSS or JSON, check for CSS selectors
      if (trimmed.match(/[a-zA-Z-]+\s*\{/)) {
        detectedLang = 'css';
        setLanguage('css');
      } else {
        detectedLang = 'json';
        setLanguage('json');
      }
    } else if (trimmed.includes(':') && !trimmed.includes('{') && !trimmed.includes('<')) {
      detectedLang = 'yaml';
      setLanguage('yaml');
    }

    // Only auto-format JSON and XML for now (worker limitation)
    if ((detectedLang === 'json' || detectedLang === 'xml') && workerRef.current) {
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

  // Replace one (stay at current position)
  const handleReplaceOne = useCallback(() => {
    if (!searchTerm || matches.length === 0) return;

    const result = replaceOne(content, searchTerm, replaceTerm, currentMatchIndex, matches);
    updateContentWithHistory(result.content);

    // Recalculate matches after replacement
    const newMatches = findMatches(result.content, searchTerm, caseSensitive, useRegex);
    setCurrentMatchIndex(Math.min(currentMatchIndex, newMatches.length - 1));

    if (newMatches.length === 0) {
      toast.success('Replaced (no more matches)');
      setSearchTerm('');
      setReplaceTerm('');
    } else {
      toast.success(`Replaced (${newMatches.length} remaining)`);
    }
  }, [content, searchTerm, replaceTerm, currentMatchIndex, matches, caseSensitive, useRegex, updateContentWithHistory]);

  // Replace one and move to next
  const handleReplaceOneAndNext = useCallback(() => {
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

  // File upload handler
  const handleFileUpload = useCallback(async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        updateContentWithHistory(text);

        // Auto-detect language
        const trimmed = text.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          setLanguage('json');
        } else if (trimmed.startsWith('<')) {
          setLanguage('xml');
        }

        toast.success('File loaded successfully!');
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsText(file);
  }, [updateContentWithHistory]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const file = files.find(f => f.name.endsWith('.json') || f.name.endsWith('.xml') || f.name.endsWith('.txt'));

    if (file) {
      handleFileUpload(file);
    } else {
      toast.error('Please drop a JSON or XML file');
    }
  }, [handleFileUpload]);

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
    onToggleHelp: () => setShowShortcuts(prev => !prev),
  });

  console.log('App version: 2025-12-29 15:08');
  return (
    <div
      className={`h-screen w-screen flex flex-col ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
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
        isDarkMode={isDarkMode}
        onLanguageChange={setLanguage}
        onIndentChange={setIndent}
        onFormat={handleFormat}
        onMinify={handleMinify}
        onClear={handleClear}
        onToggleSearch={handleToggleSearch}
        onCopy={handleCopy}
        onDownload={handleDownload}
        onFileUpload={handleFileUpload}
        onToggleTheme={() => setIsDarkMode(prev => !prev)}
        onOpenSettings={() => setShowSettings(true)}
        isSearchVisible={isSearchVisible}
        hasContent={!!content.trim()}
      />

      {isSearchVisible && (
        <div className="relative">
          <Suspense fallback={<div className="bg-slate-800 px-4 py-3 border-b border-slate-700">Loading search...</div>}>
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
              onReplaceOneAndNext={handleReplaceOneAndNext}
              onReplaceAll={handleReplaceAll}
              onClose={() => setIsSearchVisible(false)}
            />
          </Suspense>
        </div>
      )}

      <Editor
        value={content}
        language={language}
        isDarkMode={isDarkMode}
        fontSize={fontSize}
        wordWrap={wordWrap}
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

      <StatusBar characterCount={content.length} lineCount={lineCount} wordCount={wordCount} language={language} />

      <Suspense fallback={null}>
        <LoadingSpinner isLoading={isLoading} />
      </Suspense>
      <Suspense fallback={null}>
        <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      </Suspense>
      <Suspense fallback={null}>
        <SettingsPanel
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          language={language}
          indent={indent}
          isDarkMode={isDarkMode}
          onLanguageChange={setLanguage}
          onIndentChange={setIndent}
          onThemeChange={setIsDarkMode}
          fontSize={fontSize}
          wordWrap={wordWrap}
          onFontSizeChange={setFontSize}
          onWordWrapChange={setWordWrap}
        />
      </Suspense>
    </div>
  );
}

export default App;
