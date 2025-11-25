import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { User, ArrowLeft, Edit, Trash, IndianRupee, Plus, Clock, Tag, Calendar, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { useData } from '../context/DataContext';
import { FeeStatus } from '../types';
import { DeleteModal } from '../components/DeleteModal';

export const StudentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getStudent, getStudentPayments, deleteStudent, getAttendance, centreSettings } = useData();

    const student = getStudent(id || '');
    const payments = id ? getStudentPayments(id) : [];
    const attendance = id ? getAttendance(id) : [];

    // Attendance Stats
    const presentCount = attendance.filter(a => a.status === 'Present').length;
    const lateCount = attendance.filter(a => a.status === 'Late').length;
    const absentCount = attendance.filter(a => a.status === 'Absent').length;
    const excusedCount = attendance.filter(a => a.status === 'Excused').length;
    const totalDays = presentCount + lateCount + absentCount + excusedCount;
    const attendancePercentage = totalDays > 0 ? Math.round(((presentCount + lateCount) / totalDays) * 100) : 0;

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    if (!student) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <p className="text-slate-500 mb-4">Student not found.</p>
                <Link to="/students" className="text-blue-500 hover:underline">Back to Students</Link>
            </div>
        );
    }

    const confirmDelete = () => {
        deleteStudent(student.id);
        setIsDeleteModalOpen(false);
        navigate('/students');
    };

    const netFee = student.totalFee - (student.concession || 0);
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const balance = netFee - totalPaid;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 pb-20"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <User className="w-8 h-8 text-slate-800 dark:text-slate-100" />
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{student.name}</h1>
                </div>
                <div className="flex gap-2">
                    <Link to={`/students/${student.id}/pay-fees`} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 shadow-sm font-medium text-sm">
                        <IndianRupee className="w-4 h-4" /> Pay Fees
                    </Link>
                    <Link to={`/students/edit/${student.id}`} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 shadow-sm font-medium text-sm">
                        <Edit className="w-4 h-4" /> Edit
                    </Link>
                    <Link to="/students" className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 px-2 py-2 text-sm font-medium">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Student Information */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
                    >
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                            <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            <h2 className="font-bold text-slate-800 dark:text-slate-100">Student Information</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Enrollment Number</label>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{student.enrollmentNo}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Mobile 1</label>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{student.mobile}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Name</label>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{student.name}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Mobile 2</label>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{student.mobile2 || '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Father's Name</label>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{student.fathersName || '-'}</p>
                            </div>
                            <div className="space-y-1 row-span-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Address</label>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 whitespace-pre-line">
                                    {[student.address1, student.address2, student.city, student.pincode ? `- ${student.pincode}` : ''].filter(Boolean).join('\n') || '-'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Sex</label>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{student.sex || '-'}</p>
                            </div>
                            <div className="space-y-1 hidden md:block"></div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Age</label>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{student.age || '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Qualification</label>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{student.qualification || '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Date of Birth</label>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{student.dob || '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Course</label>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{student.course}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Date of Joining</label>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{student.joinDate}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Batch</label>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{student.batch}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Scheme</label>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{student.scheme || '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Bill Number</label>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">-</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Payment History */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
                    >
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                <h2 className="font-bold text-slate-800 dark:text-slate-100">Payment History</h2>
                            </div>
                            <Link to={`/students/${student.id}/pay-fees`} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 flex items-center gap-1 font-medium">
                                <Plus className="w-3 h-3" /> Add Payment
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-100 dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Amount</th>
                                        <th className="px-6 py-3">Method</th>
                                        <th className="px-6 py-3">Receipt No.</th>
                                        <th className="px-6 py-3">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {payments.length > 0 ? payments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="px-6 py-4 text-slate-800 dark:text-slate-200">{payment.date}</td>
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">₹{payment.amount.toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">{payment.method}</span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{payment.receiptNo || '-'}</td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 italic">{payment.notes || '-'}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">No payment history found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* Attendance Report */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
                    >
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            <h2 className="font-bold text-slate-800 dark:text-slate-100">Attendance Report</h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                                <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Total</p>
                                    <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{totalDays}</p>
                                </div>
                                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase">Present</p>
                                    <p className="text-xl font-bold text-green-700 dark:text-green-300">{presentCount}</p>
                                </div>
                                <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                    <p className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase">Late</p>
                                    <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{lateCount}</p>
                                </div>
                                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <p className="text-xs text-red-600 dark:text-red-400 font-bold uppercase">Absent</p>
                                    <p className="text-xl font-bold text-red-700 dark:text-red-300">{absentCount}</p>
                                </div>
                                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase">Percentage</p>
                                    <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{attendancePercentage}%</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Recent History</h3>
                                {attendance.length > 0 ? (
                                    attendance.slice(0, 5).map(record => (
                                        <div key={record.id} className="flex items-center justify-between text-sm p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded transition-colors">
                                            <span className="text-slate-600 dark:text-slate-400">{record.date}</span>
                                            <span className={`font-medium px-2 py-0.5 rounded text-xs ${record.status === 'Present' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                record.status === 'Absent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                                    record.status === 'Late' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                                                        'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                                }`}>
                                                {record.status}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-400 text-center py-2">No attendance records found.</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Summary & Actions */}
                <div className="space-y-6">
                    {/* Fee Summary Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
                    >
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                            <IndianRupee className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            <h2 className="font-bold text-slate-800 dark:text-slate-100">Fee Summary</h2>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 p-3 rounded-lg text-center">
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Total Fees</p>
                                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">₹{student.totalFee.toFixed(2)}</p>
                            </div>
                            <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 p-3 rounded-lg text-center">
                                <p className="text-xs text-sky-600 dark:text-sky-400 font-medium mb-1">Concession</p>
                                <p className="text-lg font-bold text-sky-700 dark:text-sky-300">₹{(student.concession || 0).toFixed(2)}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 p-3 rounded-lg text-center">
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Net Fees</p>
                                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">₹{netFee.toFixed(2)}</p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 p-3 rounded-lg text-center">
                                <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Paid Amount</p>
                                <p className="text-lg font-bold text-green-700 dark:text-green-300">₹{totalPaid.toFixed(2)}</p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-3 rounded-lg text-center">
                                <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Balance</p>
                                <p className="text-lg font-bold text-red-700 dark:text-red-300">₹{balance.toFixed(2)}</p>
                            </div>
                            <div className="flex justify-center mt-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${student.feeStatus === FeeStatus.PAID ? 'bg-green-500 text-white' :
                                    student.feeStatus === FeeStatus.PARTIAL ? 'bg-orange-400 text-white' : 'bg-red-500 text-white'
                                    }`}>
                                    {student.feeStatus === FeeStatus.PARTIAL ? 'Partially Paid' : student.feeStatus}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
                    >
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                            <Tag className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            <h2 className="font-bold text-slate-800 dark:text-slate-100">Quick Actions</h2>
                        </div>
                        <div className="p-4 space-y-3">
                            <Link to={`/students/${student.id}/pay-fees`} className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded flex items-center justify-center gap-2 text-sm font-bold transition-colors">
                                <IndianRupee className="w-4 h-4" /> Record Payment
                            </Link>
                            <Link to={`/students/edit/${student.id}`} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded flex items-center justify-center gap-2 text-sm font-bold transition-colors">
                                <Edit className="w-4 h-4" /> Edit Student
                            </Link>
                            <button onClick={() => setIsDeleteModalOpen(true)} className="w-full bg-red-500 hover:bg-red-600 text-white py-2.5 rounded flex items-center justify-center gap-2 text-sm font-bold transition-colors">
                                <Trash className="w-4 h-4" /> Delete Student
                            </button>
                            <a
                                href={`https://wa.me/${student.mobile}?text=Hello ${student.name}, this is a message from ${centreSettings.name}.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded flex items-center justify-center gap-2 text-sm font-bold transition-colors"
                            >
                                <MessageSquare className="w-4 h-4" /> Chat on WhatsApp
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Student"
                message="Are you sure you want to delete this student? This action cannot be undone."
                itemName={student.name}
            />
        </motion.div >
    );

};
