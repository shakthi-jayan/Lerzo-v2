
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Lock, Cloud, Download, Upload, RefreshCw, AlertTriangle, CheckCircle, X, UserCheck, Mail } from 'lucide-react';
import { generateSalt, deriveKey, encryptData, decryptData } from '../utils/encryption';
import { useData } from '../context/DataContext';
import { ConfirmationModal } from '../components/ConfirmationModal';
import emailjs from '@emailjs/browser';

export const Backup = () => {
  const { students, enquiries, payments, courses, batches, schemes, restoreData, centreSettings, currentUserEmail } = useData();
  const [backupStatus, setBackupStatus] = useState<'idle' | 'processing' | 'done'>('idle');
  const [emailBackupStatus, setEmailBackupStatus] = useState<'idle' | 'processing' | 'done'>('idle');
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  const getUserIdentifier = () => {
    if (currentUserEmail) {
      return currentUserEmail;
    }
    return 'admin@lerzo.com'; // Default/Developer identifier
  };

  const handleCloudBackup = () => {
    setBackupStatus('processing');
    setTimeout(() => {
      setBackupStatus('done');
      setStatusMsg({ type: 'success', text: "Encrypted backup uploaded to Cloud (Simulated)." });
    }, 2000);
  };

  const handleEmailBackup = async () => {
    setEmailBackupStatus('processing');
    try {
      // Create backup payload
      const userId = getUserIdentifier();
      const backupPayload = {
        metadata: {
          app: "Lerzo",
          timestamp: new Date().toISOString(),
          lockedTo: userId
        },
        data: { students, enquiries, payments, courses, batches, schemes }
      };

      const salt = generateSalt();
      const key = await deriveKey(userId, salt);
      const encryptedData = await encryptData(backupPayload, key);

      const finalBackupFile = {
        salt: salt,
        iv: encryptedData.iv,
        cipherText: encryptedData.cipherText,
        info: "Locked to: " + userId
      };

      // Since EmailJS has a size limit (usually 50KB for free tier parameters), 
      // we can't send large backups directly as text. 
      // For this demo, we'll try to send it if it's small, otherwise warn.
      const backupString = JSON.stringify(finalBackupFile);

      if (backupString.length > 40000) {
        setStatusMsg({ type: 'error', text: "Backup too large for email. Please download instead." });
        setEmailBackupStatus('idle');
        return;
      }

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          to_email: centreSettings.email,
          message: "Here is your encrypted backup data.",
          backup_data: backupString,
          date: new Date().toLocaleDateString()
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      setEmailBackupStatus('done');
      setStatusMsg({ type: 'success', text: `Encrypted backup sent to ${centreSettings.email} successfully!` });
    } catch (error) {
      console.error("Email backup failed:", error);
      setStatusMsg({ type: 'error', text: "Failed to send email backup. Check console." });
      setEmailBackupStatus('idle');
    }
  };

  const handleLocalBackup = async () => {
    const userId = getUserIdentifier();
    try {
      const backupPayload = {
        metadata: {
          app: "Lerzo",
          timestamp: new Date().toISOString(),
          lockedTo: userId
        },
        data: { students, enquiries, payments, courses, batches, schemes }
      };

      const salt = generateSalt();
      const key = await deriveKey(userId, salt);
      const encryptedData = await encryptData(backupPayload, key);

      const finalBackupFile = {
        salt: salt,
        iv: encryptedData.iv,
        cipherText: encryptedData.cipherText,
        info: "Locked to: " + userId
      };

      const blob = new Blob([JSON.stringify(finalBackupFile)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lerzo_backup_${new Date().toISOString().split('T')[0]}.enc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatusMsg({ type: 'success', text: "Secure backup downloaded." });

    } catch (error) {
      setStatusMsg({ type: 'error', text: "Failed to create encrypted backup." });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setRestoreFile(e.target.files[0]);
      setStatusMsg(null);
    }
  };

  const performRestore = async () => {
    setShowRestoreConfirm(false);
    setIsRestoring(true);
    setStatusMsg(null);
    const userId = getUserIdentifier();

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        let backupFile;
        try { backupFile = JSON.parse(content); } catch (err) { throw new Error("Invalid file format."); }

        const key = await deriveKey(userId, backupFile.salt);
        let decryptedData;
        try {
          decryptedData = await decryptData(backupFile.cipherText, backupFile.iv, key);
        } catch (err) {
          throw new Error("Access Denied. Authentication mismatch.");
        }

        if (decryptedData && decryptedData.data) {
          restoreData(decryptedData.data);
          setStatusMsg({ type: 'success', text: "Data restored successfully!" });
        }
      } catch (error: any) {
        setStatusMsg({ type: 'error', text: error.message });
      } finally {
        setIsRestoring(false);
        setRestoreFile(null);
      }
    };
    if (restoreFile) reader.readAsText(restoreFile);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <Database className="w-8 h-8 text-slate-800 dark:text-slate-100" />
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Backup & Restore</h1>
      </div>

      {statusMsg && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className={`p-4 rounded-lg border flex items-start gap-3 ${statusMsg.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'}`}
        >
          {statusMsg.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <div className="flex-1 text-sm font-medium">{statusMsg.text}</div>
          <button onClick={() => setStatusMsg(null)}><X className="w-4 h-4" /></button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-6"
        >
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-2">Create Backup</h2>
          <div className="space-y-4">
            <button onClick={handleCloudBackup} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
              {backupStatus === 'processing' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
              Upload to Cloud
            </button>
            <button onClick={handleEmailBackup} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
              {emailBackupStatus === 'processing' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              Send Backup via Email
            </button>
            <button onClick={handleLocalBackup} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
              <Download className="w-4 h-4" /> Download Secure Backup
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-6"
        >
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-2">Restore Data</h2>
          <div className="space-y-4">
            <input type="file" accept=".enc" onChange={handleFileChange} className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50 transition-colors" />
            {restoreFile && <p className="text-xs text-green-600 dark:text-green-400 font-bold">Selected: {restoreFile.name}</p>}
            <button onClick={() => setShowRestoreConfirm(true)} disabled={!restoreFile || isRestoring} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
              {isRestoring ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Restore from File
            </button>
          </div>
        </motion.div>
      </div>

      <ConfirmationModal
        isOpen={showRestoreConfirm}
        onClose={() => setShowRestoreConfirm(false)}
        onConfirm={performRestore}
        title="Restore Data?"
        message="This will OVERWRITE all current data. Proceed?"
        confirmText="Yes, Restore"
        isDangerous={true}
      />
    </motion.div>
  );
};
