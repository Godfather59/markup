import React from 'react';
import { X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modKey = isMac ? 'Cmd' : 'Ctrl';

    const shortcuts = [
        { category: 'General', items: [
            { keys: [`${modKey}`, 'B'], description: 'Format/Beautify' },
            { keys: [`${modKey}`, 'F'], description: 'Toggle Search' },
            { keys: ['Esc'], description: 'Close Search' },
        ]},
        { category: 'Editing', items: [
            { keys: [`${modKey}`, 'Z'], description: 'Undo' },
            { keys: [`${modKey}`, 'Shift', 'Z'], description: 'Redo' },
            { keys: [`${modKey}`, 'Y'], description: 'Redo (alternative)' },
        ]},
        { category: 'Search', items: [
            { keys: ['Enter'], description: 'Next Match' },
            { keys: ['Shift', 'Enter'], description: 'Previous Match' },
            { keys: ['Enter'], description: 'Replace Current (in replace mode)' },
        ]},
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div 
                className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 border border-slate-700"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Keyboard Shortcuts</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    {shortcuts.map((category) => (
                        <div key={category.category}>
                            <h3 className="text-lg font-semibold text-slate-200 mb-3">{category.category}</h3>
                            <div className="space-y-2">
                                {category.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-700">
                                        <span className="text-slate-300">{item.description}</span>
                                        <div className="flex items-center gap-1">
                                            {item.keys.map((key, keyIdx) => (
                                                <React.Fragment key={keyIdx}>
                                                    <kbd className="px-2 py-1 bg-slate-900 text-slate-200 rounded text-sm font-mono border border-slate-600">
                                                        {key}
                                                    </kbd>
                                                    {keyIdx < item.keys.length - 1 && (
                                                        <span className="text-slate-500 mx-1">+</span>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700">
                    <p className="text-sm text-slate-400 text-center">
                        Press <kbd className="px-2 py-1 bg-slate-900 text-slate-200 rounded text-xs font-mono border border-slate-600">?</kbd> to toggle this help
                    </p>
                </div>
            </div>
        </div>
    );
};

