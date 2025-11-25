import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Send, CheckCircle, AlertCircle, MessageCircle, X } from 'lucide-react';
import { Student, FeeStatus } from '../types';
import { WhatsAppButton } from './WhatsAppButton';
import { WhatsAppTemplates, sendWhatsAppMessage, WhatsAppConfig } from '../utils/whatsapp';
import { AlertModal, AlertType } from './AlertModal';
import { ConfirmationModal } from './ConfirmationModal';
import { useData } from '../context/DataContext';

interface FeeReminderSystemProps {
    students: Student[];
    onClose?: () => void;
}

export const FeeReminderSystem: React.FC<FeeReminderSystemProps> = ({ students, onClose }) => {
    const { centreSettings } = useData();
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [customMessage, setCustomMessage] = useState('');
    const [sending, setSending] = useState(false);

    // Alert state
    const [alert, setAlert] = useState<{ title: string; message: string; type: AlertType } | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);

    const showAlert = (title: string, message: string, type: AlertType = 'info') => {
        setAlert({ title, message, type });
    };

    const closeAlert = () => {
        setAlert(null);
    };

    // Filter students with pending fees
    const studentsWithPendingFees = useMemo(() => {
        return students.filter(s =>
            (s.feeStatus === FeeStatus.UNPAID || s.feeStatus === FeeStatus.PARTIAL) &&
            (s.balance || 0) > 0
        ).sort((a, b) => (b.balance || 0) - (a.balance || 0));
    }, [students]);

    // Auto-close if no students with pending fees
    React.useEffect(() => {
        if (studentsWithPendingFees.length === 0 && onClose) {
            const timer = setTimeout(() => {
                onClose();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [studentsWithPendingFees.length, onClose]);

    const totalPending = useMemo(() => {
        return studentsWithPendingFees
            .filter(s => selectedStudents.includes(s.id))
            .reduce((sum, s) => sum + (s.balance || 0), 0);
    }, [studentsWithPendingFees, selectedStudents]);

    const toggleStudent = (studentId: string) => {
        setSelectedStudents(prev => {
            const isCurrentlySelected = prev.includes(studentId);

            if (isCurrentlySelected) {
                // Deselect
                return prev.filter(id => id !== studentId);
            } else {
                // Select - check if using click-to-chat (limit to 1)
                const isUsingAPI = centreSettings?.whatsappProvider === 'twilio' && centreSettings?.twilioAccountSid;
                if (!isUsingAPI && prev.length >= 1) {
                    // Click-to-chat mode: only allow 1 student
                    return [studentId]; // Replace selection
                }
                return [...prev, studentId];
            }
        });
    };

    const selectAll = () => {
        const isUsingAPI = centreSettings?.whatsappProvider === 'twilio' && centreSettings?.twilioAccountSid;

        if (!isUsingAPI) {
            // Click-to-chat mode: select only first student
            if (selectedStudents.length > 0) {
                setSelectedStudents([]);
            } else {
                setSelectedStudents([studentsWithPendingFees[0]?.id].filter(Boolean));
            }
        } else {
            // API mode: select all
            if (selectedStudents.length === studentsWithPendingFees.length) {
                setSelectedStudents([]);
            } else {
                setSelectedStudents(studentsWithPendingFees.map(s => s.id));
            }
        }
    };

    const handleSendClick = () => {
        if (selectedStudents.length === 0) return;
        setShowConfirm(true);
    };

    const sendBulkReminders = async () => {
        setShowConfirm(false);
        setSending(true);

        // Prepare config
        const config: WhatsAppConfig = {
            provider: centreSettings?.whatsappProvider || 'click-to-chat',
            twilioAccountSid: centreSettings?.twilioAccountSid,
            twilioAuthToken: centreSettings?.twilioAuthToken,
            twilioWhatsAppNumber: centreSettings?.twilioWhatsAppNumber
        };

        let successCount = 0;
        let failCount = 0;
        let lastError = '';

        // Check if using API or click-to-chat
        const isUsingAPI = config.provider === 'twilio' && config.twilioAccountSid;

        if (isUsingAPI) {
            // API Mode: Send one by one with delay
            for (let i = 0; i < selectedStudents.length; i++) {
                const studentId = selectedStudents[i];
                const student = studentsWithPendingFees.find(s => s.id === studentId);
                if (!student) continue;

                const message = customMessage || WhatsAppTemplates.feeReminder(
                    student.name,
                    student.balance || 0,
                    'ASAP'
                );

                const result = await sendWhatsAppMessage(student.mobile, message, config);

                if (result.success) {
                    successCount++;
                } else {
                    failCount++;
                    lastError = result.error || 'Unknown error';
                    console.error(`Failed to send to ${student.name}:`, result.error);
                }

                // Small delay between API calls
                if (i < selectedStudents.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
        } else {
            // Click-to-Chat Mode: Open all tabs at once
            for (let i = 0; i < selectedStudents.length; i++) {
                const studentId = selectedStudents[i];
                const student = studentsWithPendingFees.find(s => s.id === studentId);
                if (!student) continue;

                const message = customMessage || WhatsAppTemplates.feeReminder(
                    student.name,
                    student.balance || 0,
                    'ASAP'
                );

                // Open WhatsApp tab (non-blocking)
                const result = await sendWhatsAppMessage(student.mobile, message, config);

                if (result.success) {
                    successCount++;
                } else {
                    failCount++;
                    lastError = result.error || 'Unknown error';
                }

                // Very small delay to prevent browser from blocking too many popups
                if (i < selectedStudents.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
        }

        setSending(false);

        // Show result message
        if (failCount > 0) {
            showAlert(
                'Sending Incomplete',
                `Opened: ${successCount} WhatsApp tabs, Failed: ${failCount}. ${lastError ? `Error: ${lastError}` : ''}\n\nPlease allow pop-ups for this site and send the messages from each tab.`,
                'warning'
            );
        } else {
            if (isUsingAPI) {
                showAlert(
                    'Reminders Sent',
                    `Successfully sent ${successCount} reminder${successCount > 1 ? 's' : ''} via Twilio API!`,
                    'success'
                );
            } else {
                showAlert(
                    'WhatsApp Opened',
                    `WhatsApp opened! Please click 'Send' in the WhatsApp window to complete sending the reminder.`,
                    'success'
                );
            }
            setSelectedStudents([]);
        }
    };

    if (studentsWithPendingFees.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
                <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                        All Fees Collected!
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                        No students have pending fee payments at the moment.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-linear-to-br from-orange-500 to-red-500 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Fee Reminder System</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {studentsWithPendingFees.length} student{studentsWithPendingFees.length > 1 ? 's' : ''} with pending fees
                            </p>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    )}
                </div>
            </div>

            {/* Summary Stats */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                            {studentsWithPendingFees.length}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Total Students</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {selectedStudents.length}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Selected</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                            ₹{totalPending.toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Total Pending</div>
                    </div>
                </div>
            </div>

            {/* Message Template */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Custom Message (Optional)
                </label>
                <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Leave empty to use default template..."
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Default: "Dear [Name], your fee payment of ₹[Amount] is pending. Please pay at your earliest convenience."
                </p>
            </div>

            {/* Student List */}
            <div className="p-6">
                {/* Info Banner for Click-to-Chat Mode */}
                {(!centreSettings?.whatsappProvider || centreSettings?.whatsappProvider === 'click-to-chat') && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            <strong>Free Tier Mode:</strong> Select one student at a time. For bulk automated sending, configure Twilio API in Settings.
                        </p>
                    </div>
                )}

                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100">Students with Pending Fees</h4>
                    <button
                        onClick={selectAll}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                        {selectedStudents.length > 0 ? 'Deselect' : (centreSettings?.whatsappProvider === 'twilio' && centreSettings?.twilioAccountSid ? 'Select All' : 'Select First')}
                    </button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {studentsWithPendingFees.map((student) => (
                        <motion.div
                            key={student.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-lg border transition-all ${selectedStudents.includes(student.id)
                                ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/20 dark:border-blue-500'
                                : 'bg-white border-slate-200 hover:border-blue-300 dark:bg-slate-900/50 dark:border-slate-700'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={selectedStudents.includes(student.id)}
                                    onChange={() => toggleStudent(student.id)}
                                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />

                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h5 className="font-bold text-slate-800 dark:text-slate-100">
                                                {student.name}
                                            </h5>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {student.enrollmentNo} • {student.course}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-red-600 dark:text-red-400">
                                                ₹{(student.balance || 0).toLocaleString('en-IN')}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                {student.feeStatus}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs text-slate-600 dark:text-slate-400">
                                            📱 {student.mobile}
                                        </span>
                                        <WhatsAppButton
                                            phone={student.mobile}
                                            message={customMessage || WhatsAppTemplates.feeReminder(
                                                student.name,
                                                student.balance || 0,
                                                'ASAP'
                                            )}
                                            size="sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-slate-600 dark:text-slate-400 w-full sm:w-auto text-center sm:text-left">
                        {selectedStudents.length > 0 ? (
                            <span>
                                <strong>{selectedStudents.length}</strong> student{selectedStudents.length > 1 ? 's' : ''} selected
                            </span>
                        ) : (
                            <span>Select students to send reminders</span>
                        )}
                    </div>

                    <button
                        onClick={handleSendClick}
                        disabled={selectedStudents.length === 0 || sending}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sending ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Sending...</span>
                            </>
                        ) : (
                            <>
                                <MessageCircle className="w-5 h-5" />
                                <span>Send Reminders via WhatsApp</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Alert Modal */}
            {alert && (
                <AlertModal
                    isOpen={true}
                    title={alert.title}
                    message={alert.message}
                    type={alert.type}
                    onClose={closeAlert}
                />
            )}

            {/* Confirmation Modal */}
            {showConfirm && (
                <ConfirmationModal
                    isOpen={true}
                    title="Send WhatsApp Reminder"
                    message={
                        centreSettings?.whatsappProvider === 'twilio' && centreSettings?.twilioAccountSid
                            ? `Send automated WhatsApp reminders to ${selectedStudents.length} student${selectedStudents.length > 1 ? 's' : ''}?\n\nMessages will be sent automatically via Twilio API.`
                            : `This will open WhatsApp to send a reminder.\n\nYou'll need to click 'Send' in the WhatsApp window that opens.`
                    }
                    onConfirm={sendBulkReminders}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
        </div>
    );
};
