import React from 'react';

interface LoadingSpinnerProps {
    isLoading: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ isLoading }) => {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-6 flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white text-sm">Processing...</p>
            </div>
        </div>
    );
};

