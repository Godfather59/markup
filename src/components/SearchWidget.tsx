import React from 'react';
import { Search, X, ChevronUp, ChevronDown, Replace, Type, Hash } from 'lucide-react';

interface SearchWidgetProps {
    searchTerm: string;
    replaceTerm: string;
    isReplaceVisible: boolean;
    caseSensitive: boolean;
    useRegex: boolean;
    currentMatch: number;
    totalMatches: number;
    onSearchChange: (value: string) => void;
    onReplaceChange: (value: string) => void;
    onToggleReplace: () => void;
    onToggleCaseSensitive: () => void;
    onToggleRegex: () => void;
    onNext: () => void;
    onPrevious: () => void;
    onReplaceOne: () => void;
    onReplaceOneAndNext: () => void;
    onReplaceAll: () => void;
    onClose: () => void;
}

export const SearchWidget: React.FC<SearchWidgetProps> = ({
    searchTerm,
    replaceTerm,
    isReplaceVisible,
    caseSensitive,
    useRegex,
    currentMatch,
    totalMatches,
    onSearchChange,
    onReplaceChange,
    onToggleReplace,
    onToggleCaseSensitive,
    onToggleRegex,
    onNext,
    onPrevious,
    onReplaceOne,
    onReplaceOneAndNext,
    onReplaceAll,
    onClose,
}) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (e.shiftKey) {
                onPrevious();
            } else {
                onNext();
            }
        }
    };

    return (
        <div className="flex items-center gap-3 bg-slate-800 px-4 py-3 border-b border-slate-700">
            <Search className="w-4 h-4 text-slate-400" />

            {/* Search Input */}
            <div className="flex items-center gap-2 flex-1">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Find..."
                    className="flex-1 bg-slate-900 text-white px-3 py-1.5 rounded-md border border-slate-700 focus:outline-none focus:border-indigo-500 text-sm"
                />

                {/* Match Counter */}
                {searchTerm && (
                    <span className="text-xs text-slate-400 min-w-[3rem] text-center">
                        {totalMatches > 0 ? `${currentMatch + 1}/${totalMatches}` : '0/0'}
                    </span>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-1">
                    <button
                        onClick={onPrevious}
                        disabled={totalMatches === 0}
                        className="p-1 rounded hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Previous (Shift+Enter)"
                    >
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                    </button>
                    <button
                        onClick={onNext}
                        disabled={totalMatches === 0}
                        className="p-1 rounded hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Next (Enter)"
                    >
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                </div>

                {/* Case Sensitive Toggle */}
                <button
                    onClick={onToggleCaseSensitive}
                    className={`p-1.5 rounded ${caseSensitive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-700'
                        }`}
                    title="Case Sensitive"
                >
                    <Type className="w-4 h-4" />
                </button>

                {/* Regex Toggle */}
                <button
                    onClick={onToggleRegex}
                    className={`p-1.5 rounded ${useRegex ? 'bg-indigo-600 text-white' : 'hover:bg-slate-700'
                        }`}
                    title="Use Regular Expression"
                >
                    <Hash className="w-4 h-4" />
                </button>

                {/* Replace Toggle */}
                <button
                    onClick={onToggleReplace}
                    className={`p-1.5 rounded ${isReplaceVisible ? 'bg-indigo-600 text-white' : 'hover:bg-slate-700'
                        }`}
                    title="Toggle Replace"
                >
                    <Replace className="w-4 h-4" />
                </button>
            </div>

            {/* Close Button */}
            <button
                onClick={onClose}
                className="p-1 rounded hover:bg-slate-700"
                title="Close (Esc)"
            >
                <X className="w-4 h-4 text-slate-400" />
            </button>

            {/* Replace Input Row */}
            {isReplaceVisible && (
                <div className="flex items-center gap-2 absolute left-0 right-0 top-full bg-slate-800 px-4 py-2 border-b border-slate-700">
                    <div className="w-8" /> {/* Spacer for alignment */}
                    <input
                        type="text"
                        value={replaceTerm}
                        onChange={(e) => onReplaceChange(e.target.value)}
                        placeholder="Replace with..."
                        className="flex-1 bg-slate-900 text-white px-3 py-1.5 rounded-md border border-slate-700 focus:outline-none focus:border-indigo-500 text-sm"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                onReplaceOneAndNext();
                            }
                        }}
                    />
                    <button
                        onClick={onReplaceOne}
                        disabled={!searchTerm || totalMatches === 0}
                        className="px-3 py-1.5 bg-indigo-500 text-white rounded-md text-sm font-medium hover:bg-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Replace Current"
                    >
                        Replace
                    </button>
                    <button
                        onClick={onReplaceOneAndNext}
                        disabled={!searchTerm || totalMatches === 0}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Replace & Find Next (Enter)"
                    >
                        Replace & Next
                    </button>
                    <button
                        onClick={onReplaceAll}
                        disabled={!searchTerm || totalMatches === 0}
                        className="px-3 py-1.5 bg-indigo-700 text-white rounded-md text-sm font-medium hover:bg-indigo-800 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        Replace All
                    </button>
                </div>
            )}
        </div>
    );
};
