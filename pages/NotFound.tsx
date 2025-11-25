import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const NotFound = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to login after 2 seconds
        const timer = setTimeout(() => {
            navigate('/login');
        }, 2000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-4 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl w-full text-center space-y-8"
            >
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    The page you're looking<br />for can't be found.
                </h1>

                <div className="relative max-w-md mx-auto">
                    <input
                        type="text"
                        disabled
                        placeholder="Search lerzo.com"
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                    />
                    <svg className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                    >
                        Redirecting to login page...
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
