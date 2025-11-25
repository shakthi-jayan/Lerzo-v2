import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Search, Edit, Trash } from 'lucide-react';
import { useData } from '../context/DataContext';
import { EnquiryStatus } from '../types';
import { DeleteModal } from '../components/DeleteModal';

export const Enquiries = () => {
  const { enquiries, deleteEnquiry } = useData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState<{ id: string, name: string } | null>(null);

  const initiateDelete = (id: string, name: string) => {
    setEnquiryToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (enquiryToDelete) {
      deleteEnquiry(enquiryToDelete.id);
      setIsDeleteModalOpen(false);
      setEnquiryToDelete(null);
    }
  };

  const handleConvert = (enquiryId: string) => {
    navigate(`/students/add?enquiryId=${enquiryId}`);
  };

  const filteredEnquiries = enquiries.filter(enquiry =>
    (enquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.mobile.includes(searchTerm)) &&
    enquiry.status !== EnquiryStatus.CONVERTED
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3 text-slate-800">
          <UserPlus className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Enquiries</h1>
        </div>
        <Link to="/enquiries/add" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm font-medium text-sm">
          <UserPlus className="w-4 h-4" /> Add Enquiry
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-3">
          <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
          <select className="w-full border-slate-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50 p-2.5 border">
            <option>Active Enquiries</option>
            <option>Converted</option>
            <option>Closed</option>
          </select>
        </div>
        <div className="md:col-span-9 relative">
          <label className="block text-xs font-bold text-slate-700 mb-1">Search</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or mobile"
              className="w-full border-slate-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50 p-2.5 border pl-4"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="absolute right-1 top-1 bottom-1 bg-white border border-slate-200 rounded p-1.5 text-blue-500 hover:text-blue-600">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Course Interested</th>
                <th className="px-6 py-4">Mobile</th>
                <th className="px-6 py-4">Qualification</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Added On</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEnquiries.length > 0 ? filteredEnquiries.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 uppercase">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{item.courseInterested}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{item.mobile}</td>
                  <td className="px-6 py-4 text-slate-600">{item.qualification}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded text-white text-xs font-bold ${item.status === EnquiryStatus.CONVERTED ? 'bg-blue-500' : 'bg-green-500'
                      }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{new Date(item.addedOn).toLocaleDateString('en-GB')}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/enquiries/edit/${item.id}`)}
                        className="p-1.5 text-amber-500 hover:bg-amber-50 border border-amber-500 rounded bg-white transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {item.status !== EnquiryStatus.CONVERTED && (
                        <button
                          onClick={() => handleConvert(item.id)}
                          className="p-1.5 text-green-600 hover:bg-green-50 border border-transparent rounded hover:border-green-600 transition-colors"
                          title="Convert to Student"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => initiateDelete(item.id, item.name)}
                        className="p-1.5 text-red-600 hover:bg-red-50 border border-red-600 rounded bg-white transition-colors"
                        title="Delete"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No enquiries found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Enquiry"
        message="Are you sure you want to delete this enquiry?"
        itemName={enquiryToDelete?.name}
      />
    </div>
  );
};
