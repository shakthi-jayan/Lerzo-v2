import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Student, Enquiry, FeeStatus, EnquiryStatus, Payment, Course, Batch, Scheme, CentreSettings, Attendance, Staff, StaffAttendance } from '../types';

interface DataContextType {
  students: Student[];
  enquiries: Enquiry[];
  payments: Payment[];
  courses: Course[];
  batches: Batch[];
  schemes: Scheme[];
  attendance: Attendance[];
  staff: Staff[];
  staffAttendance: StaffAttendance[];
  loading: boolean;
  logoUrl: string | null;
  centreSettings: CentreSettings;

  addStudent: (student: Student) => Promise<void>;
  updateStudent: (id: string, updatedStudent: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;

  addEnquiry: (enquiry: Enquiry) => Promise<void>;
  updateEnquiry: (id: string, updatedEnquiry: Partial<Enquiry>) => Promise<void>;
  deleteEnquiry: (id: string) => Promise<void>;
  convertEnquiryToStudent: (enquiryId: string) => Promise<Enquiry | undefined>;

  addCourse: (course: Course) => Promise<void>;
  updateCourse: (id: string, updatedCourse: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;

  addBatch: (batch: Batch) => Promise<void>;
  updateBatch: (id: string, updatedBatch: Partial<Batch>) => Promise<void>;
  deleteBatch: (id: string) => Promise<void>;

  addScheme: (scheme: Scheme) => Promise<void>;
  updateScheme: (id: string, updatedScheme: Partial<Scheme>) => Promise<void>;
  deleteScheme: (id: string) => Promise<void>;

  addStaff: (staff: Staff) => Promise<void>;
  updateStaff: (id: string, updatedStaff: Partial<Staff>) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;

  getStudent: (id: string) => Student | undefined;
  getEnquiry: (id: string) => Enquiry | undefined;
  getCourse: (id: string) => Course | undefined;
  getBatch: (id: string) => Batch | undefined;
  getScheme: (id: string) => Scheme | undefined;
  getStaff: (id: string) => Staff | undefined;

  recordPayment: (payment: Payment) => Promise<void>;
  getStudentPayments: (studentId: string) => Payment[];

  markAttendance: (attendance: Attendance) => Promise<void>;
  getAttendance: (studentId: string) => Attendance[];

  markStaffAttendance: (attendance: StaffAttendance) => Promise<void>;
  getStaffAttendance: (staffId: string) => StaffAttendance[];

  restoreData: (data: any) => Promise<void>;
  updateLogo: (file: File) => Promise<void>;
  updateCentreSettings: (settings: CentreSettings) => Promise<void>;

  currentUserEmail: string | null;
  error: string | null;

  // Auth Simulation helpers
  sendOtp: (email: string) => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  logout: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DEFAULT_SETTINGS: CentreSettings = {
  name: "Lerzo",
  email: "admin@lerzo.com",
  phone: "9876543210",
  address1: "M.A Nagar, Redhills",
  city: "Chennai",
  pincode: "600052"
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [staffAttendance, setStaffAttendance] = useState<StaffAttendance[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [centreSettings, setCentreSettings] = useState<CentreSettings>(DEFAULT_SETTINGS);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(localStorage.getItem('userEmail'));
  const [error, setError] = useState<string | null>(null);

  // Fetch Data from Supabase
  const fetchData = async () => {
    setError(null);
    if (!currentUserEmail) {
      setStudents([]);
      setEnquiries([]);
      setCourses([]);
      setBatches([]);
      setSchemes([]);
      setPayments([]);
      setAttendance([]);
      setStaffAttendance([]);
      setStaff([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data: studentsData, error: studentsError } = await supabase.from('students').select('*').eq('ownerEmail', currentUserEmail);
      if (studentsError) throw studentsError;
      if (studentsData) setStudents(studentsData as Student[]);

      const { data: enquiriesData, error: enquiriesError } = await supabase.from('enquiries').select('*').eq('ownerEmail', currentUserEmail);
      if (enquiriesError) throw enquiriesError;
      if (enquiriesData) setEnquiries(enquiriesData as Enquiry[]);

      const { data: coursesData, error: coursesError } = await supabase.from('courses').select('*').eq('ownerEmail', currentUserEmail);
      if (coursesError) throw coursesError;
      if (coursesData) setCourses(coursesData as Course[]);

      const { data: batchesData, error: batchesError } = await supabase.from('batches').select('*').eq('ownerEmail', currentUserEmail);
      if (batchesError) throw batchesError;
      if (batchesData) setBatches(batchesData as Batch[]);

      const { data: schemesData, error: schemesError } = await supabase.from('schemes').select('*').eq('ownerEmail', currentUserEmail);
      if (schemesError) throw schemesError;
      if (schemesData) setSchemes(schemesData as Scheme[]);

      const { data: paymentsData, error: paymentsError } = await supabase.from('payments').select('*').eq('ownerEmail', currentUserEmail);
      if (paymentsError) throw paymentsError;
      if (paymentsData) setPayments(paymentsData as Payment[]);

      const { data: attendanceData, error: attendanceError } = await supabase.from('attendance').select('*').eq('ownerEmail', currentUserEmail);
      if (attendanceError) throw attendanceError;
      if (attendanceData) setAttendance(attendanceData as Attendance[]);

      const { data: staffAttendanceData, error: staffAttendanceError } = await supabase.from('staff_attendance').select('*').eq('ownerEmail', currentUserEmail);
      if (staffAttendanceError) throw staffAttendanceError;
      if (staffAttendanceData) setStaffAttendance(staffAttendanceData as StaffAttendance[]);

      const { data: staffData, error: staffError } = await supabase.from('staff').select('*').eq('ownerEmail', currentUserEmail);
      if (staffError) throw staffError;
      if (staffData) setStaff(staffData as Staff[]);

      // Fetch Settings
      const { data: settingsData, error: settingsError } = await supabase.from('settings').select('*').eq('ownerEmail', currentUserEmail).maybeSingle();
      if (settingsError) throw settingsError;

      if (settingsData) {
        setLogoUrl(settingsData.logoUrl || null);
        setCentreSettings({
          name: settingsData.name || DEFAULT_SETTINGS.name,
          email: settingsData.email || DEFAULT_SETTINGS.email,
          phone: settingsData.phone || DEFAULT_SETTINGS.phone,
          address1: settingsData.address1 || DEFAULT_SETTINGS.address1,
          city: settingsData.city || DEFAULT_SETTINGS.city,
          pincode: settingsData.pincode || DEFAULT_SETTINGS.pincode,
          whatsappProvider: settingsData.whatsappProvider || 'click-to-chat',
          twilioAccountSid: settingsData.twilioAccountSid,
          twilioAuthToken: settingsData.twilioAuthToken,
          twilioWhatsAppNumber: settingsData.twilioWhatsAppNumber
        });
      } else {
        setCentreSettings(DEFAULT_SETTINGS);
        setLogoUrl(null);
      }
    } catch (error: any) {
      console.error("Error fetching data:", error);
      setError(error.message || "Failed to connect to database. Please check your internet connection or if the project is paused.");
    } finally {
      setLoading(false);
    }
  };

  // --- Student Actions ---
  const addStudent = async (student: Student) => {
    if (!currentUserEmail) return;
    const newStudent = { ...student, ownerEmail: currentUserEmail };
    const { error } = await supabase.from('students').insert(newStudent);
    if (!error) setStudents(prev => [...prev, newStudent]);
    else console.error("Error adding student:", error);
  };

  const updateStudent = async (id: string, updatedStudent: Partial<Student>) => {
    const { error } = await supabase.from('students').update(updatedStudent).eq('id', id);
    if (!error) {
      setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updatedStudent } : s));
    } else console.error("Error updating student:", error);
  };

  const deleteStudent = async (id: string) => {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (!error) {
      setStudents(prev => prev.filter(s => s.id !== id));
      // Cascade delete payments locally
      setPayments(prev => prev.filter(p => p.studentId !== id));
    } else console.error("Error deleting student:", error);
  };

  const getStudent = (id: string) => students.find(s => s.id === id);

  // --- Enquiry Actions ---
  const addEnquiry = async (enquiry: Enquiry) => {
    if (!currentUserEmail) return;
    const newEnquiry = { ...enquiry, ownerEmail: currentUserEmail };
    const { error } = await supabase.from('enquiries').insert(newEnquiry);
    if (!error) setEnquiries(prev => [...prev, newEnquiry]);
    else console.error("Error adding enquiry:", error);
  };

  const updateEnquiry = async (id: string, updatedEnquiry: Partial<Enquiry>) => {
    const { error } = await supabase.from('enquiries').update(updatedEnquiry).eq('id', id);
    if (!error) {
      setEnquiries(prev => prev.map(e => e.id === id ? { ...e, ...updatedEnquiry } : e));
    } else console.error("Error updating enquiry:", error);
  };

  const deleteEnquiry = async (id: string) => {
    const { error } = await supabase.from('enquiries').delete().eq('id', id);
    if (!error) setEnquiries(prev => prev.filter(e => e.id !== id));
    else console.error("Error deleting enquiry:", error);
  };

  const getEnquiry = (id: string) => enquiries.find(e => e.id === id);

  const convertEnquiryToStudent = async (enquiryId: string) => {
    const enquiry = enquiries.find((e) => e.id === enquiryId);
    if (enquiry) {
      await updateEnquiry(enquiryId, { status: EnquiryStatus.CONVERTED });
      return enquiry;
    }
    return undefined;
  };

  // --- Payment Actions ---
  const recordPayment = async (payment: Payment) => {
    if (!currentUserEmail) return;
    const newPayment = { ...payment, ownerEmail: currentUserEmail };

    const { error } = await supabase.from('payments').insert(newPayment);
    if (error) {
      console.error("Error recording payment:", error);
      return;
    }

    setPayments(prev => [...prev, newPayment]);

    const student = students.find(s => s.id === payment.studentId);
    if (student) {
      const newPaid = (student.paidFee || 0) + Number(payment.amount);
      const netFee = (student.totalFee || 0) - (student.concession || 0);
      const newBalance = netFee - newPaid;

      let newStatus = FeeStatus.UNPAID;
      if (newPaid >= netFee) newStatus = FeeStatus.PAID;
      else if (newPaid > 0) newStatus = FeeStatus.PARTIAL;

      await updateStudent(student.id, {
        paidFee: newPaid,
        balance: newBalance,
        feeStatus: newStatus
      });
    }
  };

  const getStudentPayments = (studentId: string) => {
    return payments.filter(p => p.studentId === studentId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // --- Attendance Actions ---
  const markAttendance = async (record: Attendance) => {
    if (!currentUserEmail) return;

    // Check if record exists for this student and date (update if so)
    const existing = attendance.find(a => a.studentId === record.studentId && a.date === record.date);

    if (existing) {
      const { error } = await supabase.from('attendance').update({ status: record.status }).eq('id', existing.id);
      if (!error) {
        setAttendance(prev => prev.map(a => a.id === existing.id ? { ...a, status: record.status } : a));
      } else {
        console.error("Error updating attendance:", error);
        throw error;
      }
    } else {
      const newRecord = { ...record, ownerEmail: currentUserEmail };
      const { error } = await supabase.from('attendance').insert(newRecord);
      if (!error) {
        setAttendance(prev => [...prev, newRecord]);
      } else {
        console.error("Error marking attendance:", error);
        throw error;
      }
    }
  };

  const getAttendance = (studentId: string) => {
    return attendance.filter(a => a.studentId === studentId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // --- Staff Attendance Actions ---
  const markStaffAttendance = async (record: StaffAttendance) => {
    if (!currentUserEmail) return;

    const existing = staffAttendance.find(a => a.staffId === record.staffId && a.date === record.date);

    if (existing) {
      const { error } = await supabase.from('staff_attendance').update({ status: record.status }).eq('id', existing.id);
      if (!error) {
        setStaffAttendance(prev => prev.map(a => a.id === existing.id ? { ...a, status: record.status } : a));
      } else {
        console.error("Error updating staff attendance:", error);
        throw error;
      }
    } else {
      const newRecord = { ...record, ownerEmail: currentUserEmail };
      const { error } = await supabase.from('staff_attendance').insert(newRecord);
      if (!error) {
        setStaffAttendance(prev => [...prev, newRecord]);
      } else {
        console.error("Error marking staff attendance:", error);
        throw error;
      }
    }
  };

  const getStaffAttendance = (staffId: string) => {
    return staffAttendance.filter(a => a.staffId === staffId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // --- Course Actions ---
  const addCourse = async (course: Course) => {
    if (!currentUserEmail) return;
    const newCourse = { ...course, ownerEmail: currentUserEmail };
    const { error } = await supabase.from('courses').insert(newCourse);
    if (!error) setCourses(prev => [...prev, newCourse]);
    else console.error("Error adding course:", error);
  };
  const updateCourse = async (id: string, updatedCourse: Partial<Course>) => {
    const { error } = await supabase.from('courses').update(updatedCourse).eq('id', id);
    if (!error) setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updatedCourse } : c));
    else console.error("Error updating course:", error);
  };
  const deleteCourse = async (id: string) => {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (!error) setCourses(prev => prev.filter(c => c.id !== id));
    else console.error("Error deleting course:", error);
  };
  const getCourse = (id: string) => courses.find(c => c.id === id);

  // --- Batch Actions ---
  const addBatch = async (batch: Batch) => {
    if (!currentUserEmail) return;
    const newBatch = { ...batch, ownerEmail: currentUserEmail };
    const { error } = await supabase.from('batches').insert(newBatch);
    if (!error) setBatches(prev => [...prev, newBatch]);
    else console.error("Error adding batch:", error);
  };
  const updateBatch = async (id: string, updatedBatch: Partial<Batch>) => {
    const { error } = await supabase.from('batches').update(updatedBatch).eq('id', id);
    if (!error) setBatches(prev => prev.map(b => b.id === id ? { ...b, ...updatedBatch } : b));
    else console.error("Error updating batch:", error);
  };
  const deleteBatch = async (id: string) => {
    const { error } = await supabase.from('batches').delete().eq('id', id);
    if (!error) setBatches(prev => prev.filter(b => b.id !== id));
    else console.error("Error deleting batch:", error);
  };
  const getBatch = (id: string) => batches.find(b => b.id === id);

  // --- Scheme Actions ---
  const addScheme = async (scheme: Scheme) => {
    if (!currentUserEmail) return;
    const newScheme = { ...scheme, ownerEmail: currentUserEmail };
    const { error } = await supabase.from('schemes').insert(newScheme);
    if (!error) setSchemes(prev => [...prev, newScheme]);
    else console.error("Error adding scheme:", error);
  };
  const updateScheme = async (id: string, updatedScheme: Partial<Scheme>) => {
    const { error } = await supabase.from('schemes').update(updatedScheme).eq('id', id);
    if (!error) setSchemes(prev => prev.map(s => s.id === id ? { ...s, ...updatedScheme } : s));
    else console.error("Error updating scheme:", error);
  };
  const deleteScheme = async (id: string) => {
    const { error } = await supabase.from('schemes').delete().eq('id', id);
    if (!error) setSchemes(prev => prev.filter(s => s.id !== id));
    else console.error("Error deleting scheme:", error);
  };
  const getScheme = (id: string) => schemes.find(s => s.id === id);

  // --- Staff Actions ---
  const addStaff = async (newStaff: Staff) => {
    if (!currentUserEmail) return;
    const staffMember = { ...newStaff, ownerEmail: currentUserEmail };
    const { error } = await supabase.from('staff').insert(staffMember);
    if (!error) setStaff(prev => [...prev, staffMember]);
    else console.error("Error adding staff:", error);
  };
  const updateStaff = async (id: string, updatedStaff: Partial<Staff>) => {
    const { error } = await supabase.from('staff').update(updatedStaff).eq('id', id);
    if (!error) setStaff(prev => prev.map(s => s.id === id ? { ...s, ...updatedStaff } : s));
    else console.error("Error updating staff:", error);
  };
  const deleteStaff = async (id: string) => {
    const { error } = await supabase.from('staff').delete().eq('id', id);
    if (!error) setStaff(prev => prev.filter(s => s.id !== id));
    else console.error("Error deleting staff:", error);
  };
  const getStaff = (id: string) => staff.find(s => s.id === id);

  // --- Restore Action ---
  const restoreData = async (data: any) => {
    // This is complex in Supabase as we need to insert many rows.
    // For now, we'll implement a basic loop.
    if (!currentUserEmail) return;

    try {
      if (data.students) await supabase.from('students').upsert(data.students.map((s: any) => ({ ...s, ownerEmail: currentUserEmail })));
      if (data.enquiries) await supabase.from('enquiries').upsert(data.enquiries.map((e: any) => ({ ...e, ownerEmail: currentUserEmail })));
      if (data.payments) await supabase.from('payments').upsert(data.payments.map((p: any) => ({ ...p, ownerEmail: currentUserEmail })));
      if (data.attendance) await supabase.from('attendance').upsert(data.attendance.map((a: any) => ({ ...a, ownerEmail: currentUserEmail })));
      if (data.courses) await supabase.from('courses').upsert(data.courses.map((c: any) => ({ ...c, ownerEmail: currentUserEmail })));
      if (data.batches) await supabase.from('batches').upsert(data.batches.map((b: any) => ({ ...b, ownerEmail: currentUserEmail })));
      if (data.schemes) await supabase.from('schemes').upsert(data.schemes.map((s: any) => ({ ...s, ownerEmail: currentUserEmail })));
      if (data.staff) await supabase.from('staff').upsert(data.staff.map((s: any) => ({ ...s, ownerEmail: currentUserEmail })));
      if (data.staffAttendance) await supabase.from('staff_attendance').upsert(data.staffAttendance.map((s: any) => ({ ...s, ownerEmail: currentUserEmail })));

      // Refresh data
      fetchData();
    } catch (error) {
      console.error("Error restoring data:", error);
    }
  };

  // --- Settings Actions ---
  const updateLogo = async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      if (file.size > 800 * 1024) {
        reject(new Error("File size is too large. Please choose an image under 800KB."));
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          if (currentUserEmail) {
            // Check if settings exist
            const { data: existing } = await supabase.from('settings').select('id').eq('ownerEmail', currentUserEmail).maybeSingle();

            if (existing) {
              await supabase.from('settings').update({ logoUrl: base64 }).eq('ownerEmail', currentUserEmail);
            } else {
              await supabase.from('settings').insert({ ownerEmail: currentUserEmail, logoUrl: base64 });
            }
            setLogoUrl(base64);
          }
          resolve();
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const updateCentreSettings = async (settings: CentreSettings) => {
    if (!currentUserEmail) return;

    const { data: existing } = await supabase.from('settings').select('id').eq('ownerEmail', currentUserEmail).maybeSingle();

    if (existing) {
      await supabase.from('settings').update(settings).eq('ownerEmail', currentUserEmail);
    } else {
      await supabase.from('settings').insert({ ...settings, ownerEmail: currentUserEmail });
    }
    setCentreSettings(settings);
  };

  // --- Real Supabase Auth ---

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserEmail(session?.user?.email ?? null);
      if (session?.user?.email) fetchData();
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUserEmail(session?.user?.email ?? null);
      if (session?.user?.email) {
        localStorage.setItem('userEmail', session.user.email);
        localStorage.setItem('isAuthenticated', 'true');
      } else {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('isAuthenticated');
        setStudents([]);
        setEnquiries([]);
        setCourses([]);
        setBatches([]);
        setSchemes([]);
        setPayments([]);
        setAttendance([]);
        setStaffAttendance([]);
        setStaff([]);
        setLogoUrl(null);
        setCentreSettings(DEFAULT_SETTINGS);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Trigger data fetch when user changes
  useEffect(() => {
    if (currentUserEmail) {
      fetchData();
    }
  }, [currentUserEmail]);

  const sendOtp = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) {
        console.error("Error sending OTP:", error.message);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Unexpected error sending OTP:", error);
      return false;
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (error) {
        console.error("Error verifying OTP:", error.message);
        return false;
      }

      if (!data.session) {
        console.error("Verification successful but no session created.");
        return false;
      }

      return true;
    } catch (error: any) {
      console.error("Unexpected error verifying OTP:", error.message || error);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUserEmail(null);
  };

  return (
    <DataContext.Provider
      value={{
        students, enquiries, payments, courses, batches, schemes, staff, loading,
        logoUrl, centreSettings,
        addStudent, updateStudent, deleteStudent, getStudent,
        addEnquiry, updateEnquiry, deleteEnquiry, getEnquiry, convertEnquiryToStudent,
        addCourse, updateCourse, deleteCourse, getCourse,
        addBatch, updateBatch, deleteBatch, getBatch,
        addScheme, updateScheme, deleteScheme, getScheme,
        addStaff, updateStaff, deleteStaff, getStaff,
        recordPayment, getStudentPayments,
        attendance, markAttendance, getAttendance,
        staffAttendance, markStaffAttendance, getStaffAttendance,
        restoreData, updateLogo, updateCentreSettings,
        currentUserEmail, error,
        sendOtp, verifyOtp, logout
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
