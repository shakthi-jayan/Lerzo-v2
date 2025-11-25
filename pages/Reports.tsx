import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { Download, Filter, Calendar, TrendingUp, DollarSign, Users, PieChart as PieIcon, BarChart as BarIcon } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO } from 'date-fns';
import { EnquiryStatus } from '../types';

type TimeRange = 'week' | 'month' | 'year';

export const Reports = () => {
    const { payments, students, enquiries, courses } = useData();
    const { theme } = useTheme();
    const [timeRange, setTimeRange] = useState<TimeRange>('month');

    // --- Data Processing ---

    // Common Date Range Calculation
    const { startDate, endDate, dateFormat } = useMemo(() => {
        const now = new Date();
        let start = startOfMonth(now);
        let end = endOfMonth(now);
        let formatStr = 'dd MMM';

        if (timeRange === 'week') {
            start = startOfWeek(now);
            end = endOfWeek(now);
            formatStr = 'EEE';
        } else if (timeRange === 'year') {
            start = startOfYear(now);
            end = endOfYear(now);
            formatStr = 'MMM';
        }

        return { startDate: start, endDate: end, dateFormat: formatStr };
    }, [timeRange]);

    // 1. Financial Data
    const financialData = useMemo(() => {
        const filteredPayments = payments.filter(p =>
            p.date && isWithinInterval(parseISO(p.date), { start: startDate, end: endDate })
        );

        const groupedData: Record<string, { name: string, income: number }> = {};

        // Initialize all periods for the range to ensure x-axis continuity
        if (timeRange === 'week') {
            for (let i = 0; i < 7; i++) {
                const day = new Date(startDate);
                day.setDate(startDate.getDate() + i);
                const key = format(day, dateFormat);
                groupedData[key] = { name: key, income: 0 };
            }
        } else if (timeRange === 'year') {
            for (let i = 0; i < 12; i++) {
                const month = new Date(startDate);
                month.setMonth(startDate.getMonth() + i);
                const key = format(month, dateFormat);
                groupedData[key] = { name: key, income: 0 };
            }
        }

        filteredPayments.forEach(p => {
            if (!p.date) return;
            const date = parseISO(p.date);
            const key = format(date, dateFormat);

            if (!groupedData[key]) {
                groupedData[key] = { name: key, income: 0 };
            }
            groupedData[key].income += Number(p.amount);
        });

        return Object.values(groupedData);
    }, [payments, startDate, endDate, dateFormat, timeRange]);

    // 2. Course Popularity (Based on new enrollments in period)
    const coursePopularityData = useMemo(() => {
        // Filter students joined in this period
        const newStudents = students.filter(s =>
            s.joinDate && isWithinInterval(parseISO(s.joinDate), { start: startDate, end: endDate })
        );

        return courses.map(course => ({
            name: course.name,
            students: newStudents.filter(s => s.course === course.name).length
        })).sort((a, b) => b.students - a.students).slice(0, 5);
    }, [courses, students, startDate, endDate]);

    // 3. Enquiry Status (Based on enquiries added in period)
    const enquiryStatusData = useMemo(() => {
        const periodEnquiries = enquiries.filter(e =>
            e.addedOn && isWithinInterval(parseISO(e.addedOn), { start: startDate, end: endDate })
        );

        const counts: { [key: string]: number } = {};
        periodEnquiries.forEach(e => {
            const status = e.status || 'Unknown';
            counts[status] = (counts[status] || 0) + 1;
        });

        const result = Object.entries(counts).map(([name, value], index) => {
            let color = '#94a3b8'; // Default
            if (name === 'Active') color = '#3b82f6';
            else if (name === 'Converted') color = '#22c55e';
            else if (name === 'Closed') color = '#ef4444';
            else {
                const otherColors = ['#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
                color = otherColors[index % otherColors.length];
            }

            return { name, value, color };
        });

        return result.length > 0 ? result : [{ name: 'No Data', value: 1, color: '#e2e8f0' }];
    }, [enquiries, startDate, endDate]);

    // 4. Student Growth (Trend within the period)
    const studentGrowthData = useMemo(() => {
        const data: { name: string, students: number }[] = [];

        if (timeRange === 'week') {
            // Daily growth for the week
            for (let i = 0; i < 7; i++) {
                const day = new Date(startDate);
                day.setDate(startDate.getDate() + i);
                const dayStr = format(day, dateFormat);

                const count = students.filter(s =>
                    s.joinDate && format(parseISO(s.joinDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
                ).length;

                data.push({ name: dayStr, students: count });
            }
        } else if (timeRange === 'month') {
            // Daily growth for the month
            let current = new Date(startDate);
            while (current <= endDate) {
                const dayStr = format(current, dateFormat);
                const currentStr = format(current, 'yyyy-MM-dd');

                const count = students.filter(s =>
                    s.joinDate && format(parseISO(s.joinDate), 'yyyy-MM-dd') === currentStr
                ).length;

                data.push({ name: dayStr, students: count });
                current.setDate(current.getDate() + 1);
            }
        } else {
            // Yearly - Monthly growth
            for (let i = 0; i < 12; i++) {
                const month = new Date(startDate);
                month.setMonth(startDate.getMonth() + i);
                const monthStart = startOfMonth(month);
                const monthEnd = endOfMonth(month);
                const monthName = format(month, dateFormat);

                const count = students.filter(s =>
                    s.joinDate && isWithinInterval(parseISO(s.joinDate), { start: monthStart, end: monthEnd })
                ).length;

                data.push({ name: monthName, students: count });
            }
        }
        return data;
    }, [students, timeRange, startDate, endDate, dateFormat]);


    // Chart Colors & Styles
    const chartColors = {
        grid: theme === 'dark' ? '#334155' : '#e2e8f0',
        text: theme === 'dark' ? '#94a3b8' : '#64748b',
        tooltipBg: theme === 'dark' ? '#1e293b' : '#ffffff',
        tooltipColor: theme === 'dark' ? '#f8fafc' : '#1e293b',
        bar: '#3b82f6',
        line: '#8b5cf6'
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ backgroundColor: chartColors.tooltipBg, color: chartColors.tooltipColor }} className="p-3 border border-slate-200 dark:border-slate-700 rounded shadow-lg text-sm">
                    <p className="font-bold mb-1">{label}</p>
                    {payload.map((p: any, index: number) => (
                        <p key={index} style={{ color: p.color }}>
                            {p.name}: {p.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 pb-20"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <BarIcon className="w-8 h-8 text-slate-800 dark:text-slate-100" />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Analytics & Reports</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Comprehensive insights into your institute</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 flex">
                        {(['week', 'month', 'year'] as TimeRange[]).map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${timeRange === range
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {range.charAt(0).toUpperCase() + range.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Financial Chart */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-500" /> Revenue
                        </h3>
                    </div>
                    <div className="h-[300px] w-full min-w-[100px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={financialData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                                <XAxis dataKey="name" stroke={chartColors.text} fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke={chartColors.text} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: theme === 'dark' ? '#334155' : '#f1f5f9', opacity: 0.4 }} />
                                <Bar dataKey="income" name="Income" fill={chartColors.bar} radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Student Growth Chart */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                            <Users className="w-5 h-5 text-purple-500" /> Student Growth
                        </h3>
                    </div>
                    <div className="h-[300px] w-full min-w-[100px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={studentGrowthData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                                <XAxis dataKey="name" stroke={chartColors.text} fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke={chartColors.text} fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="students" name="New Students" stroke={chartColors.line} strokeWidth={3} dot={{ r: 4, fill: chartColors.line }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Course Popularity */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-orange-500" /> Top Courses
                        </h3>
                    </div>
                    <div className="h-[300px] w-full min-w-[100px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={coursePopularityData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} horizontal={false} />
                                <XAxis type="number" stroke={chartColors.text} fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis dataKey="name" type="category" stroke={chartColors.text} fontSize={12} tickLine={false} axisLine={false} width={100} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: theme === 'dark' ? '#334155' : '#f1f5f9', opacity: 0.4 }} />
                                <Bar dataKey="students" name="Students" fill="#f97316" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Enquiry Status */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                            <PieIcon className="w-5 h-5 text-blue-500" /> Enquiry Status
                        </h3>
                    </div>
                    <div className="h-[300px] w-full flex items-center justify-center min-w-[100px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={enquiryStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {enquiryStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
