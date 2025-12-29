import React from 'react';
import { Code2 } from 'lucide-react';

export type LanguageType = 'json' | 'xml' | 'html' | 'css' | 'yaml';

interface LanguageSelectorProps {
    language: LanguageType;
    onChange: (language: LanguageType) => void;
}

const languages: { value: LanguageType; label: string }[] = [
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'yaml', label: 'YAML' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ language, onChange }) => {
    return (
        <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-slate-400" />
            <select
                value={language}
                onChange={(e) => onChange(e.target.value as LanguageType)}
                className="bg-slate-800 text-slate-200 text-sm px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 focus:outline-none focus:border-indigo-500 cursor-pointer"
                title="Select Language"
            >
                {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                        {lang.label}
                    </option>
                ))}
            </select>
        </div>
    );
};
