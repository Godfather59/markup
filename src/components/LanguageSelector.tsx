import React from 'react';
import { Code2 } from 'lucide-react';

interface LanguageSelectorProps {
    language: 'json' | 'xml';
    onChange: (language: 'json' | 'xml') => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ language, onChange }) => {
    return (
        <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-slate-400" />
            <div className="flex bg-slate-800 rounded-lg p-1">
                <button
                    onClick={() => onChange('json')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${language === 'json'
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                >
                    JSON
                </button>
                <button
                    onClick={() => onChange('xml')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${language === 'xml'
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                >
                    XML
                </button>
            </div>
        </div>
    );
};
