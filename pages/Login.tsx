import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, KeyRound, ArrowRight, CheckCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { AlertModal, AlertType } from '../components/AlertModal';

export const Login = () => {
  const navigate = useNavigate();
  const { sendOtp, verifyOtp } = useData();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleGetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const success = await sendOtp(email);
      if (success) {
        setStep('otp');
        showAlert("OTP Sent", `An OTP has been sent to ${email}. Please check your inbox.`, "success");
      } else {
        setError("Failed to send OTP. Please check your email configuration.");
      }
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const isValid = await verifyOtp(email, otp);
      if (isValid) {
        // Set simulated auth token
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', email);
        navigate('/');
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError("Verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-8"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black dark:bg-white rounded-lg text-white dark:text-black text-2xl font-bold mb-4 shadow-lg">L</div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Welcome to Lerzo</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Sign in to manage your student centre</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-6 border border-red-100 dark:border-red-800 flex items-center gap-2"
          >
            <span className="font-bold">Error:</span> {error}
          </motion.div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleGetOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400 dark:text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full border-slate-300 dark:border-slate-700 rounded-lg pl-10 p-3 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md hover:shadow-lg"
            >
              {isLoading ? 'Sending...' : 'Get OTP'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-100 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-300 mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> OTP sent to <strong>{email}</strong>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Enter OTP</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 w-5 h-5 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit code"
                  className="w-full border-slate-300 dark:border-slate-700 rounded-lg pl-10 p-3 focus:ring-blue-500 focus:border-blue-500 tracking-widest font-mono text-lg bg-white dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md hover:shadow-lg"
            >
              {isLoading ? 'Verifying...' : 'Login'} <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => { setStep('email'); setError(null); }}
              className="w-full text-slate-500 dark:text-slate-400 text-sm hover:text-slate-800 dark:hover:text-slate-200 mt-2 transition-colors"
            >
              Use a different email
            </button>
          </form>
        )}
      </motion.div>

      <AlertModal
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />
    </div>
  );
};
