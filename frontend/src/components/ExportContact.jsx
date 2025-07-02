import React, { useState, useEffect } from 'react';

const fieldMap = {
  firstName: 'user.firstName',
  lastName: 'user.lastName',
  email: 'user.email',
  mobile: 'user.mobile',
  dob: 'user.dob',
  gender: 'user.gender',

  eventName: 'booking.eventName',
  ticketType: 'booking.ticketType',
  ticketPrice: 'booking.ticketPrice',
  quantity: 'booking.quantity',
  bookedDate: 'booking.bookedDate',

  paymentId: 'payment.paymentId',
  amount: 'payment.amount',
  method: 'payment.method',
  status: 'payment.status',
  transactionDate: 'payment.transactionDate',
  currency: 'payment.currency'
};

const allFields = {
  user: ['firstName', 'lastName', 'email', 'mobile', 'dob', 'gender'],
  booking: ['eventName', 'ticketType', 'ticketPrice', 'quantity', 'bookedDate'],
  payment: ['paymentId', 'amount', 'method', 'status', 'transactionDate', 'currency']
};

const paymentStatusOptions = [
  'Eventbrite Completed',
  'pending',
  'refunded',
  'failed'
];

const groupColors = {
  user: 'border-blue-200 bg-blue-50',
  booking: 'border-green-200 bg-green-50',
  payment: 'border-purple-200 bg-purple-50'
};

const groupIcons = {
  user: '👤',
  booking: '🎫',
  payment: '💳'
};

const ExportModal = ({ isOpen, onClose }) => {
  const [selectedFields, setSelectedFields] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleField = (field) => {
    setSelectedFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  };

  const toggleAllInGroup = (group) => {
    const groupFields = allFields[group];
    const allSelected = groupFields.every(field => selectedFields.includes(field));
    
    if (allSelected) {
      setSelectedFields(prev => prev.filter(field => !groupFields.includes(field)));
    } else {
      setSelectedFields(prev => [...new Set([...prev, ...groupFields])]);
    }
  };

  const isGroupFullySelected = (group) => {
    return allFields[group].every(field => selectedFields.includes(field));
  };

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      alert('Please select at least one field to export.');
      return;
    }

    const mappedFields = selectedFields.map((f) => fieldMap[f] || f);
    const mappedFilters = {};
    for (const key in filters) {
      const mappedKey = fieldMap[key] || key;
      if (filters[key]) {
        mappedFilters[mappedKey] = filters[key];
      }
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/export/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: mappedFields,
          filters: mappedFilters
        })
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'exported_data.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Export failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleBackdropClick}
      />
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl transform transition-all relative">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  📊 Export Data
                </h2>
                <p className="text-gray-600">Select fields and apply filters to customize your export</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="px-8 py-6 space-y-8">
            {/* Field Selection */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Select Fields to Export</h3>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {selectedFields.length} selected
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {Object.entries(allFields).map(([group, fields]) => (
                  <div key={group} className={`border-2 rounded-xl p-5 transition-all hover:shadow-md ${groupColors[group]}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{groupIcons[group]}</span>
                        <h4 className="font-semibold text-gray-900 capitalize">{group} Data</h4>
                      </div>
                      <button
                        onClick={() => toggleAllInGroup(group)}
                        className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                          isGroupFullySelected(group)
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border'
                        }`}
                      >
                        {isGroupFullySelected(group) ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>

                    <div className="space-y-3">
                      {fields.map((field) => (
                        <label
                          key={field}
                          className="flex items-center gap-3 cursor-pointer group hover:bg-white hover:bg-opacity-50 p-2 rounded-lg transition-colors"
                        >
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={selectedFields.includes(field)}
                              onChange={() => toggleField(field)}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 border-2 rounded transition-all ${
                              selectedFields.includes(field)
                                ? 'bg-blue-600 border-blue-600'
                                : 'border-gray-300 group-hover:border-blue-400'
                            }`}>
                              {selectedFields.includes(field) && (
                                <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                          <span className="text-sm text-gray-700 font-medium capitalize">
                            {field.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-sm">2</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Apply Filters (Optional)</h3>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    🎪 Event Name
                  </label>
                  <input
                    type="text"
                    placeholder="Filter by event name..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        eventName: e.target.value
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    💰 Payment Status
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          status: e.target.value
                        }))
                      }
                    >
                      <option value="">All payment statuses</option>
                      {paymentStatusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-6 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Ready to export {selectedFields.length} field{selectedFields.length !== 1 ? 's' : ''} to CSV
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={loading || selectedFields.length === 0}
                  className={`px-8 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                    loading || selectedFields.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Exporting...
                    </>
                  ) : (
                    <>
                      📥 Export CSV
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;