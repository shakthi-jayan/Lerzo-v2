
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { AddStudent } from './pages/AddStudent';
import { StudentDetails } from './pages/StudentDetails';
import { RecordPayment } from './pages/RecordPayment';
import { Enquiries } from './pages/Enquiries';
import { EnquiryKanban } from './pages/EnquiryKanban';
import { AddEnquiry } from './pages/AddEnquiry';
import { ExportData } from './pages/ExportData';
import { Courses } from './pages/Courses';
import { AddCourse } from './pages/AddCourse';
import { Schemes } from './pages/Schemes';
import { AddScheme } from './pages/AddScheme';
import { Batches } from './pages/Batches';
import { AddBatch } from './pages/AddBatch';
import { Settings } from './pages/Settings';
import { Subscription } from './pages/Subscription';
import { Backup } from './pages/Backup';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';
import { BulkSMS } from './pages/BulkSMS';
import { Reports } from './pages/Reports';
import { Attendance } from './pages/Attendance';
import { IDCardGenerator } from './pages/IDCardGenerator';
import { CertificateGenerator } from './pages/CertificateGenerator';
import { StaffList } from './pages/StaffList';
import { AddStaff } from './pages/AddStaff';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';

// Private Route Wrapper
const PrivateRoute = ({ children }: { children?: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authCheckCounter, setAuthCheckCounter] = useState(0);

  const checkAuth = () => {
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    const isBypass = localStorage.getItem('lerzo_bypass_auth') === 'true';

    if (isAuth || isBypass) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    // Initial auth check
    checkAuth();

    // Listen for storage changes (logout in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'isAuthenticated' || e.key === null) {
        checkAuth();
      }
    };

    // Listen for page visibility changes (returning from another tab/window)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setAuthCheckCounter(prev => prev + 1);
        checkAuth();
      }
    };

    // Listen for page being loaded from cache (back button)
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page was loaded from cache
        setAuthCheckCounter(prev => prev + 1);
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [authCheckCounter]);

  if (isAuthenticated === null) return <div className="h-screen flex items-center justify-center text-slate-400 text-sm font-medium">Loading Application...</div>;

  // If not authenticated, show NotFound instead of redirecting
  return isAuthenticated ? <Layout>{children}</Layout> : <NotFound />;
};

const AppRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    // Check if the URL contains a Supabase access token (from magic link)
    if (location.hash.includes('access_token')) {
      // Supabase client handles the session automatically when it detects the hash.
      // We just need to redirect to the dashboard or let the Auth state listener kick in.
      // The DataContext's onAuthStateChange will catch this.
      window.location.hash = ''; // Clear the hash to clean up the URL
      window.location.replace('/'); // Redirect to home/dashboard
    }
  }, [location]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Handle Supabase Auth Redirects - Catch all that might look like a route but are actually hash fragments */}
      <Route path="/access_token/*" element={<Navigate to="/" replace />} />

      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/students" element={<PrivateRoute><Students /></PrivateRoute>} />
      <Route path="/students/add" element={<PrivateRoute><AddStudent /></PrivateRoute>} />
      <Route path="/students/edit/:id" element={<PrivateRoute><AddStudent /></PrivateRoute>} />
      <Route path="/students/:id" element={<PrivateRoute><StudentDetails /></PrivateRoute>} />
      <Route path="/students/:id/pay-fees" element={<PrivateRoute><RecordPayment /></PrivateRoute>} />
      <Route path="/bulk-sms" element={<PrivateRoute><BulkSMS /></PrivateRoute>} />

      <Route path="/enquiries" element={<PrivateRoute><Enquiries /></PrivateRoute>} />
      <Route path="/enquiries/kanban" element={<PrivateRoute><EnquiryKanban /></PrivateRoute>} />
      <Route path="/enquiries/add" element={<PrivateRoute><AddEnquiry /></PrivateRoute>} />
      <Route path="/enquiries/edit/:id" element={<PrivateRoute><AddEnquiry /></PrivateRoute>} />

      <Route path="/export" element={<PrivateRoute><ExportData /></PrivateRoute>} />

      <Route path="/courses" element={<PrivateRoute><Courses /></PrivateRoute>} />
      <Route path="/courses/add" element={<PrivateRoute><AddCourse /></PrivateRoute>} />
      <Route path="/courses/edit/:id" element={<PrivateRoute><AddCourse /></PrivateRoute>} />

      <Route path="/schemes" element={<PrivateRoute><Schemes /></PrivateRoute>} />
      <Route path="/schemes/add" element={<PrivateRoute><AddScheme /></PrivateRoute>} />
      <Route path="/schemes/edit/:id" element={<PrivateRoute><AddScheme /></PrivateRoute>} />

      <Route path="/batches" element={<PrivateRoute><Batches /></PrivateRoute>} />
      <Route path="/batches/add" element={<PrivateRoute><AddBatch /></PrivateRoute>} />
      <Route path="/batches/edit/:id" element={<PrivateRoute><AddBatch /></PrivateRoute>} />

      <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
      <Route path="/subscription" element={<PrivateRoute><Subscription /></PrivateRoute>} />
      <Route path="/backup" element={<PrivateRoute><Backup /></PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
      <Route path="/attendance" element={<PrivateRoute><Attendance /></PrivateRoute>} />
      <Route path="/id-cards" element={<PrivateRoute><IDCardGenerator /></PrivateRoute>} />
      <Route path="/certificates" element={<PrivateRoute><CertificateGenerator /></PrivateRoute>} />

      <Route path="/staff" element={<PrivateRoute><StaffList /></PrivateRoute>} />
      <Route path="/staff/add" element={<PrivateRoute><AddStaff /></PrivateRoute>} />
      <Route path="/staff/edit/:id" element={<PrivateRoute><AddStaff /></PrivateRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <DataProvider>
        <Router>
          <AppRoutes />
        </Router>
      </DataProvider>
    </ThemeProvider>
  );
};

export default App;
