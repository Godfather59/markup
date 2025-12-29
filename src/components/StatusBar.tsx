import React from 'react';

interface StatusBarProps {
    characterCount: number;
    language: 'json' | 'xml';
}

export const StatusBar: React.FC<StatusBarProps> = ({ characterCount, language }) => {
    return (
        <div className="flex items-center justify-between px-6 py-2 bg-slate-900 border-t border-slate-800 text-sm">
            <div className="text-slate-400">
                Characters: <span className="text-slate-200 font-medium">{characterCount.toLocaleString()}</span>
            </div>
            <div className="text-slate-400">
                Language: <span className="text-slate-200 font-medium uppercase">{language}</span>
            </div>
        </div>
    );
};
