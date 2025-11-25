import React, { useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: AlertType;
    duration?: number; // Auto close duration in ms
}

export const AlertModal: React.FC<AlertProps> = ({
    isOpen,
    onClose,
    title,
    message,
    type = 'info',
    duration
}) => {

    useEffect(() => {
        if (isOpen && duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isOpen, duration, onClose]);

    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle className="w-6 h-6 text-green-600" />;
            case 'error': return <AlertCircle className="w-6 h-6 text-red-600" />;
            case 'warning': return <AlertCircle className="w-6 h-6 text-amber-600" />;
            default: return <Info className="w-6 h-6 text-blue-600" />;
        }
    };

    const getColors = () => {
        switch (type) {
            case 'success': return 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800 text-green-800 dark:text-green-300';
            case 'error': return 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-800 dark:text-red-300';
            case 'warning': return 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800 text-amber-800 dark:text-amber-300';
            default: return 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-800 dark:text-blue-300';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-full ${getColors()} bg-opacity-50`}>
                            {getIcon()}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">{title}</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{message}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 flex justify-end border-t border-slate-100 dark:border-slate-700">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white text-sm font-medium rounded-md hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors shadow-sm"
                    >
                        Okay
                    </button>
                </div>
            </div>
        </div>
    );
};
