import React from 'react';
import { X, Settings } from 'lucide-react';
import type { LanguageType } from './LanguageSelector';
import type { IndentationType } from './IndentationSelector';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    language: LanguageType;
    indent: IndentationType;
    isDarkMode: boolean;
    fontSize: number;
    wordWrap: boolean;
    onLanguageChange: (language: LanguageType) => void;
    onIndentChange: (indent: IndentationType) => void;
    onThemeChange: (isDark: boolean) => void;
    onFontSizeChange: (size: number) => void;
    onWordWrapChange: (wrap: boolean) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
    isOpen,
    onClose,
    language,
    indent,
    isDarkMode,
    fontSize,
    wordWrap,
    onLanguageChange,
    onIndentChange,
    onThemeChange,
    onFontSizeChange,
    onWordWrapChange,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 border border-slate-700"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-2xl font-bold text-white">Settings</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Language Setting */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Default Language
                        </label>
                        <select
                            value={language}
                            onChange={(e) => onLanguageChange(e.target.value as LanguageType)}
                            className="w-full bg-slate-900 text-slate-200 px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500"
                        >
                            <option value="json">JSON</option>
                            <option value="xml">XML</option>
                            <option value="html">HTML</option>
                            <option value="css">CSS</option>
                            <option value="yaml">YAML</option>
                        </select>
                    </div>

                    {/* Indentation Setting */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Default Indentation
                        </label>
                        <select
                            value={indent}
                            onChange={(e) => onIndentChange(e.target.value === 'tab' ? 'tab' : Number(e.target.value) as 2 | 4)}
                            className="w-full bg-slate-900 text-slate-200 px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500"
                        >
                            <option value={2}>2 Spaces</option>
                            <option value={4}>4 Spaces</option>
                            <option value="tab">Tab</option>
                        </select>
                    </div>

                    {/* Font Size Setting */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Font Size: <span className="text-indigo-400">{fontSize}px</span>
                        </label>
                        <input
                            type="range"
                            min="10"
                            max="24"
                            value={fontSize}
                            onChange={(e) => onFontSizeChange(Number(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>10px</span>
                            <span>24px</span>
                        </div>
                    </div>

                    {/* Word Wrap Setting */}
                    <div>
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-sm font-medium text-slate-300">Word Wrap</span>
                            <button
                                onClick={() => onWordWrapChange(!wordWrap)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    wordWrap ? 'bg-indigo-600' : 'bg-slate-700'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        wordWrap ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </label>
                    </div>

                    {/* Theme Setting */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Theme
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onThemeChange(true)}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                                    isDarkMode
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                            >
                                Dark
                            </button>
                            <button
                                onClick={() => onThemeChange(false)}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                                    !isDarkMode
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                            >
                                Light
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700">
                    <p className="text-xs text-slate-400 text-center">
                        Settings are automatically saved to your browser
                    </p>
                </div>
            </div>
        </div>
    );
};

