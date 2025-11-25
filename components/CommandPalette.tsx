import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command, User, FileText, Settings, Users, BarChart2, Calendar, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const { students, enquiries } = useData();
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Navigation Items
    const navItems = [
        { name: 'Dashboard', path: '/', icon: BarChart2, type: 'Navigation' },
        { name: 'Students', path: '/students', icon: Users, type: 'Navigation' },
        { name: 'Enquiries', path: '/enquiries', icon: FileText, type: 'Navigation' },
        { name: 'Attendance', path: '/attendance', icon: Calendar, type: 'Navigation' },
        { name: 'Reports', path: '/reports', icon: BarChart2, type: 'Navigation' },
        { name: 'Settings', path: '/settings', icon: Settings, type: 'Navigation' },
    ];

    // Filtered Results
    const filteredResults = [
        ...navItems.filter(item => item.name.toLowerCase().includes(query.toLowerCase())),
        ...students.filter(s => s.name.toLowerCase().includes(query.toLowerCase())).map(s => ({
            name: s.name,
            path: `/students/${s.id}`,
            icon: User,
            type: 'Student',
            detail: s.course
        })).slice(0, 5),
        ...enquiries.filter(e => e.name.toLowerCase().includes(query.toLowerCase())).map(e => ({
            name: e.name,
            path: `/enquiries/edit/${e.id}`,
            icon: FileText,
            type: 'Enquiry',
            detail: e.courseInterested
        })).slice(0, 3)
    ];

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredResults.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredResults.length) % filteredResults.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredResults[selectedIndex]) {
                    handleSelect(filteredResults[selectedIndex].path);
                }
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredResults, selectedIndex]);

    const handleSelect = (path: string) => {
        navigate(path);
        onClose();
        setQuery('');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                    <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                        <Search className="w-5 h-5 text-slate-400 mr-3" />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Type to search..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400"
                        />
                        <div className="flex gap-2">
                            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-1.5 font-mono text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                <span className="text-xs">ESC</span>
                            </kbd>
                        </div>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto py-2">
                        {filteredResults.length > 0 ? (
                            filteredResults.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSelect(item.path)}
                                    className={`w-full flex items-center px-4 py-3 text-left transition-colors ${index === selectedIndex
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                        }`}
                                >
                                    <item.icon className={`w-4 h-4 mr-3 ${index === selectedIndex ? 'text-blue-500' : 'text-slate-400'}`} />
                                    <div className="flex-1">
                                        <span className="font-medium">{item.name}</span>
                                        {item.detail && (
                                            <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">• {item.detail}</span>
                                        )}
                                    </div>
                                    <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">
                                        {item.type}
                                    </span>
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                                No results found for "{query}"
                            </div>
                        )}
                    </div>
                    <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-400 flex justify-between">
                        <span>Use arrow keys to navigate</span>
                        <span>Press Enter to select</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
