// src/pages/CampaignPage.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import MarketingModal from "../components/MarketingModal";

const FILTER_OPTIONS = [
  { label: "City", key: "city", type: "text" },
  { label: "State", key: "state", type: "text" },
  { label: "Country", key: "country", type: "text" },
  { label: "Gender", key: "gender", type: "text" },
  { label: "Total Spent >=", key: "totalSpent", type: "number" },
  { label: "Tickets Purchased >=", key: "ticketsPurchased", type: "number" },
  { label: "Marketing Opt-In", key: "marketing", type: "boolean" },
];

const CampaignPage = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [filters, setFilters] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showMarketingModal, setShowMarketingModal] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:3000/api/user/allusers").then((res) => {
      setAllUsers(res.data.users || []);
    });
  }, []);

  const applyFilters = () => {
    let result = [...allUsers];

    filters.forEach(({ key, value, type }) => {
      if (!value) return;

      result = result.filter((user) => {
        if (type === "boolean") return user[key] === (value === "true");
        if (type === "number") return Number(user[key]) >= Number(value);
        return String(user[key] || "").toLowerCase().includes(value.toLowerCase());
      });
    });

    setFilteredUsers(result);
  };

  const addFilter = () => {
    setFilters([...filters, { key: "", value: "", type: "text" }]);
  };

  const updateFilter = (index, field, val) => {
    const updated = [...filters];
    updated[index][field] = val;

    // Auto update type when key changes
    if (field === "key") {
      const found = FILTER_OPTIONS.find(f => f.key === val);
      updated[index].type = found?.type || "text";
    }

    setFilters(updated);
  };

  const removeFilter = (index) => {
    const updated = [...filters];
    updated.splice(index, 1);
    setFilters(updated);
  };

  useEffect(() => {
    applyFilters();
  }, [filters, allUsers]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
              <span className="text-white text-2xl">🎯</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Campaign Builder
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Create targeted segments and send personalized marketing messages to your audience.
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <span className="text-white text-sm">⚡</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Smart Filters</h2>
          </div>
          
          <div className="space-y-4">
            {filters.map((filter, index) => (
              <div key={index} className="group">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200">
                  <div className="flex-1">
                    <select
                      value={filter.key}
                      onChange={(e) => updateFilter(index, "key", e.target.value)}
                      className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl text-gray-700 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none"
                    >
                      <option value="">🔍 Select Field</option>
                      {FILTER_OPTIONS.map((f) => (
                        <option key={f.key} value={f.key}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1">
                    {filter.type === "boolean" ? (
                      <select
                        value={filter.value}
                        onChange={(e) => updateFilter(index, "value", e.target.value)}
                        className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl text-gray-700 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none"
                      >
                        <option value="">Select Option</option>
                        <option value="true">✅ Opted In</option>
                        <option value="false">❌ Opted Out</option>
                      </select>
                    ) : (
                      <input
                        type={filter.type}
                        value={filter.value}
                        onChange={(e) => updateFilter(index, "value", e.target.value)}
                        className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl text-gray-700 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none"
                        placeholder="Enter value..."
                      />
                    )}
                  </div>

                  <button
                    onClick={() => removeFilter(index)}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-105"
                    title="Remove filter"
                  >
                    <span className="text-lg">🗑️</span>
                  </button>
                </div>
              </div>
            ))}
            
            <button
              onClick={addFilter}
              className="w-full p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <span className="text-lg">➕</span>
              Add New Filter
            </button>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                <span className="text-white text-xl">👥</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {filteredUsers.length.toLocaleString()}
                </p>
                <p className="text-gray-600">Matched Users</p>
              </div>
            </div>
            
            {filteredUsers.length > 0 && (
              <button
                onClick={() => setShowMarketingModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                <span className="text-lg">📤</span>
                Send Campaign
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                <span className="text-white text-sm">📊</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Audience Preview</h2>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    👤 Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    ✉️ Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    📍 City
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    💰 Spent
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    📧 Marketing
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-6xl">🔍</span>
                        <p className="text-gray-500 text-lg">No users match your current filters</p>
                        <p className="text-gray-400 text-sm">Try adjusting your filter criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr key={user._id} className={`hover:bg-blue-50/50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {user.firstName?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <span className="text-gray-900 font-medium">
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {user.city || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-green-600 font-semibold">
                          ${user.totalSpent?.toFixed(2) || '0.00'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.marketing 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.marketing ? '✅ Opted In' : '❌ Opted Out'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Marketing Modal */}
      {showMarketingModal && (
        <MarketingModal
          users={filteredUsers}
          onClose={() => setShowMarketingModal(false)}
        />
      )}
    </div>
  );
};

export default CampaignPage;