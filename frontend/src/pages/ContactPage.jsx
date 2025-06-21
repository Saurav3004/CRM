import React, { useEffect, useState } from 'react';
import ImportContactsModal from '../components/ImportContact';
import axios from 'axios';
import { DollarSign, Import } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ContactPage = () => {
  const [users, setUsers] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/user/allusers");
      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const userProfile = (userId) => {
    navigate(`/user/${userId}`);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */ }
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Contacts</h1>
        <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
        >
          <Import size={14} /> Import Contacts
        </button>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <ImportContactsModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false);
            fetchUsers(); // ✅ Refresh users after import
          }}
        />
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="w-full text-left table-auto">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-sm text-gray-700">Name</th>
              <th className="px-6 py-3 font-semibold text-sm text-gray-700">Email</th>
              <th className="px-6 py-3 font-semibold text-sm text-gray-700">Mobile</th>
               <th className="px-6 py-3 font-semibold text-sm text-gray-700">Gender</th>
              <th className="px-6 py-3 font-semibold text-sm text-gray-700">Events Purchased</th>
              <th className="px-6 py-3 font-semibold text-sm text-gray-700">Tickets Purchased</th>
              <th className="px-6 py-3 font-semibold text-sm text-gray-700">Total Spent</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => userProfile(user._id)}
                >
                  <td className="px-6 py-6 text-gray-800">
                    {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`}
                  </td>
                  <td className="px-6 py-6 text-gray-700">{user.email}</td>
                  <td className="px-6 py-6 text-gray-700">{user.mobile || '-'}</td>
                     <td className="px-6 py-6 text-gray-700">{user.gender || '-'}</td>
                  <td className="px-6 py-6 text-gray-700">
                    {user.totalUniqueEvents || 0}
                  </td>
                  <td className="px-6 py-6 text-gray-700">
                    {(user.bookings || []).reduce((sum, booking) => sum + (booking.quantity || 0), 0)}
                  </td>
                  <td className="flex items-center justify-center px-6 py-6 text-gray-700">
                    <DollarSign size={10} /> {user.totalSpent || 0}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 py-8">
                  No contacts found. Try importing some!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContactPage;
