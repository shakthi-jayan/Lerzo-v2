
<<<<<<< HEAD
import { DashboardStats, Invoice } from './types';

export const APP_NAME = import.meta.env.VITE_APP_NAME || "Lerzo";
export const APP_SUBTITLE = import.meta.env.VITE_APP_SUBTITLE || "Student Management System";
=======
export const APP_NAME = "Lerzo";
export const APP_SUBTITLE = "Student Management System";
>>>>>>> 93229a5f5419c0d492494c1e3d6d2bbe1da3cde3

export const SIDEBAR_ITEMS = [
  { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
  { section: 'STUDENTS' },
  { label: 'All Students', path: '/students', icon: 'Users' },
  { label: 'Add Student', path: '/students/add', icon: 'UserPlus' },
  { label: 'Bulk SMS', path: '/bulk-sms', icon: 'MessageSquare' },
  { section: 'ENQUIRIES' },
  { label: 'All Enquiries', path: '/enquiries', icon: 'ClipboardList' },
  { label: 'Add Enquiry', path: '/enquiries/add', icon: 'FilePlus' },
  { section: 'MANAGE' },
  { label: 'Courses', path: '/courses', icon: 'BookOpen' },
  { label: 'Schemes', path: '/schemes', icon: 'Tag' },
  { label: 'Batches', path: '/batches', icon: 'Clock' },
  { label: 'Export Data', path: '/export', icon: 'Download' },
  { section: 'SYSTEM' },
  { label: 'Settings', path: '/settings', icon: 'Settings' },
  { label: 'Subscription', path: '/subscription', icon: 'CreditCard' },
  { label: 'Reports', path: '/reports', icon: 'BarChart' },
  { label: 'Backup & Restore', path: '/backup', icon: 'Database' },
];
