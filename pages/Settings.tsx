
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Upload, ArrowLeft, RefreshCw, CheckCircle, AlertTriangle, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

export const Settings = () => {
  const { updateLogo, logoUrl, centreSettings, updateCentreSettings } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  // Centre Settings Form State
  const [settingsForm, setSettingsForm] = useState(centreSettings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    if (centreSettings) {
      setSettingsForm(centreSettings);
    }
  }, [centreSettings]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setStatus({ type: 'error', msg: 'File size exceeds 2MB limit.' });
        return;
      }
      setSelectedFile(file);
      setStatus(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      await updateLogo(selectedFile);
      setStatus({ type: 'success', msg: 'Logo updated successfully!' });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      setStatus({ type: 'error', msg: error.message || 'Failed to upload logo.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettingsForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await updateCentreSettings(settingsForm);
      setStatus({ type: 'success', msg: 'Centre details updated successfully!' });
    } catch (error) {
      setStatus({ type: 'error', msg: 'Failed to update settings.' });
    } finally {
      setIsSavingSettings(false);
    }
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
          <SettingsIcon className="w-8 h-8 text-slate-800 dark:text-slate-100" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Settings</h1>
        </div>
        <Link to="/" className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      {status && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg text-sm flex items-center gap-2 ${status.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`}
        >
          {status.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {status.msg}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logo Upload */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
        >
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Centre Logo</h2>

          <div className="flex flex-col items-center justify-center mb-6">
            <div className="bg-slate-100 dark:bg-slate-700 rounded-md p-4 flex items-center justify-center w-32 h-32 border border-slate-200 dark:border-slate-600 mb-3">
              {logoUrl && (logoUrl.startsWith('http') || logoUrl.startsWith('data:image')) ? (
                <img src={logoUrl} alt="Centre Logo" className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-slate-400 dark:text-slate-500 text-xs font-bold">NO LOGO</span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png"
              className="hidden"
            />
            <div className="border border-slate-300 dark:border-slate-600 rounded-md flex items-center overflow-hidden">
              <button
                onClick={handleBrowseClick}
                className="bg-slate-100 dark:bg-slate-700 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 font-medium border-r border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Browse...
              </button>
              <span className="px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400 italic truncate flex-1 bg-white dark:bg-slate-800">
                {selectedFile ? selectedFile.name : "Choose file..."}
              </span>
            </div>

            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-md font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed"
            >
              {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {isUploading ? 'Uploading...' : 'Update Logo'}
            </button>
          </div>
        </motion.div>

        {/* Edit Centre Information */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
        >
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">Edit Centre Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Centre Name</label>
              <input name="name" value={settingsForm.name} onChange={handleSettingsChange} type="text" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input name="email" value={settingsForm.email} onChange={handleSettingsChange} type="email" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input name="phone" value={settingsForm.phone} onChange={handleSettingsChange} type="tel" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Address</label>
              <input name="address1" value={settingsForm.address1} onChange={handleSettingsChange} type="text" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">City</label>
                <input name="city" value={settingsForm.city} onChange={handleSettingsChange} type="text" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pincode</label>
                <input name="pincode" value={settingsForm.pincode} onChange={handleSettingsChange} type="text" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200" />
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={isSavingSettings}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-md font-bold text-sm hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 mt-4"
            >
              {isSavingSettings ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </motion.div>

        {/* WhatsApp API Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:col-span-2"
        >
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">WhatsApp API Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Provider</label>
              <select
                name="whatsappProvider"
                value={settingsForm.whatsappProvider || 'click-to-chat'}
                onChange={(e) => setSettingsForm(prev => ({ ...prev, whatsappProvider: e.target.value as any }))}
                className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="click-to-chat">Click-to-Chat (Free, Manual)</option>
                <option value="twilio">Twilio API (Paid, Automated)</option>
              </select>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {settingsForm.whatsappProvider === 'twilio'
                  ? "Send automated messages directly from your centre's number."
                  : "Opens WhatsApp Web/App for you to manually send messages."}
              </p>
            </div>

            {settingsForm.whatsappProvider === 'twilio' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Twilio Account SID</label>
                  <input
                    name="twilioAccountSid"
                    value={settingsForm.twilioAccountSid || ''}
                    onChange={handleSettingsChange}
                    type="text"
                    placeholder="AC..."
                    className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Twilio Auth Token</label>
                  <input
                    name="twilioAuthToken"
                    value={settingsForm.twilioAuthToken || ''}
                    onChange={handleSettingsChange}
                    type="password"
                    placeholder="Enter your Auth Token"
                    className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">WhatsApp Number</label>
                  <input
                    name="twilioWhatsAppNumber"
                    value={settingsForm.twilioWhatsAppNumber || ''}
                    onChange={handleSettingsChange}
                    type="text"
                    placeholder="whatsapp:+14155238886"
                    className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleSaveSettings}
              disabled={isSavingSettings}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-md font-bold text-sm hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 mt-4"
            >
              {isSavingSettings ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Settings
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
