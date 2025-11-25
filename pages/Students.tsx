import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Users, UserPlus, Search, Filter, Eye, Edit, Trash, IndianRupee, Bell } from 'lucide-react';
import { FeeStatus } from '../types';
import { useData } from '../context/DataContext';
import { DeleteModal } from '../components/DeleteModal';
import { FeeReminderSystem } from '../components/FeeReminderSystem';

export const Students = () => {
  const { students, deleteStudent, batches } = useData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Students');
  const [filterBatch, setFilterBatch] = useState('All Batches');

  // Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFeeReminderOpen, setIsFeeReminderOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<{ id: string, name: string } | null>(null);

  const initiateDelete = (id: string, name: string) => {
    setStudentToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      deleteStudent(studentToDelete.id);
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.enrollmentNo.includes(searchTerm) ||
      student.mobile.includes(searchTerm);

    const matchesStatus = filterStatus === 'All Students' || student.feeStatus === filterStatus;
    const matchesBatch = filterBatch === 'All Batches' || student.batch === filterBatch;

    return matchesSearch && matchesStatus && matchesBatch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
          <Users className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Students</h1>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsFeeReminderOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 shadow-sm font-medium text-sm transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="whitespace-nowrap">Send Reminders</span>
          </button>
          <Link
            to="/students/add"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm font-medium text-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span className="whitespace-nowrap">Add Student</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
      >
        <div className="md:col-span-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Fee Status</label>
          <select
            className="w-full border-slate-300 dark:border-slate-600 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50 dark:bg-slate-900 dark:text-slate-200 p-2.5 border"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All Students">All Students</option>
            <option value={FeeStatus.PAID}>Fully Paid</option>
            <option value={FeeStatus.PARTIAL}>Partially Paid</option>
            <option value={FeeStatus.UNPAID}>Unpaid</option>
          </select>
        </div>
        <div className="md:col-span-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Batch</label>
          <select
            className="w-full border-slate-300 dark:border-slate-600 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50 dark:bg-slate-900 dark:text-slate-200 p-2.5 border"
            value={filterBatch}
            onChange={(e) => setFilterBatch(e.target.value)}
          >
            <option value="All Batches">All Batches</option>
            {batches.filter(b => b.status === 'Active').map(batch => (
              <option key={batch.id} value={batch.name}>{batch.name} ({batch.timing})</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-5 relative">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Search</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, enrollment number, or mobile"
              className="w-full border-slate-300 dark:border-slate-600 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50 dark:bg-slate-900 dark:text-slate-200 p-2.5 border pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          </div>
        </div>
        <div className="md:col-span-1">
          <button className="w-full bg-blue-500 text-white p-2.5 rounded-md flex items-center justify-center gap-2 text-sm hover:bg-blue-600 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-bold">
              <tr>
                <th className="px-6 py-4">Enrollment No.</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Batch</th>
                <th className="px-6 py-4">Mobile</th>
                <th className="px-6 py-4">Fee Status</th>
                <th className="px-6 py-4">Balance</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">{student.enrollmentNo}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-blue-600 dark:text-blue-400">{student.name}</div>
                    {student.fathersName && <div className="text-xs text-slate-500 dark:text-slate-400">S/O {student.fathersName}</div>}
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium w-32">{student.course}</td>
                  <td className="px-6 py-4">
                    <div className="text-slate-900 dark:text-slate-200">{student.batch.split(' ')[0]}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{student.batch.match(/\((.*?)\)/)?.[1]}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{student.mobile}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block min-w-[80px] text-center ${student.feeStatus === FeeStatus.PAID ? 'bg-green-500 text-white' :
                      student.feeStatus === FeeStatus.PARTIAL ? 'bg-orange-400 text-white' : 'bg-red-400 text-white'
                      }`}>
                      {student.feeStatus === FeeStatus.PARTIAL ? 'Partial' : student.feeStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-red-500 dark:text-red-400 font-medium">₹{student.balance.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/students/${student.id}`)}
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-blue-600 dark:border-blue-400 rounded bg-white dark:bg-slate-800 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/students/edit/${student.id}`)}
                        className="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-amber-500 rounded bg-white dark:bg-slate-800 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/students/${student.id}/pay-fees`)}
                        className="p-1.5 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 border border-teal-600 dark:border-teal-400 rounded bg-white dark:bg-slate-800 transition-colors"
                        title="Pay Fees"
                      >
                        <IndianRupee className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => window.open(`https://wa.me/${student.mobile.replace(/\D/g, '')}?text=Hello ${student.name},`, '_blank')}
                        className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 border border-green-600 dark:border-green-400 rounded bg-white dark:bg-slate-800 transition-colors"
                        title="WhatsApp"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                      </button>
                      <button
                        onClick={() => initiateDelete(student.id, student.name)}
                        className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-600 dark:border-red-400 rounded bg-white dark:bg-slate-800 transition-colors"
                        title="Delete"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Student"
        message="Are you sure you want to delete this student? This action cannot be undone and will remove all related fee records."
        itemName={studentToDelete?.name}
      />

      {/* Fee Reminder Modal */}
      {isFeeReminderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <FeeReminderSystem
              students={students}
              onClose={() => setIsFeeReminderOpen(false)}
            />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
