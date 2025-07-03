import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DollarSign, Import, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ImportDataModal from '../components/ImportContact';
import ColumnSelectorModal from '../components/ColumnSelectorModal';

const ALL_FIELDS = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'gender', label: 'Gender' },
  { key: 'dob', label: 'Date of Birth' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'country', label: 'Country' },
  { key: 'eventsPurchased', label: 'Events' },
  { key: 'ticketsPurchased', label: 'Tickets' },
  { key: 'totalSpent', label: 'Total Spent' },
  { key: 'lastActivity', label: 'Last Activity' }
];

const DEFAULT_FIELDS = [
  'firstName', 'lastName', 'email', 'mobile', 'gender', 'eventsPurchased', 'ticketsPurchased', 'totalSpent'
];

const ContactPage = () => {
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStats, setImportStats] = useState(null);
  const [visibleFields, setVisibleFields] = useState(DEFAULT_FIELDS);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [loading,setLoading] = useState(true)

  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/user/allusers");
      setUsers(response.data.users || []);
      setLoading(false)
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    (user.firstName + ' ' + user.lastName).toLowerCase().includes(searchText.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleUserClick = (id) => navigate(`/user/${id}`);

  if(loading){
    return (
       <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Contacts</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            <Import size={16} /> Import Contacts
          </button>
          <button
            onClick={() => setShowColumnModal(true)}
            className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            <Plus size={16} /> Add Column
          </button>
          <button
            onClick = {() => navigate("/integration")}
            className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
          >
             Integration
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex items-center gap-2">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {/* Import Modal */}
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

      {/* Column Selector Modal */}
      {showColumnModal && (
        <ColumnSelectorModal
          isOpen={showColumnModal}
          onClose={() => setShowColumnModal(false)}
          selectedFields={visibleFields}
          onSave={setVisibleFields}
          allFields={ALL_FIELDS}
        />
      )}

      {/* Import Stats */}
      {importStats && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded border border-green-300">
          ✅ Imported {importStats.inserted?.length || 0} records.
          {importStats.skipped?.length > 0 && <> ⚠️ Skipped {importStats.skipped.length} records due to issues.</>}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="w-full table-auto text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">#</th>
              {visibleFields.map((field) => (
                <th key={field} className="px-4 py-3 text-sm font-semibold text-gray-700">
                  {ALL_FIELDS.find(f => f.key === field)?.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, idx) => (
                <tr key={user._id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleUserClick(user._id)}>
                  <td className="px-4 py-3 text-gray-700">{idx + 1}</td>
                  {visibleFields.map((field) => (
                    <td key={field} className="px-4 py-3 text-gray-700">
                      {field === 'totalSpent'
                        ? (<span className="flex items-center gap-1"><DollarSign size={12} /> {user[field]?.toFixed(2) || '0.00'}</span>)
                        : user[field] || '—'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={visibleFields.length + 1} className="text-center py-8 text-gray-500">
                  No matching contacts found.
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
