import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, User, Phone, Mail, Briefcase } from 'lucide-react';
import { useData } from '../context/DataContext';

export const StaffList = () => {
    const { staff, deleteStaff, staffAttendance } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const today = new Date().toISOString().split('T')[0];

    const filteredStaff = staff.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.mobile.includes(searchQuery) ||
        s.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.staffId && s.staffId.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this staff member?')) {
            await deleteStaff(id);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 pb-20"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <User className="w-8 h-8 text-slate-800 dark:text-slate-100" />
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Staff Management</h1>
                </div>
                <Link
                    to="/staff/add"
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" /> Add New Staff
                </Link>
            </div>

            {/* Search and Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, mobile, or designation..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                    />
                </div>
                <div className="bg-white dark:bg-slate-800 p-2 px-4 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Staff</span>
                    <span className="text-xl font-bold text-slate-800 dark:text-slate-100">{staff.length}</span>
                </div>
            </div>

            {/* Staff List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStaff.length > 0 ? (
                    filteredStaff.map((member) => {
                        const todayRecord = staffAttendance.find(a => a.staffId === member.id && a.date === today);
                        return (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="p-5 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{member.name}</h3>
                                            <p className="text-xs text-slate-500 font-mono mb-1">{member.staffId}</p>
                                            <p className="text-sm text-blue-600 font-medium">{member.designation}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${member.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                                                {member.status}
                                            </span>
                                            {todayRecord && (
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full border ${todayRecord.status === 'Present' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' :
                                                        todayRecord.status === 'Absent' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300' :
                                                            'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300'
                                                    }`}>
                                                    Today: {todayRecord.status}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-slate-400" />
                                            {member.mobile}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-slate-400" />
                                            {member.email}
                                        </div>
                                        {member.specialization && (
                                            <div className="flex items-center gap-2">
                                                <Briefcase className="w-4 h-4 text-slate-400" />
                                                {member.specialization}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2">
                                        <Link
                                            to={`/staff/edit/${member.id}`}
                                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(member.id)}
                                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-500">
                        <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No staff members found matching your search.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
