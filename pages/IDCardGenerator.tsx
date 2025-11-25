import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { motion } from 'framer-motion';
import { CreditCard, Download, Search, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { QRCodeCanvas } from 'qrcode.react';

export const IDCardGenerator = () => {
    const { students, batches, courses, centreSettings, logoUrl, staff } = useData();
    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isStaffMode, setIsStaffMode] = useState(false);
    const [directorSignature, setDirectorSignature] = useState<string | null>(null);
    const [studentPhotos, setStudentPhotos] = useState<Record<string, string>>({});

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

    const handleStudentPhotoUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setStudentPhotos(prev => ({ ...prev, [id]: event.target?.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const filteredItems = isStaffMode ? staff.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.mobile.includes(searchQuery) ||
        (s.staffId && s.staffId.toLowerCase().includes(searchQuery.toLowerCase()))
    ) : students.filter(student => {
        const matchesBatch = selectedBatch ? student.batch === selectedBatch : true;
        const matchesCourse = selectedCourse ? student.course === selectedCourse : true;
        const matchesSearch = searchQuery
            ? student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.enrollmentNo.toLowerCase().includes(searchQuery.toLowerCase())
            : true;
        return matchesBatch && matchesCourse && matchesSearch;
    });

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedIds.length === filteredItems.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredItems.map(s => s.id));
        }
    };

    const generatePDF = async () => {
        if (selectedIds.length === 0) return;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.left = '-9999px';
        iframe.style.top = '0';
        iframe.style.width = '210mm';
        iframe.style.height = '297mm';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) {
            document.body.removeChild(iframe);
            return;
        }

        doc.open();
        doc.write('<html><head><style>body { margin: 0; padding: 0; background: white; font-family: "Inter", sans-serif; }</style></head><body><div id="print-root"></div></body></html>');
        doc.close();

        const rootElement = doc.getElementById('print-root');
        if (!rootElement) {
            document.body.removeChild(iframe);
            return;
        }

        const root = createRoot(rootElement);
        const itemsToPrint = filteredItems.filter(s => selectedIds.includes(s.id));

        await new Promise<void>((resolve) => {
            root.render(
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '20px', backgroundColor: '#ffffff' }}>
                    {itemsToPrint.map(item => (
                        <React.Fragment key={item.id}>
                            {/* FRONT SIDE */}
                            <div className="id-card-preview" style={{
                                width: '204px',
                                height: '323px',
                                position: 'relative',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                backgroundColor: '#ffffff',
                                fontFamily: 'sans-serif',
                                boxSizing: 'border-box',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                border: '1px solid #e2e8f0'
                            }}>
                                {/* Top Curve Background */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '85px',
                                    backgroundColor: '#1e293b',
                                    borderBottomLeftRadius: '50%',
                                    borderBottomRightRadius: '50%',
                                    zIndex: 0
                                }} />

                                {/* Logo Only - Doubled Size to 88px */}
                                <div style={{
                                    position: 'relative',
                                    zIndex: 1,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    paddingTop: '14px'
                                }}>
                                    <div style={{
                                        width: '88px',
                                        height: '88px',
                                        borderRadius: '50%',
                                        backgroundColor: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                        padding: '6px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}>
                                        {logoUrl ? (
                                            <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            <span style={{ fontWeight: 'bold', fontSize: '24px', color: '#1e293b' }}>
                                                {centreSettings.name.substring(0, 2)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Photo - Larger */}
                                <div style={{
                                    position: 'relative',
                                    zIndex: 1,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    marginTop: '10px'
                                }}>
                                    <div style={{
                                        width: '105px',
                                        height: '105px',
                                        borderRadius: '50%',
                                        border: '4px solid white',
                                        overflow: 'hidden',
                                        backgroundColor: '#f1f5f9',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                    }}>
                                        {studentPhotos[item.id] ? (
                                            <img src={studentPhotos[item.id]} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'center' }}>No Photo</div>
                                        )}
                                    </div>
                                </div>

                                {/* Student Details */}
                                <div style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    paddingTop: '14px',
                                    paddingBottom: '42px',
                                    paddingLeft: '16px',
                                    paddingRight: '16px',
                                    zIndex: 1
                                }}>
                                    <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: 0, textAlign: 'center', lineHeight: '1.2' }}>
                                        {item.name}
                                    </h2>
                                    <p style={{ fontSize: '10px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginTop: '4px', marginBottom: '12px' }}>
                                        {isStaffMode ? (item as any).designation : 'Student'}
                                    </p>

                                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {isStaffMode ? (
                                            <>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '2px' }}>
                                                    <span style={{ color: '#64748b' }}>ID No</span>
                                                    <span style={{ fontWeight: '600', color: '#334155' }}>{(item as any).staffId || 'N/A'}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '2px' }}>
                                                    <span style={{ color: '#64748b' }}>Mobile</span>
                                                    <span style={{ fontWeight: '600', color: '#334155' }}>{item.mobile}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '2px' }}>
                                                    <span style={{ color: '#64748b' }}>ID No</span>
                                                    <span style={{ fontWeight: '600', color: '#334155' }}>{(item as any).enrollmentNo}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '2px' }}>
                                                    <span style={{ color: '#64748b' }}>Course</span>
                                                    <span style={{ fontWeight: '600', color: '#334155' }}>{(item as any).course}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Footer Curve */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: '-10%',
                                    right: '-10%',
                                    height: '32px',
                                    backgroundColor: '#dc2626',
                                    borderTopLeftRadius: '50%',
                                    borderTopRightRadius: '50%',
                                    width: '120%',
                                    zIndex: 0
                                }} />
                            </div>

                            {/* BACK SIDE */}
                            <div className="id-card-preview" style={{
                                width: '204px',
                                height: '323px',
                                position: 'relative',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                backgroundColor: '#ffffff',
                                fontFamily: 'sans-serif',
                                boxSizing: 'border-box',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                border: '1px solid #e2e8f0'
                            }}>
                                {/* Top Curve Background */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '110px',
                                    backgroundColor: '#1e293b',
                                    borderBottomLeftRadius: '50%',
                                    borderBottomRightRadius: '50%',
                                    zIndex: 0
                                }} />

                                {/* Center Name + Student Info */}
                                <div style={{
                                    position: 'relative',
                                    zIndex: 1,
                                    paddingTop: '18px',
                                    paddingLeft: '20px',
                                    paddingRight: '20px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{
                                        color: 'white',
                                        fontSize: '13px',
                                        fontWeight: 'bold',
                                        lineHeight: '1.3',
                                        marginBottom: '6px'
                                    }}>
                                        {centreSettings.name}
                                    </div>
                                    <div style={{
                                        color: '#cbd5e1',
                                        fontSize: '7px',
                                        lineHeight: '1.3',
                                        marginBottom: '8px'
                                    }}>
                                        {centreSettings.address || ''}
                                    </div>

                                    {/* Name and ID on back */}
                                    <div style={{
                                        color: 'white',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        lineHeight: '1.2',
                                        marginTop: '6px'
                                    }}>
                                        {item.name}
                                    </div>
                                    <div style={{
                                        color: '#cbd5e1',
                                        fontSize: '9px',
                                        lineHeight: '1.2',
                                        marginTop: '2px'
                                    }}>
                                        {isStaffMode ? `ID: ${(item as any).staffId || 'N/A'}` : `ID: ${(item as any).enrollmentNo}`}
                                    </div>
                                </div>

                                {/* QR Code - Centered */}
                                <div style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingTop: '20px',
                                    paddingBottom: '55px',
                                    zIndex: 1
                                }}>
                                    <div style={{
                                        backgroundColor: 'white',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                    }}>
                                        <QRCodeCanvas value={item.id} size={85} level="H" />
                                    </div>
                                    <div style={{
                                        marginTop: '12px',
                                        fontSize: '9px',
                                        color: '#64748b',
                                        textAlign: 'center',
                                        fontWeight: '600'
                                    }}>
                                        Scan for Details
                                    </div>
                                </div>

                                {/* Footer Curve & Signature */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: '50px',
                                    zIndex: 0
                                }}>
                                    {/* Red Curve */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: '-10%',
                                        right: '-10%',
                                        height: '38px',
                                        backgroundColor: '#dc2626',
                                        borderTopLeftRadius: '50%',
                                        borderTopRightRadius: '50%',
                                        width: '120%'
                                    }} />

                                    {/* Signature Area - Moved up to 8px */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '8px',
                                        left: '0',
                                        right: '0',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 2,
                                        paddingLeft: '20px',
                                        paddingRight: '20px'
                                    }}>
                                        {directorSignature && (
                                            <img src={directorSignature} alt="Sig" style={{ height: '20px', objectFit: 'contain', marginBottom: '2px', filter: 'brightness(0) invert(1)' }} />
                                        )}
                                        <span style={{ fontSize: '8px', color: '#ffffff', whiteSpace: 'nowrap', fontWeight: '500' }}>Authorized Signature</span>
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            );
            setTimeout(resolve, 1000);
        });

        const images = Array.from(doc.images);
        await Promise.all(images.map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
            });
        }));

        const cards = doc.querySelectorAll('.id-card-preview');

        const pdf = new jsPDF('p', 'mm', 'a4');

        let x = 10;
        let y = 10;
        const cardWidth = 54;
        const cardHeight = 85.6;
        const margin = 10;

        for (let i = 0; i < cards.length; i++) {
            const canvas = await html2canvas(cards[i] as HTMLElement, {
                scale: 3,
                window: iframe.contentWindow as Window,
                useCORS: true,
                logging: false,
                backgroundColor: null
            } as any);
            const imgData = canvas.toDataURL('image/png');

            if (i > 0 && i % 9 === 0) {
                pdf.addPage();
                x = 10;
                y = 10;
            }

            pdf.addImage(imgData, 'PNG', x, y, cardWidth, cardHeight);

            if ((i + 1) % 3 === 0) {
                x = 10;
                y += cardHeight + margin;
            } else {
                x += cardWidth + margin;
            }
        }

        pdf.save(isStaffMode ? 'staff-id-cards.pdf' : 'student-id-cards.pdf');
        document.body.removeChild(iframe);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 pb-20"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <CreditCard className="w-8 h-8 text-slate-800 dark:text-slate-100" />
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">ID Card Generator</h1>
                </div>
                <Link to="/" className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 text-sm font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex gap-4 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                    <button
                        onClick={() => { setIsStaffMode(false); setSelectedIds([]); }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${!isStaffMode ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'}`}
                    >
                        Student ID Cards
                    </button>
                    <button
                        onClick={() => { setIsStaffMode(true); setSelectedIds([]); }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${isStaffMode ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'}`}
                    >
                        Staff ID Cards
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {!isStaffMode && (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Batch</label>
                                <select
                                    value={selectedBatch}
                                    onChange={(e) => setSelectedBatch(e.target.value)}
                                    className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200"
                                >
                                    <option value="">All Batches</option>
                                    {batches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
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
                                    {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                        </>
                    )}
                    <div className={isStaffMode ? "md:col-span-2" : ""}>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder={isStaffMode ? "Search by Name, Mobile or ID..." : "Search by Name or Enrollment No..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full border-slate-300 dark:border-slate-600 rounded-md pl-9 p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200"
                            />
                        </div>
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
                </div>

                <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                        {selectedIds.length} selected
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={selectAll}
                            className="text-sm text-blue-600 font-medium hover:text-blue-700"
                        >
                            {selectedIds.length === filteredItems.length ? 'Deselect All' : 'Select All'}
                        </button>
                        <button
                            onClick={generatePDF}
                            disabled={selectedIds.length === 0}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="w-4 h-4" /> Generate PDF
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2 border border-slate-100 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                    {filteredItems.map(item => (
                        <div
                            key={item.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedIds.includes(item.id)
                                ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/20 dark:border-blue-500'
                                : 'bg-white border-slate-200 hover:border-blue-300 dark:bg-slate-800 dark:border-slate-700'
                                }`}
                        >
                            <div
                                onClick={() => toggleSelection(item.id)}
                                className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${selectedIds.includes(item.id)
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'border-slate-300 dark:border-slate-600'
                                    }`}
                            >
                                {selectedIds.includes(item.id) && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            <div className="flex-1" onClick={() => toggleSelection(item.id)}>
                                <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{item.name}</div>
                                <div className="text-xs text-slate-500">{isStaffMode ? (item as any).designation : (item as any).enrollmentNo}</div>
                            </div>

                            <div className="relative group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleStudentPhotoUpload(item.id, e)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className={`p-2 rounded-full transition-colors ${studentPhotos[item.id] ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400 hover:bg-blue-100 hover:text-blue-600'}`}>
                                    <ImageIcon className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};