import React, { useState } from "react";
import Papa from "papaparse";
import { Dialog } from "@headlessui/react";
import axios from "axios";
import { CheckCircle } from "lucide-react";

const ImportDataModal = ({ isOpen, onClose, onSuccess }) => {
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [fieldMapping, setFieldMapping] = useState({});
  const [uploadStep, setUploadStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [importType, setImportType] = useState("mixed");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (
          result.data.length === 0 ||
          Object.keys(result.data[0]).length === 0
        ) {
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

  const handleSubmit = async () => {
    setIsLoading(true);

    const mappedData = csvData.map((row) => {
      const mapped = {};
      for (const csvHeader in fieldMapping) {
        const backendField = fieldMapping[csvHeader];
        if (backendField && row[csvHeader] !== undefined) {
          if (backendField.includes(".")) {
            const [outer, inner] = backendField.split(".");
            if (!mapped[outer]) mapped[outer] = {};
            mapped[outer][inner] = row[csvHeader];
          } else {
            mapped[backendField] = row[csvHeader];
          }
        }
      }

      // 🔍 Additional fallback logic
      if (!mapped.ticketPrice && mapped.totalPaid && mapped.quantity) {
        const price = Number(mapped.totalPaid) / Number(mapped.quantity);
        if (!isNaN(price)) {
          mapped.ticketPrice = price.toFixed(2);
        }
      }

      return mapped;
    });

    const formData = new FormData();
    formData.append("data", JSON.stringify(mappedData));
    formData.append("importType", importType);

    try {
      const res = await axios.post(
        "http://localhost:3000/api/import/import-excel",
        formData
      );
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
    setImportType("mixed");
  };

  const backendFieldOptions = {
    user: [
      "firstName",
      "lastName",
      "email",
      "mobile",
      "dob",
      "gender",
      "city",
      "state",
      "country",
      "marketingOptIn",
      "lastActivity",
      "socialMedia.instagram",
      "socialMedia.tiktok",
      "socialMedia.spotify",
    ],
    booking: [
      "bookingId",
      "userEmail",
      "eventName",
      "eventId",
      "eventDate",
      "eventTime",
      "eventTimezone",
      "venue",
      "ticketType",
      "ticketPrice",
      "quantity",
      "totalPaid",
      "source",
      "bookedDate",
    ],
    payment: [
      "paymentId",
      "bookingId",
      "amount",
      "method",
      "status",
      "transactionDate",
      "currency",
      "eventbriteFee",
      "processingFee",
      "tax",
      "royalty",
      "netSales",
      "email",
    ],
  };

  const getRelevantFields = () => {
    if (importType === "mixed") {
      return [
        ...backendFieldOptions.user,
        ...backendFieldOptions.booking,
        ...backendFieldOptions.payment,
      ];
    }
    return backendFieldOptions[importType];
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
      className="fixed z-50 inset-0 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Panel className="bg-white w-full max-w-2xl p-6 rounded-xl shadow-xl">
          <Dialog.Title className="text-xl font-bold mb-4">
            Import Data
          </Dialog.Title>

          {/* Step 0: Upload + Type */}
          {uploadStep === 0 && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Import Type
                </label>
                <select
                  className="w-full border px-3 py-2 rounded"
                  value={importType}
                  onChange={(e) => setImportType(e.target.value)}
                >
                  <option value="mixed">
                    Mixed (User + Booking + Payment)
                  </option>
                  <option value="user">User Only</option>
                  <option value="booking">Booking Only</option>
                  <option value="payment">Payment Only</option>
                </select>
              </div>

              <div className="mb-4 p-4 border-l-4 bg-blue-50 border-blue-500 text-blue-800 rounded">
                <p className="font-semibold mb-2">📝 Required Fields:</p>
                <ul className="list-disc ml-6 text-sm">
                  {importType === "user" || importType === "mixed" ? (
                    <>
                      <li>
                        <code>email</code> (or <code>userEmail</code>)
                      </li>
                      <li>
                        <code>firstName</code> or <code>fullName</code>
                      </li>
                    </>
                  ) : null}
                  {importType === "booking" || importType === "mixed" ? (
                    <>
                      <li>
                        <code>bookingId</code>
                      </li>
                      <li>
                        <code>eventName</code>, <code>quantity</code>
                      </li>
                      <li>
                        <code>ticketPrice</code> or <code>totalPaid</code>
                      </li>
                    </>
                  ) : null}
                  {importType === "payment" || importType === "mixed" ? (
                    <>
                      <li>
                        <code>paymentId</code> (optional)
                      </li>
                      <li>
                        <code>bookingId</code>, <code>amount</code>,{" "}
                        <code>transactionDate</code>
                      </li>
                    </>
                  ) : null}
                </ul>
              </div>

              <input
                type="file"
                accept=".csv"
                className="mt-2"
                onChange={handleFileUpload}
              />
            </>
          )}

          {/* Step 1: Mapping */}
          {uploadStep === 1 && (
            <>
              <p className="mb-2 text-sm text-gray-600">
                Map database fields to your CSV headers:
              </p>
              <div className="grid grid-cols-1 gap-4 max-h-72 overflow-y-auto">
                {getRelevantFields().map((backendField) => {
                  return (
                    <div
                      key={backendField}
                      className="flex justify-between items-center gap-4"
                    >
                      <label className="w-44 text-sm font-medium text-gray-700 break-words">
                        {backendField}
                      </label>
                      <select
                        value={
                          Object.keys(fieldMapping).find(
                            (csvKey) =>
                              fieldMapping[csvKey] === backendField
                          ) || ""
                        }
                        onChange={(e) => {
                          const selectedHeader = e.target.value;
                          const updated = { ...fieldMapping };
                          for (const key in updated) {
                            if (updated[key] === backendField) {
                              delete updated[key];
                            }
                          }
                          if (selectedHeader) {
                            updated[selectedHeader] = backendField;
                          }
                          setFieldMapping(updated);
                        }}
                        className="w-full border px-3 py-2 rounded-md"
                      >
                        <option value="">-- Not Mapped --</option>
                        {csvHeaders.map((header) => (
                          <option key={header} value={header}>
                            {header}
                          </option>
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

          {/* Step 2: Success */}
          {uploadStep === 2 && (
            <div className="text-center">
              <CheckCircle className="text-green-500 w-10 h-10 mx-auto" />
              <p className="text-green-700 font-semibold mt-2">
                Import completed!
              </p>
              <button
                onClick={() => {
                  reset();
                  onClose();
                }}
                className="mt-4 bg-gray-200 px-4 py-2 rounded"
              >
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
