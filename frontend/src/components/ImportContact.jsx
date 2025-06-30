import React, { useState } from 'react';
import Papa from 'papaparse';
import { Dialog } from '@headlessui/react';
import axios from 'axios';
import { CheckCircle } from 'lucide-react';

const ImportDataModal = ({ isOpen, onClose, onSuccess }) => {
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [fieldMapping, setFieldMapping] = useState({});
  const [uploadStep, setUploadStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (result.data.length === 0 || Object.keys(result.data[0]).length === 0) {
          alert("Uploaded CSV is empty or invalid.");
          setIsLoading(false);
          return;
        }

        const headers = Object.keys(result.data[0]);
        setCsvHeaders(headers);
        setCsvData(result.data);
        setUploadStep(1);
        setIsLoading(false);
      },
    });
  };

  const handleMappingChange = (csvHeader, backendField) => {
    setFieldMapping((prev) => ({
      ...prev,
      [csvHeader]: backendField,
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    const mappedData = csvData.map((row) => {
      const mapped = {};
      for (const csvHeader in fieldMapping) {
        const backendField = fieldMapping[csvHeader];
        if (backendField && row[csvHeader] !== undefined) {
          mapped[backendField] = row[csvHeader];
        }
      }
      return mapped;
    });

    const formData = new FormData();
    formData.append('data', JSON.stringify(mappedData));

    try {
      const res = await axios.post('http://localhost:3000/api/import/import-excel', formData);
      alert(res.data.message || "Import complete");
      setUploadStep(2);
      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert("Import failed. Check console.");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setCsvHeaders([]);
    setCsvData([]);
    setFieldMapping({});
    setUploadStep(0);
    setIsLoading(false);
  };

  const backendFieldOptions = [
    'firstName', 'lastName', 'email', 'mobile', 'dob', 'gender',
    'city', 'state', 'country','marketingOptIn',
    'socialMedia.instagram', 'socialMedia.tiktok', 'socialMedia.spotify',
    'totalSpent', 'ticketId',
    'bookingId', 'userEmail', 'eventName', 'venue', 'ticketType', 'ticketPrice',
    'quantity', 'bookedDate', 'source',
    'paymentId', 'amount', 'method', 'status', 'transactionDate'
  ];

  return (
    <Dialog open={isOpen} onClose={() => { reset(); onClose(); }} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Panel className="bg-white w-full max-w-2xl p-6 rounded-xl shadow-xl">
          <Dialog.Title className="text-xl font-bold mb-4">Import Data</Dialog.Title>

          {uploadStep === 0 && (
            <input type="file" accept=".csv" onChange={handleFileUpload} />
          )}

          {uploadStep === 1 && (
            <>
              <p className="mb-2 text-sm text-gray-600">Preview First Row:</p>
              <pre className="bg-gray-100 p-2 rounded text-xs mb-4 overflow-x-auto">{JSON.stringify(csvData[0], null, 2)}</pre>

              <p className="mb-2 text-sm text-gray-600">Map CSV columns to backend fields:</p>
              <div className="grid grid-cols-1 gap-4 max-h-72 overflow-y-auto">
                {csvHeaders.map((header) => {
                  const filteredOptions = backendFieldOptions.filter(field => {
                    const fieldName = field.split('.').pop()?.toLowerCase();
                    return fieldName.includes(header.toLowerCase()) || header.toLowerCase().includes(fieldName);
                  });

                  const optionsToShow = filteredOptions.length > 0 ? filteredOptions : backendFieldOptions;

                  return (
                    <div key={header} className="flex justify-between items-center gap-4">
                      <label className="w-40 text-sm font-medium text-gray-700">{header}</label>
                      <select
                        value={fieldMapping[header] || ''}
                        onChange={(e) => handleMappingChange(header, e.target.value)}
                        className="w-full border px-3 py-2 rounded-md"
                      >
                        <option value="">-- Ignore --</option>
                        {optionsToShow.sort().map((field) => (
                          <option key={field} value={field}>{field}</option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleSubmit}
                className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                disabled={isLoading}
              >
                {isLoading ? "Importing..." : "Import Now"}
              </button>
            </>
          )}

          {uploadStep === 2 && (
            <div className="text-center">
              <CheckCircle className="text-green-500 w-10 h-10 mx-auto" />
              <p className="text-green-700 font-semibold mt-2">Import completed!</p>
              <button onClick={() => { reset(); onClose(); }} className="mt-4 bg-gray-200 px-4 py-2 rounded">
                Close
              </button>
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ImportDataModal;
