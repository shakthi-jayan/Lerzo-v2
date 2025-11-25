
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, ArrowLeft, Save } from 'lucide-react';
import { useData } from '../context/DataContext';
import { AlertModal, AlertType } from '../components/AlertModal';

export const AddCourse = () => {
    const { addCourse, updateCourse, getCourse } = useData();
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        name: '',
        duration: '',
        fees: '',
        description: '',
        status: 'Active'
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
            navigate('/courses');
        }
    };

    useEffect(() => {
        if (id) {
            const course = getCourse(id);
            if (course) {
                setFormData({
                    name: course.name,
                    duration: course.duration.toString(),
                    fees: course.fees.toString(),
                    description: course.description,
                    status: course.status
                });
            }
        }
    }, [id, getCourse]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const newValue = (type === 'text' || type === 'textarea') ? value.toUpperCase() : value;
        setFormData(prev => ({ ...prev, [name]: newValue }));
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.fees) {
            showAlert("Missing Information", "Course Name and Fees are required", "error");
            return;
        }

        const courseData = {
            id: id || Date.now().toString(),
            name: formData.name,
            duration: Number(formData.duration) || 0,
            fees: Number(formData.fees) || 0,
            description: formData.description,
            status: formData.status as 'Active' | 'Inactive',
            studentsEnrolled: 0
        };

        if (id) {
            await updateCourse(id, courseData);
            showAlert("Success", "Course updated successfully!", "success");
        } else {
            await addCourse(courseData);
            showAlert("Success", "Course added successfully!", "success");
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
                    <Plus className="w-6 h-6 text-slate-800 dark:text-slate-100" />
                    <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{id ? 'Edit Course' : 'Add Course'}</h1>
                </div>
                <Link to="/courses" className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 text-xs font-medium">
                    <ArrowLeft className="w-3 h-3" /> Back to Courses
                </Link>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-6">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Course Name</label>
                            <input name="name" value={formData.name} onChange={handleChange} type="text" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200 uppercase" />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Duration (Months)</label>
                            <input name="duration" value={formData.duration} onChange={handleChange} type="number" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200" />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Fees</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-slate-500 dark:text-slate-400 text-sm">₹</span>
                                <input name="fees" value={formData.fees} onChange={handleChange} type="number" className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2 pl-7 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Enter course description..." rows={4} className="w-full border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200 uppercase"></textarea>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200">
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                    <Link to="/courses" className="px-6 py-2 rounded-md bg-slate-500 text-white text-sm font-bold hover:bg-slate-600 transition-colors">Cancel</Link>
                    <button onClick={handleSubmit} className="px-6 py-2 rounded-md bg-blue-500 text-white text-sm font-bold hover:bg-blue-600 shadow-sm transition-colors flex items-center gap-2">
                        <Save className="w-4 h-4" /> {id ? 'Update Course' : 'Save Course'}
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
