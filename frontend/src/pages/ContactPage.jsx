import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  DollarSign,
  Import,
  Plus,
  Search,
  Filter,
  Users,
  Activity,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ImportDataModal from "../components/ImportContact";
import ColumnSelectorModal from "../components/ColumnSelectorModal";
import MarketingModal from "../components/MarketingModal";
import { BACKEND_URI } from "../utils";

const ALL_FIELDS = [
  { key: "firstName", label: "First Name", icon: Users },
  { key: "lastName", label: "Last Name", icon: Users },
  { key: "email", label: "Email", icon: Mail },
  { key: "mobile", label: "Mobile", icon: Phone },
  { key: "gender", label: "Gender", icon: Users },
  { key: "dob", label: "Date of Birth", icon: Calendar },
  { key: "city", label: "City", icon: MapPin },
  { key: "state", label: "State", icon: MapPin },
  { key: "country", label: "Country", icon: MapPin },
  { key: "eventsPurchased", label: "Events", icon: Activity },
  { key: "ticketsPurchased", label: "Tickets", icon: Activity },
  { key: "totalSpent", label: "Total Spent", icon: DollarSign },
  { key: "lastActivity", label: "Last Activity", icon: Calendar },
  { key: "marketing", label: "Marketing", icon: Calendar },
];

const DEFAULT_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "mobile",
  "gender",
  "eventsPurchased",
  "ticketsPurchased",
  "totalSpent",
  "marketing",
];

const ContactPage = () => {
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStats, setImportStats] = useState(null);
  const [visibleFields, setVisibleFields] = useState(DEFAULT_FIELDS);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showMarketingModal, setShowMarketingModal] = useState(false);
  const VITE_API = import.meta.env.VITE_API_URL


  const navigate = useNavigate();

  const fetchUsers = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const response = await axios.get(`${VITE_API}/api/user/allusers`);
      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      (user.firstName + " " + user.lastName).toLowerCase().includes(searchText.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleUserClick = (id) => navigate(`/user/${id}`);

  const formatValue = (field, value) => {
    if (!value && value !== 0 && value !== false) return "—";

    switch (field) {
      case "totalSpent":
        return (
          <span className="flex items-center gap-1 text-green-600 font-medium">
            <DollarSign size={12} />
            {value.toFixed(2)}
          </span>
        );
      case "eventsPurchased":
      case "ticketsPurchased":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {value}
          </span>
        );
      case "email":
        return (
          <span className="text-blue-600 hover:text-blue-800 cursor-pointer">{value}</span>
        );
      case "mobile":
        return <span className="font-mono text-gray-700">{value}</span>;
      case "gender":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {value}
          </span>
        );
      case "marketing":
        return (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {value ? "Opted In" : "Opted Out"}
          </span>
        );
      default:
        return value;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium text-lg">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Contacts</h1>
            <p className="text-gray-600">Manage and organize your contact database</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowMarketingModal(true)}
              className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors shadow-md"
            >
              <Mail size={16} />
               Marketing
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors shadow-md"
            >
              <Import size={16} />
              Import Contacts
            </button>
            <button
              onClick={() => setShowColumnModal(true)}
              className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Eye size={16} />
              Columns
            </button>
            <button
              onClick={() => navigate("/integration")}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={16} />
              Integration
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-500">
            {searchText
              ? `${filteredUsers.length} of ${users.length} contacts`
              : `${users.length} contacts`}
          </div>
        </div>
      </div>

      {/* Modals */}
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

      {showColumnModal && (
        <ColumnSelectorModal
          isOpen={showColumnModal}
          onClose={() => setShowColumnModal(false)}
          selectedFields={visibleFields}
          onSave={setVisibleFields}
          allFields={ALL_FIELDS}
        />
      )}

      {showMarketingModal && (
        <MarketingModal
          users={users.filter((u) => u.marketing === true)}
          onClose={() => setShowMarketingModal(false)}
        />
      )}

      {/* Table */}
      <div className="w-full overflow-x-auto mt-6">
        <div className="w-full max-w-[950px] mx-auto overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
          <table className="min-w-[1000px] table-auto">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  #
                </th>
                {visibleFields.map((field) => {
                  const fieldInfo = ALL_FIELDS.find((f) => f.key === field);
                  return (
                    <th
                      key={field}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      <div className="flex items-center gap-2">
                        {fieldInfo?.icon && <fieldInfo.icon size={14} />}
                        {fieldInfo?.label}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredUsers.map((user, idx) => (
                <tr
                  key={user._id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleUserClick(user._id)}
                >
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{idx + 1}</td>
                  {visibleFields.map((field) => (
                    <td key={field} className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {formatValue(field, user[field])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
