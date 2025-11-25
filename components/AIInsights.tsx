import React from 'react';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    CheckCircle,
    Info,
    DollarSign,
    Users,
    Lightbulb
} from 'lucide-react';
import { AIInsight } from '../utils/analytics';

interface AIInsightsProps {
    insights: AIInsight[];
    onInsightClick?: (insight: AIInsight) => void;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ insights, onInsightClick }) => {
    if (insights.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">AI Insights</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Smart recommendations for your institute</p>
                    </div>
                </div>
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <Info className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No insights available at the moment</p>
                </div>
            </div>
        );
    }

    const getIcon = (type: AIInsight['type']) => {
        switch (type) {
            case 'risk':
                return <AlertTriangle className="w-5 h-5" />;
            case 'alert':
                return <Info className="w-5 h-5" />;
            case 'success':
                return <CheckCircle className="w-5 h-5" />;
            case 'opportunity':
                return <TrendingUp className="w-5 h-5" />;
            default:
                return <Info className="w-5 h-5" />;
        }
    };

    const getColors = (type: AIInsight['type'], priority: AIInsight['priority']) => {
        if (priority === 'high') {
            return {
                bg: 'bg-red-50 dark:bg-red-900/20',
                border: 'border-red-200 dark:border-red-800',
                icon: 'text-red-600 dark:text-red-400',
                badge: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
            };
        }

        switch (type) {
            case 'risk':
                return {
                    bg: 'bg-orange-50 dark:bg-orange-900/20',
                    border: 'border-orange-200 dark:border-orange-800',
                    icon: 'text-orange-600 dark:text-orange-400',
                    badge: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300'
                };
            case 'alert':
                return {
                    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
                    border: 'border-yellow-200 dark:border-yellow-800',
                    icon: 'text-yellow-600 dark:text-yellow-400',
                    badge: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                };
            case 'success':
                return {
                    bg: 'bg-green-50 dark:bg-green-900/20',
                    border: 'border-green-200 dark:border-green-800',
                    icon: 'text-green-600 dark:text-green-400',
                    badge: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                };
            case 'opportunity':
                return {
                    bg: 'bg-blue-50 dark:bg-blue-900/20',
                    border: 'border-blue-200 dark:border-blue-800',
                    icon: 'text-blue-600 dark:text-blue-400',
                    badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                };
            default:
                return {
                    bg: 'bg-slate-50 dark:bg-slate-900/20',
                    border: 'border-slate-200 dark:border-slate-700',
                    icon: 'text-slate-600 dark:text-slate-400',
                    badge: 'bg-slate-100 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300'
                };
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">AI Insights</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Smart recommendations for your institute</p>
                </div>
            </div>

            <div className="space-y-3">
                {insights.slice(0, 5).map((insight, index) => {
                    const colors = getColors(insight.type, insight.priority);

                    return (
                        <motion.div
                            key={insight.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => onInsightClick?.(insight)}
                            className={`p-4 rounded-lg border ${colors.bg} ${colors.border} ${insight.actionable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`${colors.icon} mt-0.5`}>
                                    {getIcon(insight.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                                            {insight.title}
                                        </h4>
                                        {insight.priority === 'high' && (
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors.badge} shrink-0`}>
                                                Urgent
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                                        {insight.description}
                                    </p>

                                    <div className="flex items-center gap-3 text-xs">
                                        {insight.count !== undefined && (
                                            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                                <Users className="w-3.5 h-3.5" />
                                                <span>{insight.count} student{insight.count !== 1 ? 's' : ''}</span>
                                            </div>
                                        )}

                                        {insight.amount !== undefined && (
                                            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                                <DollarSign className="w-3.5 h-3.5" />
                                                <span>₹{Math.round(insight.amount).toLocaleString('en-IN')}</span>
                                            </div>
                                        )}

                                        {insight.actionable && (
                                            <span className="ml-auto text-blue-600 dark:text-blue-400 font-medium">
                                                Take Action →
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {insights.length > 5 && (
                <div className="mt-4 text-center">
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                        View All Insights ({insights.length})
                    </button>
                </div>
            )}
        </div>
    );
};
