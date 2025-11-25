import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, UserPlus, User, Phone, BookOpen, Save } from 'lucide-react';
import { useData } from '../context/DataContext';
import { FeeStatus } from '../types';
import { AlertModal, AlertType } from '../components/AlertModal';

export const AddStudent = () => {
  const { addStudent, updateStudent, getStudent, convertEnquiryToStudent, recordPayment, enquiries, courses, batches, schemes, students, staff } = useData();
  const navigate = useNavigate();
  const { id } = useParams(); // For Edit Mode
  const [searchParams] = useSearchParams();
  const enquiryId = searchParams.get('enquiryId'); // For Conversion Mode

  const [formData, setFormData] = useState({
    enrollmentNo: '',
    name: '',
    fathersName: '',
    sex: 'Select',
    age: '',
    dob: '',
    joinDate: new Date().toISOString().split('T')[0],
    mobile: '',
    mobile2: '',
    email: '',
    address1: '',
    address2: '',
    city: '',
    pincode: '',
    qualification: '',
    course: '',
    batch: '',
    scheme: '',
    totalFee: '',
    concession: '',
    paidFee: '',
    receiptNo: '',
    paymentMethod: 'CASH'
  });

  const [selectedStaff, setSelectedStaff] = useState('');

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
    if (alertState.type === 'success') {
      navigate('/students');
    }
  };

  // Load data if in Edit Mode or Conversion Mode
  useEffect(() => {
    if (id) {
      // Edit Mode
      const student = getStudent(id);
      if (student) {
        setFormData({
          enrollmentNo: student.enrollmentNo,
          name: student.name,
          fathersName: student.fathersName || '',
          sex: student.sex || 'Select',
          age: student.age?.toString() || '',
          dob: student.dob || '',
          joinDate: student.joinDate,
          mobile: student.mobile,
          mobile2: student.mobile2 || '',
          email: student.email || '',
          address1: student.address1 || '',
          address2: student.address2 || '',
          city: student.city || '',
          pincode: student.pincode || '',
          qualification: student.qualification || '',
          course: student.course,
          batch: student.batch,
          scheme: student.scheme || '',
          totalFee: student.totalFee.toString(),
          concession: student.concession?.toString() || '',
          paidFee: student.paidFee.toString(),
          receiptNo: '',
          paymentMethod: 'CASH'
        });
      }
    } else if (enquiryId) {
      // Conversion Mode
      const enquiry = enquiries.find(e => e.id === enquiryId);
      if (enquiry) {
        setFormData(prev => ({
          ...prev,
          name: enquiry.name,
          fathersName: enquiry.fathersName || '',
          sex: enquiry.sex || 'Select',
          mobile: enquiry.mobile,
          mobile2: enquiry.mobile2 || '',
          email: enquiry.email || '',
          address1: enquiry.address1 || '',
          address2: enquiry.address2 || '',
          city: enquiry.city || '',
          pincode: enquiry.pincode || '',
          qualification: enquiry.qualification || '',
          course: enquiry.courseInterested || '',
          scheme: enquiry.scheme || ''
        }));
      }
    }
  }, [id, enquiryId, getStudent, enquiries]);

  // Update selectedStaff when batch changes (e.g. in Edit mode)
  useEffect(() => {
    if (formData.batch) {
      const batch = batches.find(b => b.name === formData.batch);
      if (batch && batch.staffId) {
        setSelectedStaff(batch.staffId);
      }
    }
  }, [formData.batch, batches]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // Force Uppercase for text inputs, except dates or specific fields if needed
    const newValue = (type === 'text' || type === 'textarea') ? value.toUpperCase() : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async () => {
    // Basic Validation
    if (!formData.name || !formData.mobile || !formData.course) {
      showAlert("Missing Information", "Please fill in required fields (Name, Mobile, Course)", "error");
      return;
    }

    // Check for duplicate Enrollment Number (only for new students or if enrollment no changed)
    if (formData.enrollmentNo) {
      const existingStudent = students.find(s => s.enrollmentNo === formData.enrollmentNo && s.id !== id);
      if (existingStudent) {
        showAlert("Duplicate Enrollment Number", `Enrollment Number '${formData.enrollmentNo}' already exists for student '${existingStudent.name}'.`, "error");
        return;
      }
    }

    const totalFeeNum = Number(formData.totalFee) || 0;
    const concessionNum = Number(formData.concession) || 0;
    const paidFeeNum = Number(formData.paidFee) || 0;
    const netFeeNum = totalFeeNum - concessionNum;

    if (id) {
      // Edit Mode
      const studentData = {
        id: id,
        enrollmentNo: formData.enrollmentNo,
        name: formData.name,
        fathersName: formData.fathersName,
        sex: formData.sex,
        age: Number(formData.age) || 0,
        dob: formData.dob,
        address1: formData.address1,
        address2: formData.address2,
        city: formData.city,
        pincode: formData.pincode,
        course: formData.course,
        batch: formData.batch,
        scheme: formData.scheme,
        qualification: formData.qualification,
        mobile: formData.mobile,
        mobile2: formData.mobile2,
        email: formData.email,
        feeStatus: paidFeeNum >= netFeeNum && netFeeNum > 0 ? FeeStatus.PAID : paidFeeNum > 0 ? FeeStatus.PARTIAL : FeeStatus.UNPAID,
        totalFee: totalFeeNum,
        paidFee: paidFeeNum,
        balance: netFeeNum - paidFeeNum,
        joinDate: formData.joinDate,
        concession: concessionNum
      };
      updateStudent(id, studentData);
      showAlert("Success", "Student updated successfully!", "success");
    } else {
      // New Student
      // Create student with 0 paid fee initially, then record payment
      const newStudentId = Date.now().toString();
      const studentData = {
        id: newStudentId,
        enrollmentNo: formData.enrollmentNo || `LER-${Math.floor(Math.random() * 10000)}`,
        name: formData.name,
        fathersName: formData.fathersName,
        sex: formData.sex,
        age: Number(formData.age) || 0,
        dob: formData.dob,
        address1: formData.address1,
        address2: formData.address2,
        city: formData.city,
        pincode: formData.pincode,
        course: formData.course,
        batch: formData.batch,
        scheme: formData.scheme,
        qualification: formData.qualification,
        mobile: formData.mobile,
        mobile2: formData.mobile2,
        email: formData.email,
        feeStatus: paidFeeNum >= netFeeNum && netFeeNum > 0 ? FeeStatus.PAID : paidFeeNum > 0 ? FeeStatus.PARTIAL : FeeStatus.UNPAID,
        totalFee: totalFeeNum,
        paidFee: paidFeeNum,
        balance: netFeeNum - paidFeeNum,
        joinDate: formData.joinDate,
        concession: concessionNum
      };

      await addStudent(studentData);

      // Record Initial Payment if applicable
      if (paidFeeNum > 0) {
        const paymentData = {
          id: `PAY${Date.now()}`,
          studentId: newStudentId,
          amount: paidFeeNum,
          date: formData.joinDate,
          method: formData.paymentMethod,
          receiptNo: formData.receiptNo,
          notes: 'Initial Admission Payment'
        };
        await recordPayment(paymentData);
      }

      if (enquiryId) {
        await convertEnquiryToStudent(enquiryId); // Mark enquiry as converted
      }
      showAlert("Success", "Student added successfully!", "success");
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
          <UserPlus className="w-8 h-8 text-slate-800 dark:text-slate-100" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{id ? 'Edit Student' : 'Add Student'}</h1>
        </div>
        <Link to="/students" className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Students
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <div className="p-6 space-y-8">

          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-700">
              <User className="w-5 h-5" />
              <h2 className="text-lg font-medium">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Enrollment Number</label>
                <input name="enrollmentNo" value={formData.enrollmentNo} onChange={handleChange} type="text" placeholder="Auto-generated if empty" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm bg-slate-50 dark:bg-slate-900 dark:text-slate-200 border focus:ring-blue-500 focus:border-blue-500 uppercase" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Name</label>
                <input name="name" value={formData.name} onChange={handleChange} type="text" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200 uppercase" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Father's Name</label>
                <input name="fathersName" value={formData.fathersName} onChange={handleChange} type="text" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200 uppercase" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Sex</label>
                <select name="sex" value={formData.sex} onChange={handleChange} className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200 uppercase">
                  <option>Select</option>
                  <option>MALE</option>
                  <option>FEMALE</option>
                  <option>OTHER</option>
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Age</label>
                <input name="age" value={formData.age} onChange={handleChange} type="number" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
                <input name="dob" value={formData.dob} onChange={handleChange} type="date" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Date of Joining</label>
                <input name="joinDate" value={formData.joinDate} onChange={handleChange} type="date" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200" />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-700">
              <Phone className="w-5 h-5" />
              <h2 className="text-lg font-medium">Contact Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile 1</label>
                <input name="mobile" value={formData.mobile} onChange={handleChange} type="tel" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile 2</label>
                <input name="mobile2" value={formData.mobile2} onChange={handleChange} type="tel" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input name="email" value={formData.email} onChange={handleChange} type="email" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Address Line 1</label>
                <input name="address1" value={formData.address1} onChange={handleChange} type="text" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200 uppercase" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Address Line 2</label>
                <input name="address2" value={formData.address2} onChange={handleChange} type="text" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200 uppercase" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">City</label>
                <input name="city" value={formData.city} onChange={handleChange} type="text" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200 uppercase" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pincode</label>
                <input name="pincode" value={formData.pincode} onChange={handleChange} type="text" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200" />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-700">
              <BookOpen className="w-5 h-5" />
              <h2 className="text-lg font-medium">Academic Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Qualification</label>
                <input name="qualification" value={formData.qualification} onChange={handleChange} type="text" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200 uppercase" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Course</label>
                <select name="course" value={formData.course} onChange={handleChange} className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200 uppercase">
                  <option value="">Select Course</option>
                  {courses.filter(c => c.status === 'Active').map(course => (
                    <option key={course.id} value={course.name}>{course.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Staff (Filter Batch)</label>
                <select
                  value={selectedStaff}
                  onChange={(e) => {
                    setSelectedStaff(e.target.value);
                    setFormData(prev => ({ ...prev, batch: '' })); // Reset batch when staff changes
                  }}
                  className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="">All Staff</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Batch</label>
                <select name="batch" value={formData.batch} onChange={handleChange} className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200 uppercase">
                  <option value="">Select Batch</option>
                  {batches
                    .filter(b => b.status === 'Active')
                    .filter(b => !selectedStaff || b.staffId === selectedStaff)
                    .map(batch => (
                      <option key={batch.id} value={batch.name}>{batch.name} ({batch.timing})</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Scheme</label>
                <select name="scheme" value={formData.scheme} onChange={handleChange} className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200 uppercase">
                  <option value="">Select Scheme</option>
                  {schemes.map(scheme => (
                    <option key={scheme.id} value={scheme.name}>{scheme.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Total Fees</label>
                <input name="totalFee" value={formData.totalFee} onChange={handleChange} type="number" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Concession (₹)</label>
                <input name="concession" value={formData.concession} onChange={handleChange} type="number" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Payment (Paid)</label>
                <input name="paidFee" value={formData.paidFee} onChange={handleChange} type="number" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Net Payable</label>
                <input type="text" value={`₹ ${Number(formData.totalFee) - Number(formData.concession) - Number(formData.paidFee)}`} readOnly className="w-full border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md p-2.5 text-sm border font-bold" />
              </div>
            </div>
          </div>

          {/* Payment Details for New Students */}
          {!id && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-700">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200 uppercase">
                  <option value="CASH">CASH</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">CARD</option>
                  <option value="BANK TRANSFER">BANK TRANSFER</option>
                  <option value="CHEQUE">CHEQUE</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Receipt Number</label>
                <input name="receiptNo" value={formData.receiptNo} onChange={handleChange} type="text" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200 uppercase" placeholder="Enter Receipt No" />
              </div>
            </div>
          )}
        </div>



        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
          <Link to="/students" className="px-6 py-2.5 rounded-md border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-white dark:hover:bg-slate-800 transition-colors">Cancel</Link>
          <button onClick={handleSubmit} className="px-6 py-2.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-2">
            <Save className="w-4 h-4" /> {id ? 'Update Student' : 'Save Student'}
          </button>
        </div>
      </motion.div>

      <AlertModal
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />
    </motion.div >
  );
};
