import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DollarSign, Import, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ImportDataModal from '../components/ImportContact';

const ALL_COLUMNS = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'gender', label: 'Gender' },
  { key: 'dob', label: 'DOB' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'country', label: 'Country' },
  { key: 'eventsPurchased', label: 'Events Purchased' },
  { key: 'ticketsPurchased', label: 'Tickets Purchased' },
  { key: 'totalSpent', label: 'Total Spent' },
  { key: 'lastActivity', label: 'Last Active' }
];


const ContactPage = () => {
  const [users, setUsers] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStats, setImportStats] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [search, setSearch] = useState('');
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

  const toggleColumn = (key) => {
    setVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const filteredUsers = users.filter((user) => {
    const name = `${user.firstName} ${user.lastName}`.toLowerCase();
    return (
      name.includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Contacts</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            <Import size={16} /> Import Contacts
          </button>
          <div className="relative group">
            <button className="flex items-center gap-2 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400">
              <Plus size={16} /> Add Column
            </button>
            <div className="absolute hidden group-hover:block mt-2 z-10 bg-white border shadow rounded w-48 p-2">
              {ALL_COLUMNS.map(col => (
                <label key={col.key} className="block text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(col.key)}
                    onChange={() => toggleColumn(col.key)}
                    className="mr-2"
                  />
                  {col.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search by name or email..."
        className="mb-4 px-4 py-2 w-full max-w-md border rounded"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

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

      {importStats && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded border border-green-300">
          ✅ Imported {importStats.inserted?.length || 0} records.
          {importStats.skipped?.length > 0 && (
            <> ⚠️ Skipped {importStats.skipped.length} records due to issues.</>
          )}
        </div>
      )}

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="w-full table-auto text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Mobile</th>
              <th className="px-4 py-3">Gender</th>
              <th className="px-4 py-3">Events</th>
              <th className="px-4 py-3">Tickets</th>
              <th className="px-4 py-3">Spent</th>
              {visibleColumns.map((col) => (
                <th key={col} className="px-4 py-3 capitalize">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, idx) => (
                <tr
                  key={user._id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/user/${user._id}`)}
                >
                  <td className="px-4 py-4">{idx + 1}</td>
                  <td className="px-4 py-4">{user.fullName || `${user.firstName} ${user.lastName}`}</td>
                  <td className="px-4 py-4">{user.email}</td>
                  <td className="px-4 py-4">{user.mobile}</td>
                  <td className="px-4 py-4">{user.gender}</td>
                  <td className="px-4 py-4">{user.eventsPurchased || 0}</td>
                  <td className="px-4 py-4">{user.ticketsPurchased || 0}</td>
                  <td className="px-4 py-4 flex items-center gap-1">
                    <DollarSign size={12} /> {user.totalSpent?.toFixed(2) || '0.00'}
                  </td>
                  {visibleColumns.map((col) => (
                    <td key={col} className="px-4 py-4">
                      {col.includes('Date') ? formatDate(user[col]) : user[col] || '—'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center py-6 text-gray-500">No contacts found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContactPage;
