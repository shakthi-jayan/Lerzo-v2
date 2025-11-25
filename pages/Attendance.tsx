import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, XCircle, Clock, Save, Search, Filter, ArrowLeft, Download, FileText, LayoutDashboard, UserCheck, Users, BarChart2, QrCode } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { AlertModal, AlertType } from '../components/AlertModal';
import { StaffAttendance } from '../types';
import { Html5QrcodeScanner } from 'html5-qrcode';

export const Attendance = () => {
    const { students, batches, courses, attendance, markAttendance, staff, staffAttendance, markStaffAttendance } = useData();
    const [viewMode, setViewMode] = useState<'student' | 'staff' | 'dashboard' | 'scan'>('student');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Filters
    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedStaff, setSelectedStaff] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [filteredStudents, setFilteredStudents] = useState(students);
    const [attendanceState, setAttendanceState] = useState<{ [studentId: string]: string }>({});
    const [staffAttendanceState, setStaffAttendanceState] = useState<{ [staffId: string]: string }>({});
    const [isSaving, setIsSaving] = useState(false);

    // QR Scanner State
    const [lastScanned, setLastScanned] = useState<string | null>(null);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    // Report Modal State
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportStartDate, setReportStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [reportEndDate, setReportEndDate] = useState(new Date().toISOString().split('T')[0]);

    const [alertState, setAlertState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: AlertType;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    const showAlert = (title: string, message: string, type: AlertType = 'info') => {
        setAlertState({ isOpen: true, title, message, type });
    };

    const closeAlert = () => {
        setAlertState(prev => ({ ...prev, isOpen: false }));
    };

    // Filter students based on selection
    useEffect(() => {
        let filtered = students;

        // Filter by Staff (Indirectly via Batch)
        if (selectedStaff) {
            // Get all batches for this staff
            const staffBatchIds = batches.filter(b => b.staffId === selectedStaff).map(b => b.name);
            // If a specific batch is selected, use that. Otherwise, allow any batch from this staff.
            if (selectedBatch) {
                // Already handled by next block
            } else {
                // Filter students who are in one of the staff's batches
                filtered = filtered.filter(s => staffBatchIds.includes(s.batch));
            }
        }

        if (selectedBatch) {
            filtered = filtered.filter(s => s.batch === selectedBatch);
        }
        if (selectedCourse) {
            filtered = filtered.filter(s => s.course === selectedCourse);
        }
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(s =>
                s.name.toLowerCase().includes(query) ||
                s.enrollmentNo.toLowerCase().includes(query)
            );
        }

        setFilteredStudents(filtered);
    }, [students, selectedBatch, selectedCourse, selectedStaff, searchQuery, batches]);

    // Load existing attendance for selected date
    useEffect(() => {
        // Student Attendance
        const currentAttendance: { [key: string]: string } = {};
        attendance.forEach(record => {
            if (record.date === selectedDate) {
                currentAttendance[record.studentId] = record.status;
            }
        });
        setAttendanceState(currentAttendance);

        // Staff Attendance
        const currentStaffAttendance: { [key: string]: string } = {};
        staffAttendance.forEach(record => {
            if (record.date === selectedDate) {
                currentStaffAttendance[record.staffId] = record.status;
            }
        });
        setStaffAttendanceState(currentStaffAttendance);
    }, [attendance, staffAttendance, selectedDate]);

    // QR Scanner Effect
    useEffect(() => {
        if (viewMode === 'scan') {
            // Small timeout to ensure DOM element exists
            const timeoutId = setTimeout(() => {
                if (!scannerRef.current) {
                    const scanner = new Html5QrcodeScanner(
                        "reader",
                        { fps: 10, qrbox: { width: 250, height: 250 } },
                        /* verbose= */ false
                    );
                    scannerRef.current = scanner;

                    scanner.render(onScanSuccess, onScanFailure);
                }
            }, 100);

            return () => {
                clearTimeout(timeoutId);
                if (scannerRef.current) {
                    scannerRef.current.clear().catch(error => {
                        console.error("Failed to clear html5-qrcode scanner. ", error);
                    });
                    scannerRef.current = null;
                }
            };
        }
    }, [viewMode]);

    const onScanSuccess = async (decodedText: string, decodedResult: any) => {
        if (decodedText !== lastScanned) {
            setLastScanned(decodedText);
            await handleQrScan(decodedText);
            // Reset last scanned after 3 seconds to allow re-scanning
            setTimeout(() => setLastScanned(null), 3000);
        }
    };

    const onScanFailure = (error: any) => {
        // console.warn(`Code scan error = ${error}`);
    };

    const handleQrScan = async (studentId: string) => {
        const student = students.find(s => s.id === studentId);
        if (student) {
            try {
                await markAttendance({
                    id: `${student.id}_${selectedDate}`,
                    date: selectedDate,
                    studentId: student.id,
                    batchId: student.batch,
                    status: 'Present'
                });
                showAlert("Success", `Marked ${student.name} as Present`, "success");
                // Update local state to reflect change immediately if we switch back to list view
                setAttendanceState(prev => ({ ...prev, [student.id]: 'Present' }));
            } catch (e) {
                console.error(e);
                showAlert("Error", "Failed to mark attendance", "error");
            }
        } else {
            // Check if it's a staff member
            const staffMember = staff.find(s => s.id === studentId);
            if (staffMember) {
                try {
                    await markStaffAttendance({
                        id: `${staffMember.id}_${selectedDate}`,
                        date: selectedDate,
                        staffId: staffMember.id,
                        status: 'Present'
                    });
                    showAlert("Success", `Marked Staff ${staffMember.name} as Present`, "success");
                    setStaffAttendanceState(prev => ({ ...prev, [staffMember.id]: 'Present' }));
                } catch (e) {
                    console.error(e);
                    showAlert("Error", "Failed to mark staff attendance", "error");
                }
            } else {
                showAlert("Error", "Student/Staff not found", "error");
            }
        }
    };

    const handleStatusChange = (studentId: string, status: string) => {
        setAttendanceState(prev => ({ ...prev, [studentId]: status }));
    };

    const handleStaffStatusChange = async (staffId: string, status: 'Present' | 'Absent' | 'Leave') => {
        setStaffAttendanceState(prev => ({ ...prev, [staffId]: status }));
        try {
            await markStaffAttendance({
                id: `${staffId}_${selectedDate}`,
                date: selectedDate,
                staffId: staffId,
                status: status
            });
        } catch (error) {
            console.error("Error saving staff attendance:", error);
            showAlert("Error", "Failed to save staff attendance.", "error");
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const promises = filteredStudents.map(student => {
                const status = attendanceState[student.id];
                if (status) {
                    return markAttendance({
                        id: `${student.id}_${selectedDate}`,
                        date: selectedDate,
                        studentId: student.id,
                        batchId: selectedBatch || undefined,
                        status: status as 'Present' | 'Absent' | 'Late' | 'Excused'
                    });
                }
                return Promise.resolve();
            });

            await Promise.all(promises);
            showAlert("Success", "Attendance saved successfully!", "success");
        } catch (error) {
            console.error("Error saving attendance:", error);
            showAlert("Error", "Failed to save attendance.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const markAll = (status: string) => {
        const newState = { ...attendanceState };
        filteredStudents.forEach(s => {
            newState[s.id] = status;
        });
        setAttendanceState(newState);
    };

    const markAllStaff = async (status: 'Present' | 'Absent') => {
        const newStaffState = { ...staffAttendanceState };
        staff.forEach(s => {
            newStaffState[s.id] = status;
        });
        setStaffAttendanceState(newStaffState);

        // Auto-save all
        try {
            const promises = staff.map(s => markStaffAttendance({
                id: `${s.id}_${selectedDate}`,
                date: selectedDate,
                staffId: s.id,
                status: status
            }));
            await Promise.all(promises);
        } catch (error) {
            console.error("Error saving all staff attendance:", error);
            showAlert("Error", "Failed to save staff attendance.", "error");
        }
    };

    const downloadReport = () => {
        const relevantAttendance = attendance.filter(record =>
            record.date >= reportStartDate && record.date <= reportEndDate
        );

        if (filteredStudents.length === 0) {
            showAlert("No Data", "No students selected to generate report.", "error");
            return;
        }

        const headers = ['Student Name', 'Enrollment No', 'Batch', 'Course', 'Present', 'Absent', 'Late', 'Excused', 'Total Days', 'Attendance %'];
        const csvRows = [headers.join(',')];

        filteredStudents.forEach(student => {
            const studentRecords = relevantAttendance.filter(r => r.studentId === student.id);

            const present = studentRecords.filter(r => r.status === 'Present').length;
            const absent = studentRecords.filter(r => r.status === 'Absent').length;
            const late = studentRecords.filter(r => r.status === 'Late').length;
            const excused = studentRecords.filter(r => r.status === 'Excused').length;
            const total = present + absent + late + excused;
            // Calculate percentage excluding excused if desired, but standard is usually total sessions.
            // Let's stick to (Present + Late) / Total * 100 for now.
            const percentage = total > 0 ? ((present + late) / total * 100).toFixed(1) : '0.0';

            const row = [
                `"${student.name}"`,
                `"${student.enrollmentNo}"`,
                `"${student.batch}"`,
                `"${student.course}"`,
                present,
                absent,
                late,
                excused,
                total,
                `${percentage}%`
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `attendance_report_${reportStartDate}_to_${reportEndDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setShowReportModal(false);
    };

    // Dashboard Calculations
    const totalStudents = filteredStudents.length;
    const presentCount = filteredStudents.filter(s => attendanceState[s.id] === 'Present' || attendanceState[s.id] === 'Late').length;
    const absentCount = filteredStudents.filter(s => attendanceState[s.id] === 'Absent').length;
    const attendancePercentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 pb-20"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-slate-800 dark:text-slate-100" />
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Attendance</h1>
                </div>
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('student')}
                            className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${viewMode === 'student' ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                            Student Attendance
                        </button>
                        <button
                            onClick={() => setViewMode('staff')}
                            className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${viewMode === 'staff' ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                            Staff Attendance
                        </button>
                        <button
                            onClick={() => setViewMode('dashboard')}
                            className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${viewMode === 'dashboard' ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                            Dashboard & Reports
                        </button>
                        <button
                            onClick={() => setViewMode('scan')}
                            className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${viewMode === 'scan' ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                            <div className="flex items-center gap-1">
                                <QrCode className="w-4 h-4" /> Scan QR
                            </div>
                        </button>
                    </div>
                    <Link to="/" className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 flex items-center justify-center gap-1 text-sm font-medium">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Link>
                </div>
            </div>

            {/* Common Date & Filter Controls (Visible in all modes except Scan) */}
            {viewMode !== 'scan' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
                >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200"
                            />
                        </div>
                        {/* Filters only relevant for Student Attendance */}
                        {viewMode === 'student' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Staff</label>
                                    <select
                                        value={selectedStaff}
                                        onChange={(e) => setSelectedStaff(e.target.value)}
                                        className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200"
                                    >
                                        <option value="">All Staff</option>
                                        {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Batch</label>
                                    <select
                                        value={selectedBatch}
                                        onChange={(e) => setSelectedBatch(e.target.value)}
                                        className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200"
                                    >
                                        <option value="">All Batches</option>
                                        {batches
                                            .filter(b => b.status === 'Active')
                                            .filter(b => !selectedStaff || b.staffId === selectedStaff)
                                            .map(b => (
                                                <option key={b.id} value={b.name}>{b.name} ({b.timing})</option>
                                            ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Course</label>
                                    <select
                                        value={selectedCourse}
                                        onChange={(e) => setSelectedCourse(e.target.value)}
                                        className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200"
                                    >
                                        <option value="">All Courses</option>
                                        {courses.filter(c => c.status === 'Active').map(c => (
                                            <option key={c.id} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            )}

            {viewMode === 'student' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                >
                    {/* Mark Student Attendance View */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search Student Name or ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full border-slate-300 dark:border-slate-600 rounded-md pl-9 p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => markAll('Present')} className="px-3 py-1.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">Mark All Present</button>
                                <button onClick={() => markAll('Absent')} className="px-3 py-1.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">Mark All Absent</button>
                                <button
                                    onClick={() => setShowReportModal(true)}
                                    className="flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-4 py-1.5 rounded text-sm font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                >
                                    <FileText className="w-4 h-4" /> Export Report
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold">
                                    <tr>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-600">Student Name</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-600">Enrollment No</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-600">Batch</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-600 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map(student => (
                                            <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{student.name}</td>
                                                <td className="p-3 text-slate-500 dark:text-slate-400">{student.enrollmentNo}</td>
                                                <td className="p-3 text-slate-500 dark:text-slate-400">{student.batch}</td>
                                                <td className="p-3">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => handleStatusChange(student.id, 'Present')}
                                                            className={`p-2 rounded-md transition-all ${attendanceState[student.id] === 'Present' ? 'bg-green-500 text-white shadow-md scale-105' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600'}`}
                                                            title="Present"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(student.id, 'Absent')}
                                                            className={`p-2 rounded-md transition-all ${attendanceState[student.id] === 'Absent' ? 'bg-red-500 text-white shadow-md scale-105' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600'}`}
                                                            title="Absent"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(student.id, 'Late')}
                                                            className={`p-2 rounded-md transition-all ${attendanceState[student.id] === 'Late' ? 'bg-amber-500 text-white shadow-md scale-105' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-600'}`}
                                                            title="Late"
                                                        >
                                                            <Clock className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-slate-400 dark:text-slate-500">
                                                No students found matching the criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={handleSave}
                                disabled={isSaving || filteredStudents.length === 0}
                                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-5 h-5" />
                                {isSaving ? 'Saving...' : 'Save Attendance'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {viewMode === 'staff' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                >
                    {/* Mark Staff Attendance View */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Staff List</h2>
                            <div className="flex gap-2">
                                <button onClick={() => markAllStaff('Present')} className="px-3 py-1.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">Mark All Present</button>
                                <button onClick={() => markAllStaff('Absent')} className="px-3 py-1.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">Mark All Absent</button>
                            </div>
                        </div>

                        <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold">
                                    <tr>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-600">Staff Name</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-600">Designation</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-600">Mobile</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-600 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {staff.length > 0 ? (
                                        staff.map(s => (
                                            <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{s.name}</td>
                                                <td className="p-3 text-slate-500 dark:text-slate-400">{s.designation}</td>
                                                <td className="p-3 text-slate-500 dark:text-slate-400">{s.mobile}</td>
                                                <td className="p-3">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => handleStaffStatusChange(s.id, 'Present')}
                                                            className={`p-2 rounded-md transition-all ${staffAttendanceState[s.id] === 'Present' ? 'bg-green-500 text-white shadow-md scale-105' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600'}`}
                                                            title="Present"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStaffStatusChange(s.id, 'Absent')}
                                                            className={`p-2 rounded-md transition-all ${staffAttendanceState[s.id] === 'Absent' ? 'bg-red-500 text-white shadow-md scale-105' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600'}`}
                                                            title="Absent"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStaffStatusChange(s.id, 'Leave')}
                                                            className={`p-2 rounded-md transition-all ${staffAttendanceState[s.id] === 'Leave' ? 'bg-amber-500 text-white shadow-md scale-105' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-600'}`}
                                                            title="Leave"
                                                        >
                                                            <Clock className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-slate-400 dark:text-slate-500">
                                                No staff members found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            )}

            {viewMode === 'dashboard' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                >
                    {/* Dashboard View */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Stats Cards */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center justify-center">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3">
                                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase">Total Students</h3>
                            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1">{totalStudents}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center justify-center">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-3">
                                <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase">Present Today</h3>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{presentCount}</p>
                            <p className="text-xs text-slate-400 mt-1">{attendancePercentage}% Attendance</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center justify-center">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full mb-3">
                                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase">Absent Today</h3>
                            <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{absentCount}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Batch Wise Attendance Chart (Simple Bars) */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
                                <BarChart2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Batch Attendance</h2>
                            </div>
                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                {batches.filter(b => b.status === 'Active').map(batch => {
                                    const batchStudents = students.filter(s => s.batch === batch.name);
                                    if (batchStudents.length === 0) return null;

                                    const batchPresent = batchStudents.filter(s => attendanceState[s.id] === 'Present' || attendanceState[s.id] === 'Late').length;
                                    const batchTotal = batchStudents.length;
                                    const batchPercent = Math.round((batchPresent / batchTotal) * 100);

                                    return (
                                        <div key={batch.id}>
                                            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                                <span>{batch.name}</span>
                                                <span>{batchPercent}% ({batchPresent}/{batchTotal})</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                                                <div
                                                    className={`h-2.5 rounded-full ${batchPercent >= 80 ? 'bg-green-500' : batchPercent >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                    style={{ width: `${batchPercent}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {viewMode === 'scan' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center justify-center space-y-6"
                >
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 w-full max-w-md">
                        <div className="text-center mb-4">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Scan QR Code</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Point the camera at a student or staff ID card</p>
                        </div>

                        <div className="overflow-hidden rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 relative min-h-[300px] flex items-center justify-center">
                            <div id="reader" className="w-full"></div>
                        </div>

                        <div className="mt-4 text-center">
                            <p className="text-xs text-slate-400">
                                Ensure good lighting and hold the card steady.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700"
                    >
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Export Attendance Report</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={reportStartDate}
                                    onChange={(e) => setReportStartDate(e.target.value)}
                                    className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={reportEndDate}
                                    onChange={(e) => setReportEndDate(e.target.value)}
                                    className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200"
                                />
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                Report will be generated for {filteredStudents.length} students currently filtered.
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowReportModal(false)}
                                className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={downloadReport}
                                className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" /> Download CSV
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            <AlertModal
                isOpen={alertState.isOpen}
                onClose={closeAlert}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type}
            />
        </motion.div>
    );
};
