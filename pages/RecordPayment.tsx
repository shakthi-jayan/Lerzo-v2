import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, CheckCircle, Share2, Download, MessageSquare } from 'lucide-react';
import { useData } from '../context/DataContext';
import { AlertModal } from '../components/AlertModal';

export const RecordPayment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getStudent, recordPayment, centreSettings } = useData();
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [method, setMethod] = useState('Cash');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [student, setStudent] = useState<any>(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const [alertState, setAlertState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'success' | 'error' | 'info' | 'warning';
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    useEffect(() => {
        if (id) {
            const data = getStudent(id);
            if (data) {
                setStudent(data);
            }
        }
    }, [id, getStudent]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || Number(amount) <= 0) {
            setAlertState({ isOpen: true, title: 'Invalid Amount', message: 'Please enter a valid payment amount.', type: 'error' });
            return;
        }
        if (!student) return;

        setIsSubmitting(true);
        try {
            await recordPayment({
                id: crypto.randomUUID(),
                ownerEmail: '',
                studentId: student.id,
                amount: Number(amount),
                date: date,
                method: method,
                receiptNo: `REC-${Date.now()}`,
                notes: notes,
                createdAt: new Date().toISOString()
            });

            setPaymentSuccess(true);
        } catch (error) {
            setAlertState({ isOpen: true, title: 'Error', message: 'Failed to record payment. Please try again.', type: 'error' });
            setIsSubmitting(false);
        }
    };

    if (!student) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-slate-500 dark:text-slate-400">Loading student details...</div>
            </div>
        );
    }

    if (paymentSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto mt-10 text-center space-y-6"
            >
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Payment Successful!</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Payment of <span className="font-bold text-slate-900 dark:text-slate-100">₹{amount}</span> recorded for {student.name}.
                    </p>

                    <div className="space-y-3">
                        <a
                            href={`https://wa.me/${student.mobile}?text=Dear ${student.name}, we have received your payment of ₹${amount} via ${method}. Thank you! - ${centreSettings.name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-md hover:shadow-lg"
                        >
                            <MessageSquare className="w-5 h-5" /> Share Receipt on WhatsApp
                        </a>
                        <button
                            onClick={() => alert("Receipt download feature coming soon!")}
                            className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 py-3 rounded-xl flex items-center justify-center gap-2 font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                        >
                            <Download className="w-5 h-5" /> Download Receipt
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                        <button
                            onClick={() => navigate(`/students/${id}`)}
                            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium text-sm"
                        >
                            Back to Student Details
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 max-w-2xl mx-auto"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <CreditCard className="w-8 h-8 text-slate-800 dark:text-slate-100" />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Record Payment</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">For {student.name} ({student.enrollmentNo})</p>
                    </div>
                </div>
                <Link to={`/students/${id}`} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 text-sm font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
            >
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-blue-600 dark:text-blue-300 font-bold uppercase">Current Balance</p>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-200">₹{student.balance}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-blue-600 dark:text-blue-300 font-bold uppercase">Total Fee</p>
                        <p className="text-lg font-semibold text-blue-700 dark:text-blue-200">₹{student.totalFee}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Amount (₹)</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-900 dark:text-slate-100"
                                placeholder="Enter amount"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-900 dark:text-slate-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['Cash', 'UPI', 'Bank Transfer'].map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => setMethod(m)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${method === m
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                                        }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Notes (Optional)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none bg-white dark:bg-slate-900 dark:text-slate-100"
                            placeholder="Enter any remarks..."
                        />
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate(`/students/${id}`)}
                            className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Recording...' : 'Record Payment'}
                        </button>
                    </div>
                </form>
            </motion.div>
            <AlertModal
                isOpen={alertState.isOpen}
                onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type}
            />
        </motion.div>
    );
};
