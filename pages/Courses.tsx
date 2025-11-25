import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Trash2, Edit } from 'lucide-react';
import { useData } from '../context/DataContext';
import { DeleteModal } from '../components/DeleteModal';

export const Courses = () => {
  const { courses, deleteCourse, students } = useData();
  const navigate = useNavigate();

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<{ id: string, name: string } | null>(null);

  const initiateDelete = (id: string, name: string) => {
    setCourseToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (courseToDelete) {
      deleteCourse(courseToDelete.id);
      setIsDeleteModalOpen(false);
      setCourseToDelete(null);
    }
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
          <BookOpen className="w-6 h-6 text-slate-800 dark:text-slate-100" />
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Courses</h1>
        </div>
        <Link to="/courses/add" className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-xs font-bold shadow-sm transition-colors">
          <Plus className="w-4 h-4" /> Add Course
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        {courses.length === 0 ? (
          <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-6">
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-full mb-4">
              <BookOpen className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300">No courses found</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 mb-4">Add your first course to get started</p>
            <Link to="/courses/add" className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-xs font-bold shadow-sm transition-colors">
              <Plus className="w-4 h-4" /> Add Course
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4">Course Name</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Fees</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Students</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 uppercase">{course.name}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{course.duration} Months</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">₹{course.fees}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${course.status === 'Active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                        {course.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {students.filter(s => s.course === course.name).length}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/courses/edit/${course.id}`)}
                          className="p-1.5 border border-amber-400 text-amber-500 rounded hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => initiateDelete(course.id, course.name)}
                          className="p-1.5 border border-red-400 text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Course"
        message="Are you sure you want to delete this course?"
        itemName={courseToDelete?.name}
      />
    </motion.div>
  );
};
