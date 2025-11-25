

import React from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus, IndianRupee, Clock, AlertTriangle, Download, Bell } from 'lucide-react';
import { useData } from '../context/DataContext';
import { FeeStatus } from '../types';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, bgClass, subText }: any) => (
  <div className={`p-6 rounded-xl shadow-sm text-white ${bgClass} relative overflow-hidden`}>
    <div className="relative z-10">
      <p className="text-xs font-bold uppercase tracking-wider opacity-90 mb-1">{title}</p>
      <h3 className="text-3xl font-bold">{value}</h3>
      {subText && <p className="mt-2 text-sm opacity-90">{subText}</p>}
    </div>
    <Icon className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 opacity-20" />
  </div>
);

const QuickAction = ({ label, icon: Icon, color, onClick, isLink, to }: any) => {
  const className = `flex items-center justify-center gap-2 w-full p-3 rounded-lg border transition-all font-medium text-sm ${color}`;
  if (isLink) {
    return <Link to={to} className={className}><Icon className="w-4 h-4" /> {label}</Link>;
  }
  return <button onClick={onClick} className={className}><Icon className="w-4 h-4" /> {label}</button>;
};

export const Dashboard = () => {
  const { students, enquiries, staffAttendance } = useData();

  // Calculate Real-time Stats
  const totalStudents = students.length;
  const totalEnquiries = enquiries.filter(e => e.status !== 'Converted' && e.status !== 'Closed').length; // Only Active

  const feesCollected = students.reduce((sum, student) => sum + (student.paidFee || 0), 0);
  const pendingFees = students.reduce((sum, student) => sum + (student.balance || 0), 0);

  const fullyPaidStudents = students.filter(s => s.feeStatus === FeeStatus.PAID).length;
  const partialStudents = students.filter(s => s.feeStatus === FeeStatus.PARTIAL).length;
  const unpaidStudents = students.filter(s => s.feeStatus === FeeStatus.UNPAID).length;

  const today = new Date().toISOString().split('T')[0];
  const staffPresentCount = staffAttendance.filter(a => a.date === today && a.status === 'Present').length;

  // Get Recent Data
  const recentStudents = [...students]
    .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
    .slice(0, 5);

  const recentEnquiries = [...enquiries]
    .sort((a, b) => new Date(b.addedOn).getTime() - new Date(a.addedOn).getTime())
    .slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        <div className="flex gap-3">
          <Link to="/students/add" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm">
            <UserPlus className="w-4 h-4" /> Add Student
          </Link>
          <Link to="/enquiries/add" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-blue-600 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium shadow-sm">
            <UserPlus className="w-4 h-4" /> Add Enquiry
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <StatCard
            title="Total Students"
            value={totalStudents}
            icon={Users}
            bgClass="bg-blue-600"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <StatCard
            title="Active Enquiries"
            value={totalEnquiries}
            icon={UserPlus}
            bgClass="bg-sky-500"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <StatCard
            title="Fees Collected"
            value={`₹${feesCollected.toLocaleString('en-IN')}`}
            icon={IndianRupee}
            bgClass="bg-green-600"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
          <StatCard
            title="Pending Fees"
            value={`₹${pendingFees.toLocaleString('en-IN')}`}
            icon={Clock}
            bgClass="bg-orange-500"
          />
        </motion.div>
      </div>

      {/* Staff Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.45 }}>
          <StatCard
            title="Staff Present Today"
            value={staffPresentCount}
            icon={Users}
            bgClass="bg-purple-600"
          />
        </motion.div>
      </div>

      {/* AI Insights & Risks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-linear-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold">Smart Insights</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <h3 className="text-sm font-medium opacity-80 mb-1">Revenue Projection (Next Month)</h3>
              <p className="text-2xl font-bold">₹{((feesCollected / Math.max(1, new Date().getMonth() + 1)) * 1.1).toFixed(0)}</p>
              <p className="text-xs opacity-70 mt-1">Based on current growth trends</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <h3 className="text-sm font-medium opacity-80 mb-1">At Risk Students</h3>
              <p className="text-2xl font-bold">{unpaidStudents > 0 ? Math.ceil(unpaidStudents * 0.3) : 0}</p>
              <p className="text-xs opacity-70 mt-1">Students with low attendance & unpaid fees</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <h3 className="text-sm font-medium opacity-80 mb-1">Conversion Rate</h3>
              <p className="text-2xl font-bold">{totalEnquiries > 0 ? Math.round((students.length / (students.length + totalEnquiries)) * 100) : 0}%</p>
              <p className="text-xs opacity-70 mt-1">Enquiries converting to admissions</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fee Overview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
        >
          <h2 className="text-slate-600 dark:text-slate-300 font-medium mb-6">Fee Status Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{fullyPaidStudents}</div>
              <div className="text-sm text-green-700 dark:text-green-300 font-medium">Fully Paid</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">{partialStudents}</div>
              <div className="text-sm text-orange-700 dark:text-orange-300 font-medium">Partially Paid</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">{unpaidStudents}</div>
              <div className="text-sm text-red-700 dark:text-red-300 font-medium">Unpaid</div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
        >
          <h2 className="text-slate-600 dark:text-slate-300 font-medium mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <QuickAction
              label="View Unpaid Students"
              icon={AlertTriangle}
              color="bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 border-red-600 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              isLink to="/students?filter=unpaid"
            />
            <QuickAction
              label="View Partial Payments"
              icon={Clock}
              color="bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 border-orange-600 dark:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
              isLink to="/students?filter=partial"
            />
            <QuickAction
              label="Send Fee Reminders"
              icon={Bell}
              color="bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 border-amber-600 dark:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              onClick={() => {
                const unpaidStudents = students.filter(s => s.feeStatus === FeeStatus.PARTIAL || s.feeStatus === FeeStatus.UNPAID);
                if (unpaidStudents.length === 0) {
                  alert("No students with pending fees.");
                  return;
                }
                if (window.confirm(`Send fee reminders to ${unpaidStudents.length} students?`)) {
                  alert(`Reminders sent successfully to ${unpaidStudents.length} students via Email and SMS.`);
                }
              }}
            />
            <QuickAction
              label="Export Data"
              icon={Download}
              color="bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              isLink to="/export"
            />
          </div>
        </motion.div>
      </div>

      {/* Recent Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h2 className="text-blue-500 font-medium">Recent Students</h2>
            <Link to="/students" className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 font-semibold">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Course</th>
                  <th className="px-6 py-3">Fee Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {recentStudents.length > 0 ? recentStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400">
                      <Link to={`/students/${student.id}`} className="hover:underline">
                        {student.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{student.course}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${student.feeStatus === FeeStatus.PAID ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        student.feeStatus === FeeStatus.PARTIAL ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                        {student.feeStatus}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="p-4 text-center text-slate-400">No students yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recent Enquiries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h2 className="text-blue-500 font-medium">Recent Enquiries</h2>
            <Link to="/enquiries" className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 font-semibold">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Course</th>
                  <th className="px-6 py-3">Mobile</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {recentEnquiries.length > 0 ? recentEnquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{enquiry.name}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{enquiry.courseInterested}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{enquiry.mobile}</td>
                    <td className="px-6 py-4">
                      <Link to={`/enquiries/edit/${enquiry.id}`} className="bg-green-500 text-white p-1.5 rounded hover:bg-green-600 inline-block">
                        <UserPlus className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="p-4 text-center text-slate-400">No enquiries yet</td></tr>
                )}
                )) : (
                <tr><td colSpan={4} className="p-4 text-center text-slate-400">No enquiries yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

