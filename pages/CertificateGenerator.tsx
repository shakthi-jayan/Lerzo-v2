import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, Search, ArrowLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const CertificateGenerator = () => {
    const { students, courses, centreSettings, logoUrl } = useData();
    const [selectedCourse, setSelectedCourse] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
    const [certificateDate, setCertificateDate] = useState(new Date().toISOString().split('T')[0]);
    const [directorSignature, setDirectorSignature] = useState<string | null>(null);
    const [sealImage, setSealImage] = useState<string | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setDirectorSignature(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const filteredStudents = students.filter(student => {
        const matchesCourse = selectedCourse ? student.course === selectedCourse : true;
        const matchesSearch = searchQuery
            ? student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.enrollmentNo.toLowerCase().includes(searchQuery.toLowerCase())
            : true;
        return matchesCourse && matchesSearch;
    });

    const generatePDF = async () => {
        if (!printRef.current || !selectedStudent) return;

        const canvas = await html2canvas(printRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`certificate-${selectedStudent}.pdf`);
    };

    const currentStudent = students.find(s => s.id === selectedStudent);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 pb-20"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Award className="w-8 h-8 text-slate-800 dark:text-slate-100" />
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Certificate Generator</h1>
                </div>
                <Link to="/" className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 text-sm font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Controls */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <h2 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-200">Select Student</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Course</label>
                                <select
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                    className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200"
                                >
                                    <option value="">All Courses</option>
                                    {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Name or ID"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full border-slate-300 dark:border-slate-600 rounded-md pl-9 p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Issue Date</label>
                                <input
                                    type="date"
                                    value={certificateDate}
                                    onChange={(e) => setCertificateDate(e.target.value)}
                                    className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Director Signature</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleSignatureUpload}
                                    className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Seal Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                                setSealImage(event.target?.result as string);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200"
                                />
                            </div>
                        </div>

                        <div className="mt-4 max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                            {filteredStudents.map(student => (
                                <div
                                    key={student.id}
                                    onClick={() => setSelectedStudent(student.id)}
                                    className={`p-3 border-b border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${selectedStudent === student.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''}`}
                                >
                                    <div className="font-medium text-sm text-slate-800 dark:text-slate-200">{student.name}</div>
                                    <div className="text-xs text-slate-500">{student.course}</div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={generatePDF}
                            disabled={!selectedStudent}
                            className="w-full mt-6 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="w-5 h-5" /> Download Certificate
                        </button>
                    </div>
                </div>

                {/* Preview */}
                <div className="lg:col-span-2">
                    <div className="bg-slate-100 dark:bg-slate-900 p-8 rounded-xl overflow-auto flex justify-center items-center min-h-[500px]">
                        {currentStudent ? (
                            <div ref={printRef} style={{
                                width: '800px',
                                height: '566px',
                                position: 'relative',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '40px 48px',
                                border: '8px double #e2e8f0',
                                backgroundColor: '#ffffff',
                                color: '#0f172a',
                                fontFamily: 'serif'
                            }}>
                                {/* Decorative Corners */}
                                <div style={{ position: 'absolute', top: '16px', left: '16px', width: '64px', height: '64px', borderTop: '4px solid #2563eb', borderLeft: '4px solid #2563eb' }}></div>
                                <div style={{ position: 'absolute', top: '16px', right: '16px', width: '64px', height: '64px', borderTop: '4px solid #2563eb', borderRight: '4px solid #2563eb' }}></div>
                                <div style={{ position: 'absolute', bottom: '16px', left: '16px', width: '64px', height: '64px', borderBottom: '4px solid #2563eb', borderLeft: '4px solid #2563eb' }}></div>
                                <div style={{ position: 'absolute', bottom: '16px', right: '16px', width: '64px', height: '64px', borderBottom: '4px solid #2563eb', borderRight: '4px solid #2563eb' }}></div>

                                {/* Content */}
                                <div style={{ textAlign: 'center', width: '100%', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                                            {logoUrl ? (
                                                <img src={logoUrl} alt="Logo" style={{ height: '80px', objectFit: 'contain' }} />
                                            ) : (
                                                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2563eb', fontFamily: 'sans-serif' }}>{centreSettings.name}</div>
                                            )}
                                        </div>

                                        <h1 style={{ fontSize: '44px', fontFamily: 'serif', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px', color: '#1e293b' }}>Certificate</h1>
                                        <h2 style={{ fontSize: '18px', fontWeight: '300', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', fontFamily: 'sans-serif' }}>Of Completion</h2>

                                        <div style={{ padding: '24px 0' }}>
                                            <p style={{ fontSize: '16px', fontStyle: 'italic', color: '#475569' }}>This is to certify that</p>
                                            <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '12px 0', fontFamily: 'serif', borderBottom: '2px solid #e2e8f0', display: 'inline-block', padding: '0 40px 6px', color: '#1e40af' }}>
                                                {currentStudent.name}
                                            </div>
                                            <p style={{ fontSize: '16px', fontStyle: 'italic', marginTop: '6px', color: '#475569' }}>has successfully completed the course</p>
                                            <div style={{ fontSize: '22px', fontWeight: 'bold', margin: '6px 0', color: '#1e293b', fontFamily: 'sans-serif' }}>
                                                {currentStudent.course}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', padding: '0 20px' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '16px', fontWeight: '500', borderTop: '1px solid #94a3b8', paddingTop: '6px', width: '160px', fontFamily: 'sans-serif' }}>{new Date(certificateDate).toLocaleDateString()}</div>
                                            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginTop: '2px', fontFamily: 'sans-serif' }}>Date</div>
                                        </div>
                                        <div style={{ width: '80px', height: '80px', position: 'relative', opacity: 0.8 }}>
                                            {sealImage ? (
                                                <img src={sealImage} alt="Seal" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            ) : (
                                                <>
                                                    <Award style={{ width: '100%', height: '100%', color: '#dbeafe' }} />
                                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <div style={{ width: '56px', height: '56px', border: '2px solid #2563eb', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold', color: '#2563eb', transform: 'rotate(-15deg)', fontFamily: 'sans-serif' }}>
                                                            SEAL
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            {directorSignature ? (
                                                <img src={directorSignature} alt="Signature" style={{ height: '40px', margin: '0 auto 4px', objectFit: 'contain' }} />
                                            ) : (
                                                <div style={{ fontSize: '16px', fontWeight: '500', borderTop: '1px solid #94a3b8', paddingTop: '6px', width: '160px', fontFamily: 'cursive' }}>Director Signature</div>
                                            )}
                                            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px', color: '#64748b', fontFamily: 'sans-serif' }}>Director</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-slate-400 flex flex-col items-center">
                                <Award className="w-16 h-16 mb-4 opacity-50" />
                                <p>Select a student to preview certificate</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};