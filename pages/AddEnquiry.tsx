import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UserPlus, User, Phone, GraduationCap, Save } from 'lucide-react';
import { useData } from '../context/DataContext';
import { EnquiryStatus } from '../types';
import { AlertModal, AlertType } from '../components/AlertModal';

export const AddEnquiry = () => {
  const { addEnquiry, updateEnquiry, getEnquiry, courses, schemes } = useData();
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: '',
    fathersName: '',
    sex: 'Select',
    mobile: '',
    mobile2: '',
    email: '',
    address1: '',
    address2: '',
    city: '',
    pincode: '',
    employmentStatus: '',
    qualification: '',
    courseInterested: '',
    scheme: '',
    reason: '',
    joiningPlan: '',
    source: ''
  });

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
      navigate('/enquiries');
    }
  };

  useEffect(() => {
    if (id) {
      const enquiry = getEnquiry(id);
      if (enquiry) {
        setFormData({
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
          employmentStatus: enquiry.employmentStatus || '',
          qualification: enquiry.qualification || '',
          courseInterested: enquiry.courseInterested || '',
          scheme: enquiry.scheme || '',
          reason: enquiry.reason || '',
          joiningPlan: enquiry.joiningPlan || '',
          source: enquiry.source || ''
        });
      }
    }
  }, [id, getEnquiry]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = (type === 'text' || e.target.tagName === 'TEXTAREA') ? value.toUpperCase() : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.mobile) {
      showAlert("Missing Information", "Name and Mobile are required!", "error");
      return;
    }

    const enquiryData = {
      id: id || Date.now().toString(),
      name: formData.name,
      fathersName: formData.fathersName,
      sex: formData.sex,
      mobile: formData.mobile,
      mobile2: formData.mobile2,
      email: formData.email,
      address1: formData.address1,
      address2: formData.address2,
      city: formData.city,
      pincode: formData.pincode,
      employmentStatus: formData.employmentStatus,
      qualification: formData.qualification,
      courseInterested: formData.courseInterested,
      scheme: formData.scheme,
      reason: formData.reason,
      joiningPlan: formData.joiningPlan,
      source: formData.source,
      status: EnquiryStatus.ACTIVE,
      addedOn: new Date().toISOString().split('T')[0]
    };

    if (id) {
      await updateEnquiry(id, enquiryData);
      showAlert("Success", "Enquiry updated successfully!", "success");
    } else {
      await addEnquiry(enquiryData);
      showAlert("Success", "Enquiry added successfully!", "success");
    }
  };

  const handleConvert = () => {
    if (id) {
      navigate(`/students/add?enquiryId=${id}`);
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
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{id ? 'Edit Enquiry' : 'Add Enquiry'}</h1>
        </div>
        <div className="flex items-center gap-3">
          {id && (
            <button onClick={handleConvert} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 shadow-sm font-medium text-sm">
              <UserPlus className="w-4 h-4" /> Convert to Student
            </button>
          )}
          <Link to="/enquiries" className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Enquiries
          </Link>
        </div>
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
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Name</label>
                <input name="name" value={formData.name} onChange={handleChange} type="text" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200 uppercase" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Father's Name</label>
                <input name="fathersName" value={formData.fathersName} onChange={handleChange} type="text" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200 uppercase" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Sex</label>
                <select name="sex" value={formData.sex} onChange={handleChange} className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200 uppercase">
                  <option>Select</option>
                  <option>MALE</option>
                  <option>FEMALE</option>
                  <option>OTHER</option>
                </select>
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

          {/* Academic & Interest Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-700">
              <GraduationCap className="w-5 h-5" />
              <h2 className="text-lg font-medium">Academic & Interest Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Employment Status</label>
                <input name="employmentStatus" value={formData.employmentStatus} onChange={handleChange} type="text" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200 uppercase" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Qualification</label>
                <input name="qualification" value={formData.qualification} onChange={handleChange} type="text" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200 uppercase" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Course Interested</label>
                <select name="courseInterested" value={formData.courseInterested} onChange={handleChange} className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200 uppercase">
                  <option value="">Select Course</option>
                  {courses.filter(c => c.status === 'Active').map(course => (
                    <option key={course.id} value={course.name}>{course.name}</option>
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
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Reason for Interest</label>
              <input name="reason" value={formData.reason} onChange={handleChange} type="text" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200 uppercase" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Joining Plan</label>
                <input name="joiningPlan" value={formData.joiningPlan} onChange={handleChange} type="text" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200 uppercase" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Source of Information</label>
                <input name="source" value={formData.source} onChange={handleChange} type="text" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200 uppercase" />
              </div>
            </div>
          </div>

        </div>

        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
          <Link to="/enquiries" className="px-6 py-2.5 rounded-md bg-slate-500 text-white text-sm font-medium hover:bg-slate-600 transition-colors flex items-center justify-center">Cancel</Link>
          <button onClick={handleSubmit} className="px-6 py-2.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> {id ? 'Update Enquiry' : 'Save Enquiry'}
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
    </motion.div>
  );
};
