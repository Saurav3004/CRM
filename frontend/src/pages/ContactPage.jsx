import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DollarSign, Import } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ImportDataModal from '../components/ImportContact';

const ContactPage = () => {
  const [users, setUsers] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStats, setImportStats] = useState(null);
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

  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Contacts</h1>
        <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
        >
          <Import size={16} /> Import Contacts
        </button>
      </div>

      {/* Modal */}
      {showImportModal && (
        <ImportDataModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onSuccess={(stats) => {
            setImportStats(stats);
            fetchUsers();
          }}
        />
      )}

      {/* Import Result Summary */}
      {importStats && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded border border-green-300">
          ✅ Imported {importStats.inserted?.length || 0} records.
          {importStats.skipped?.length > 0 && (
            <> ⚠️ Skipped {importStats.skipped.length} records due to issues.</>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="w-full table-auto text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">#</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Name</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Email</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Mobile</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Gender</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Events</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Tickets</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Spent</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user, idx) => (
                <tr
                  key={user._id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleUserClick(user._id)}
                >
                  <td className="px-4 py-4 text-gray-600">{idx + 1}</td>
                  <td className="px-4 py-4 text-gray-800">
                    {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || '—'}
                  </td>
                  <td className="px-4 py-4 text-gray-700">{user.email || '—'}</td>
                  <td className="px-4 py-4 text-gray-700">{user.mobile || '—'}</td>
                  <td className="px-4 py-4 text-gray-700">{user.gender || '—'}</td>
                  <td className="px-4 py-4 text-gray-700">{user.eventsPurchased || 0}</td>
                  <td className="px-4 py-4 text-gray-700">{user.ticketsPurchased || 0}</td>
                  <td className="flex items-center gap-1 px-4 py-4 text-gray-700">
                    <DollarSign size={12} /> {user.totalSpent?.toFixed(2) || '0.00'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500">
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
