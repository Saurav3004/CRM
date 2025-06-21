import React, { useState } from 'react';
import Papa from 'papaparse';
import { Dialog } from '@headlessui/react';
import { CheckCircle } from 'lucide-react';
import axios from 'axios';

const ImportContactsModal = ({ isOpen, onClose, onSuccess }) => {
  const [csvData, setCsvData] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [fieldMapping, setFieldMapping] = useState({});
  const [isBookingFile, setIsBookingFile] = useState(false);
  const [uploadStep, setUploadStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [importMode, setImportMode] = useState('live'); // NEW

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = Object.keys(results.data[0]);
        setCsvHeaders(headers);
        setCsvData(results.data);
        setIsBookingFile(headers.includes('eventName'));
        setFieldMapping({});
        setUploadStep(1);
        setIsLoading(false);
      },
    });
  };

  const handleMappingChange = (backendField, csvField) => {
    setFieldMapping((prev) => ({ ...prev, [backendField]: csvField }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    const mappedData = csvData.map(row => {
      const mappedRow = {};
      for (const backendField in fieldMapping) {
        const csvKey = fieldMapping[backendField];
        if (csvKey && row[csvKey] !== undefined) {
          mappedRow[backendField] = row[csvKey];
        }
      }
      if (isBookingFile) {
        mappedRow.venue = mappedRow.venue || 'Unknown Venue';
        mappedRow.eventId = mappedRow.eventId || `event-${Math.random().toString(36).substring(2, 10)}`;
      }
      return mappedRow;
    });

    const formData = new FormData();
    formData.append('importType', isBookingFile ? 'booking' : 'lead');
    formData.append('mode', importMode); // ADDING MODE
    formData.append('data', JSON.stringify(mappedData));

    try {
      const response = await axios.post('http://localhost:3000/api/user/import-excel', formData);
      console.log(response )
      setUploadStep(2);
      onSuccess();
      alert("Import successful");
    } catch (error) {
      console.error(error);
      alert("Import failed");
    } finally {
      setIsLoading(false);
    }
  };

  const leadFields = [
    'firstName', 'lastName', 'fullName', 'email', 'mobile',
    'dob', 'city', 'state', 'country', 'age', 'gender',
    'socialMedia.instagram', 'socialMedia.tiktok'
  ];

  const bookingFields = [
    'eventId', 'eventName', 'eventDate', 'venue',
    'ticketType', 'ticketPrice', 'quantity'
  ];

  const fieldsToRender = isBookingFile ? [...leadFields, ...bookingFields] : leadFields;

  const reset = () => {
    setCsvData([]);
    setCsvHeaders([]);
    setFieldMapping({});
    setUploadStep(0);
    setIsBookingFile(false);
    setIsLoading(false);
    setImportMode('live');
  };

  return (
    <Dialog open={isOpen} onClose={() => { reset(); onClose(); }} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Panel className="bg-white w-full max-w-2xl p-6 rounded-xl shadow-xl">
          <Dialog.Title className="text-xl font-semibold mb-4">Import Contacts</Dialog.Title>

          {uploadStep === 0 && (
            <div className="space-y-4">
              <input type="file" accept=".csv" onChange={handleFileUpload} />
              <div className="flex items-center gap-4 mt-4">
                <label className="text-sm font-medium text-gray-700">Import Mode:</label>
                <select
                  value={importMode}
                  onChange={(e) => setImportMode(e.target.value)}
                  className="border px-3 py-2 rounded-md"
                >
                  <option value="live">Live (will affect ticket count)</option>
                  <option value="historical">Historical (just for records)</option>
                </select>
              </div>
            </div>
          )}

          {uploadStep === 1 && (
            <div>
              <p className="mb-4">Map your CSV columns to backend fields:</p>
              <div className="grid grid-cols-1 gap-4 max-h-72 overflow-y-auto">
                {fieldsToRender.map(field => (
                  <div key={field} className="flex justify-between items-center">
                    <label className="text-sm font-medium w-40">{field}</label>
                    <select
                      value={fieldMapping[field] || ''}
                      onChange={(e) => handleMappingChange(field, e.target.value)}
                      className="w-full border px-3 py-2 rounded-md"
                    >
                      <option value="">-- Ignore --</option>
                      {csvHeaders.map(header => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <button onClick={handleSubmit} className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                {isLoading ? 'Importing...' : 'Import Data'}
              </button>
            </div>
          )}

          {uploadStep === 2 && (
            <div className="text-center space-y-4">
              <CheckCircle className="text-green-500 w-10 h-10 mx-auto" />
              <p className="text-green-600 font-semibold">Data Imported Successfully!</p>
              <button onClick={() => { reset(); onClose(); }} className="bg-gray-100 px-4 py-2 rounded-md">Close</button>
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ImportContactsModal;
