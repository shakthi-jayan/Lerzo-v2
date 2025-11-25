import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, ArrowLeft, FileText, CheckCircle } from 'lucide-react';
import { AlertModal, AlertType } from '../components/AlertModal';
import { motion } from 'framer-motion';

export const Subscription = () => {
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

  const handlePayment = (plan: string) => {
    showAlert("Payment Gateway", `Opening Razorpay Mock for ${plan} plan. Order ID would be generated from backend.`, "info");
    // In real implementation:
    // 1. Call /api/payment/create-order
    // 2. const rzp = new window.Razorpay(options);
    // 3. rzp.open();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-slate-800 dark:text-slate-100" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Subscription Invoices</h1>
        </div>
        <Link to="/settings" className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Settings
        </Link>
      </div>

      {/* Subscription Status / Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border-2 border-blue-500 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">CURRENT PLAN</div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Monthly</h3>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 my-4">₹699<span className="text-sm text-slate-400 dark:text-slate-500 font-medium">/month</span></div>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><CheckCircle className="w-4 h-4 text-green-500" /> Unlimited Students</li>
            <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><CheckCircle className="w-4 h-4 text-green-500" /> Cloud Backup</li>
            <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><CheckCircle className="w-4 h-4 text-green-500" /> Priority Support</li>
          </ul>
          <button disabled className="w-full bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 font-bold py-2 rounded cursor-not-allowed">Active</button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative"
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">BEST VALUE</div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Yearly</h3>
          <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 my-4">₹6999<span className="text-sm text-slate-400 dark:text-slate-500 font-medium">/year</span></div>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><CheckCircle className="w-4 h-4 text-green-500" /> Save ₹1389/year</li>
            <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><CheckCircle className="w-4 h-4 text-green-500" /> All Pro Features</li>
          </ul>
          <button onClick={() => handlePayment('Yearly')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition-colors shadow-sm">Upgrade Now</button>
        </motion.div>
      </div>

      {/* Invoices List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center"
      >
        <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
          <FileText className="w-16 h-16 mb-4 opacity-50" />
          <h3 className="text-xl font-medium text-slate-600 dark:text-slate-300 mb-2">No Invoices Found</h3>
          <p className="text-sm">You don't have any subscription payments yet.</p>
        </div>
      </motion.div>

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
      >
        <div className="flex items-center gap-2 mb-6 text-slate-800 dark:text-slate-100">
          <div className="bg-black dark:bg-white rounded-full w-5 h-5 flex items-center justify-center text-white dark:text-black text-xs font-bold">?</div>
          <h2 className="text-lg font-bold">Need Help?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-medium text-slate-700 dark:text-slate-200 mb-2">Download Invoices</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Click the download button to get PDF invoices for your records.</p>
          </div>
          <div>
            <h3 className="font-medium text-slate-700 dark:text-slate-200 mb-2">Payment Support</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">For payment issues, contact support with your Payment ID.</p>
          </div>
          <div>
            <h3 className="font-medium text-slate-700 dark:text-slate-200 mb-2">Billing Questions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Need to update billing info? Contact our support team.</p>
          </div>
        </div>
      </motion.div>

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