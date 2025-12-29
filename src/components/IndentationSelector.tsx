import React from 'react';
import { Indent } from 'lucide-react';

export type IndentationType = 2 | 4 | 'tab';

interface IndentationSelectorProps {
    indent: IndentationType;
    onChange: (indent: IndentationType) => void;
}

export const IndentationSelector: React.FC<IndentationSelectorProps> = ({ indent, onChange }) => {
    return (
        <div className="flex items-center gap-2">
            <Indent className="w-4 h-4 text-slate-400" />
            <select
                value={indent}
                onChange={(e) => onChange(e.target.value === 'tab' ? 'tab' : Number(e.target.value) as 2 | 4)}
                className="bg-slate-800 text-slate-200 text-sm px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 focus:outline-none focus:border-indigo-500 cursor-pointer"
                title="Indentation"
            >
                <option value={2}>2 Spaces</option>
                <option value={4}>4 Spaces</option>
                <option value="tab">Tab</option>
            </select>
        </div>
    );
};

