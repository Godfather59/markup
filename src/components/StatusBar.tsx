import React from 'react';
import type { LanguageType } from './LanguageSelector';

interface StatusBarProps {
    characterCount: number;
    lineCount: number;
    wordCount: number;
    language: LanguageType;
}

export const StatusBar: React.FC<StatusBarProps> = ({ characterCount, lineCount, wordCount, language }) => {
    return (
        <div className="flex items-center justify-between px-6 py-2 bg-slate-900 dark:bg-slate-900 bg-gray-50 border-t border-slate-800 dark:border-slate-800 border-gray-200 text-sm">
            <div className="flex items-center gap-4">
                <div className="text-slate-400 dark:text-slate-400 text-gray-600">
                    Characters: <span className="text-slate-200 dark:text-slate-200 text-gray-900 font-medium">{characterCount.toLocaleString()}</span>
                </div>
                <div className="text-slate-400 dark:text-slate-400 text-gray-600">
                    Words: <span className="text-slate-200 dark:text-slate-200 text-gray-900 font-medium">{wordCount.toLocaleString()}</span>
                </div>
                <div className="text-slate-400 dark:text-slate-400 text-gray-600">
                    Lines: <span className="text-slate-200 dark:text-slate-200 text-gray-900 font-medium">{lineCount.toLocaleString()}</span>
                </div>
            </div>
            <div className="text-slate-400 dark:text-slate-400 text-gray-600">
                Language: <span className="text-slate-200 dark:text-slate-200 text-gray-900 font-medium uppercase">{language}</span>
            </div>
        </div>
    );
};
