import React, { useRef } from 'react';
import { Sparkles, Trash2, Search as SearchIcon, Copy, Download, Minus, Upload, Sun, Moon, Settings } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import type { LanguageType } from './LanguageSelector';
import { IndentationSelector } from './IndentationSelector';
import type { IndentationType } from './IndentationSelector';

interface HeaderProps {
    language: LanguageType;
    indent: IndentationType;
    isDarkMode: boolean;
    onLanguageChange: (language: LanguageType) => void;
    onIndentChange: (indent: IndentationType) => void;
    onFormat: () => void;
    onMinify: () => void;
    onClear: () => void;
    onToggleSearch: () => void;
    onCopy: () => void;
    onDownload: () => void;
    onFileUpload: (file: File) => void;
    onToggleTheme: () => void;
    onOpenSettings: () => void;
    isSearchVisible: boolean;
    hasContent: boolean;
}

export const Header: React.FC<HeaderProps> = ({
    language,
    indent,
    isDarkMode,
    onLanguageChange,
    onIndentChange,
    onFormat,
    onMinify,
    onClear,
    onToggleSearch,
    onCopy,
    onDownload,
    onFileUpload,
    onToggleTheme,
    onOpenSettings,
    isSearchVisible,
    hasContent,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileUpload(file);
        }
        // Reset input so same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    return (
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 dark:bg-slate-900 bg-white border-b border-slate-800 dark:border-slate-800 border-gray-200">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white dark:text-white text-gray-900">Markup Beautifier</h1>
                    <p className="text-xs text-slate-400 dark:text-slate-400 text-gray-600">Format JSON & XML with ease</p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
                <LanguageSelector language={language} onChange={onLanguageChange} />
                <IndentationSelector indent={indent} onChange={onIndentChange} />

                <div className="h-6 w-px bg-slate-700" />

                {/* Action Buttons */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.xml,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
                    title="Upload File"
                >
                    <Upload className="w-5 h-5" />
                </button>

                <button
                    onClick={onCopy}
                    disabled={!hasContent}
                    className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Copy to Clipboard"
                >
                    <Copy className="w-5 h-5" />
                </button>

                <button
                    onClick={onDownload}
                    disabled={!hasContent}
                    className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Download File"
                >
                    <Download className="w-5 h-5" />
                </button>

                <button
                    onClick={onToggleTheme}
                    className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
                    title="Toggle Theme"
                >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <button
                    onClick={onOpenSettings}
                    className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
                    title="Settings"
                >
                    <Settings className="w-5 h-5" />
                </button>

                <button
                    onClick={onToggleSearch}
                    className={`p-2 rounded-lg transition-all ${isSearchVisible
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                    title="Toggle Search (Ctrl+F)"
                >
                    <SearchIcon className="w-5 h-5" />
                </button>

                <button
                    onClick={onFormat}
                    disabled={!hasContent}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Format (Ctrl+B)"
                >
                    <Sparkles className="w-4 h-4" />
                    Beautify
                </button>

                <button
                    onClick={onMinify}
                    disabled={!hasContent}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all font-medium disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Minify"
                >
                    <Minus className="w-4 h-4" />
                    Minify
                </button>

                <button
                    onClick={onClear}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all"
                    title="Clear"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
