
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Download, ArrowLeft, Users, HelpCircle, FileSpreadsheet, FileText } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAlert } from '../hooks/useAlert';
import { AlertModal } from '../components/AlertModal';

export const ExportData = () => {
   const { students, enquiries } = useData();
   const [dataType, setDataType] = useState('students');
   const [format, setFormat] = useState('excel');
   const { alert, showAlert, closeAlert } = useAlert();

   // For simplicity, we simulate Excel export by creating a CSV file
   const handleExport = () => {
      const data = dataType === 'students' ? students : enquiries;

      if (format === 'pdf') {
         // Use browser print for PDF export
         window.print();
         return;
      }

      if (data.length === 0) {
         showAlert('No Data', 'No data to export.', 'warning');
         return;
      }

      // Create CSV
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(obj => Object.values(obj).map(val => `"${val}"`).join(','));
      const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `lerzo_${dataType}_export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   };

   return (
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5 }}
         className="space-y-6 pb-20"
      >
         <div className="flex items-center justify-between print:hidden">
            <div className="flex items-center gap-3">
               <Download className="w-6 h-6 text-slate-800 dark:text-slate-100" />
               <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Export Data</h1>
            </div>
            <Link to="/" className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 text-xs font-medium">
               <ArrowLeft className="w-3 h-3" /> Back to Dashboard
            </Link>
         </div>

         <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 print:border-0 print:shadow-none"
         >
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 border-b border-slate-100 dark:border-slate-700 pb-2 print:hidden">Data Export Options</h2>

            {/* Export Data Type */}
            <div className="mb-6 print:hidden">
               <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">Export Data Type</label>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                     onClick={() => setDataType('students')}
                     className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all ${dataType === 'students' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 dark:text-slate-300'}`}
                  >
                     <Users className={`w-8 h-8 ${dataType === 'students' ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500'}`} />
                     <span className="font-bold text-sm">Students</span>
                     <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Export student data</span>
                  </button>
                  <button
                     onClick={() => setDataType('enquiries')}
                     className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all ${dataType === 'enquiries' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 dark:text-slate-300'}`}
                  >
                     <HelpCircle className={`w-8 h-8 ${dataType === 'enquiries' ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500'}`} />
                     <span className="font-bold text-sm">Enquiries</span>
                     <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Export enquiry data</span>
                  </button>
               </div>
            </div>

            {/* Export Format */}
            <div className="mb-6 print:hidden">
               <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">Export Format</label>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                     onClick={() => setFormat('excel')}
                     className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all ${format === 'excel' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 dark:text-slate-300'}`}
                  >
                     <FileSpreadsheet className={`w-8 h-8 ${format === 'excel' ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`} />
                     <span className="font-bold text-sm">Excel / CSV</span>
                     <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Download as .csv file</span>
                  </button>
                  <button
                     onClick={() => setFormat('pdf')}
                     className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all ${format === 'pdf' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 dark:text-slate-300'}`}
                  >
                     <FileText className={`w-8 h-8 ${format === 'pdf' ? 'text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`} />
                     <span className="font-bold text-sm">PDF Format</span>
                     <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Download as .pdf file</span>
                  </button>
               </div>
            </div>

            {/* Preview Table (Visible only for PDF print or general preview) */}
            <div className="mt-8">
               <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-100">{dataType === 'students' ? 'Students Data Preview' : 'Enquiries Data Preview'}</h3>
               <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse border border-slate-300 dark:border-slate-600">
                     <thead>
                        <tr className="bg-slate-100 dark:bg-slate-700">
                           {dataType === 'students' ? (
                              <>
                                 <th className="border border-slate-300 dark:border-slate-600 p-2 text-slate-700 dark:text-slate-200">Enrollment No</th>
                                 <th className="border border-slate-300 dark:border-slate-600 p-2 text-slate-700 dark:text-slate-200">Name</th>
                                 <th className="border border-slate-300 dark:border-slate-600 p-2 text-slate-700 dark:text-slate-200">Course</th>
                                 <th className="border border-slate-300 dark:border-slate-600 p-2 text-slate-700 dark:text-slate-200">Mobile</th>
                                 <th className="border border-slate-300 dark:border-slate-600 p-2 text-slate-700 dark:text-slate-200">Fee Status</th>
                                 <th className="border border-slate-300 dark:border-slate-600 p-2 text-slate-700 dark:text-slate-200">Balance</th>
                              </>
                           ) : (
                              <>
                                 <th className="border border-slate-300 dark:border-slate-600 p-2 text-slate-700 dark:text-slate-200">Name</th>
                                 <th className="border border-slate-300 dark:border-slate-600 p-2 text-slate-700 dark:text-slate-200">Course</th>
                                 <th className="border border-slate-300 dark:border-slate-600 p-2 text-slate-700 dark:text-slate-200">Mobile</th>
                                 <th className="border border-slate-300 dark:border-slate-600 p-2 text-slate-700 dark:text-slate-200">Status</th>
                              </>
                           )}
                        </tr>
                     </thead>
                     <tbody>
                        {(dataType === 'students' ? students : enquiries).map((item: any) => (
                           <tr key={item.id} className="dark:bg-slate-800 dark:text-slate-300">
                              {dataType === 'students' ? (
                                 <>
                                    <td className="border border-slate-300 dark:border-slate-600 p-2">{item.enrollmentNo}</td>
                                    <td className="border border-slate-300 dark:border-slate-600 p-2">{item.name}</td>
                                    <td className="border border-slate-300 dark:border-slate-600 p-2">{item.course}</td>
                                    <td className="border border-slate-300 dark:border-slate-600 p-2">{item.mobile}</td>
                                    <td className="border border-slate-300 dark:border-slate-600 p-2">{item.feeStatus}</td>
                                    <td className="border border-slate-300 dark:border-slate-600 p-2">{item.balance}</td>
                                 </>
                              ) : (
                                 <>
                                    <td className="border border-slate-300 dark:border-slate-600 p-2">{item.name}</td>
                                    <td className="border border-slate-300 dark:border-slate-600 p-2">{item.courseInterested}</td>
                                    <td className="border border-slate-300 dark:border-slate-600 p-2">{item.mobile}</td>
                                    <td className="border border-slate-300 dark:border-slate-600 p-2">{item.status}</td>
                                 </>
                              )}
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>

            <div className="flex justify-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-700 mt-6 print:hidden">
               <button
                  onClick={handleExport}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md text-sm font-bold shadow-sm transition-colors"
               >
                  {format === 'excel' ? <FileSpreadsheet className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  {format === 'excel' ? 'Download CSV' : 'Print PDF'}
               </button>
            </div>

         </motion.div>

         <AlertModal
            isOpen={alert.isOpen}
            onClose={closeAlert}
            title={alert.title}
            message={alert.message}
            type={alert.type}
         />
      </motion.div>
   );
};
