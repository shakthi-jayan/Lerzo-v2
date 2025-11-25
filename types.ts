
export enum FeeStatus {
  PAID = 'Fully Paid',
  PARTIAL = 'Partially Paid',
  UNPAID = 'Unpaid'
}

export enum EnquiryStatus {
  ACTIVE = 'Active',
  CONVERTED = 'Converted',
  CLOSED = 'Closed'
}

export interface CentreSettings {
  name: string;
  email: string;
  phone: string;
  address1: string;
  city: string;
  pincode: string;
  directorSignatureUrl?: string;
  whatsappProvider?: 'click-to-chat' | 'twilio';
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioWhatsAppNumber?: string;
}

export interface Student {
  id: string;
  enrollmentNo: string;
  name: string;
  fathersName?: string;
  sex?: string;
  dob?: string;
  age?: number;
  address1?: string;
  address2?: string;
  city?: string;
  pincode?: string;
  course: string;
  batch: string;
  scheme?: string;
  mobile: string;
  mobile2?: string;
  qualification?: string;
  feeStatus: FeeStatus;
  totalFee: number; // Gross Fee
  concession?: number;
  paidFee: number;
  balance: number;
  joinDate: string;
  ownerEmail?: string;
  email?: string;
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  method: string;
  receiptNo?: string;
  notes?: string;
  ownerEmail?: string;
}

export interface Enquiry {
  id: string;
  name: string;
  courseInterested: string;
  mobile: string;
  qualification: string;
  status: EnquiryStatus;
  addedOn: string;
  fathersName?: string;
  sex?: string;
  mobile2?: string;
  address1?: string;
  address2?: string;
  city?: string;
  pincode?: string;
  employmentStatus?: string;
  scheme?: string;
  reason?: string;
  joiningPlan?: string;
  source?: string;
  ownerEmail?: string;
  email?: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  duration: number;
  fees: number;
  status: 'Active' | 'Inactive';
  studentsEnrolled: number;
  ownerEmail?: string;
}

export interface Batch {
  id: string;
  name: string;
  timing: string;
  startTime: string;
  endTime: string;
  status: 'Active' | 'Inactive';
  studentsEnrolled: number;
  staffId?: string;
  ownerEmail?: string;
}

export interface Scheme {
  id: string;
  name: string;
  description: string;
  discountPercent: number;
  ownerEmail?: string;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Failed';
  pdfUrl: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalEnquiries: number;
  feesCollected: number;
  pendingFees: number;
  unpaidStudents: number;
  partialStudents: number;
  fullyPaidStudents: number;
}

export interface Attendance {
  id: string;
  date: string;
  studentId: string;
  batchId?: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  ownerEmail?: string;
}

export interface Staff {
  id: string;
  staffId: string;
  name: string;
  designation: string;
  mobile: string;
  email: string;
  joiningDate: string;
  status: 'Active' | 'Inactive';
  specialization?: string;
  ownerEmail?: string;
}

export interface StaffAttendance {
  id: string;
  date: string;
  staffId: string;
  status: 'Present' | 'Absent' | 'Leave';
  ownerEmail?: string;
}
