// import React, { useState } from "react";
// import Papa from "papaparse";
// import { Dialog } from "@headlessui/react";
// import axios from "axios";
// import { CheckCircle } from "lucide-react";

// const ImportDataModal = ({ isOpen, onClose, onSuccess }) => {
//   const [csvHeaders, setCsvHeaders] = useState([]);
//   const [csvData, setCsvData] = useState([]);
//   const [fieldMapping, setFieldMapping] = useState({});
//   const [uploadStep, setUploadStep] = useState(0);
//   const [isLoading, setIsLoading] = useState(false);
//   const [importType, setImportType] = useState("mixed");
//   const VITE_API = import.meta.env.VITE_API_URL

//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setIsLoading(true);
//     Papa.parse(file, {
//       header: true,
//       skipEmptyLines: true,
//       complete: (result) => {
//         if (
//           result.data.length === 0 ||
//           Object.keys(result.data[0]).length === 0
//         ) {
//           alert("Uploaded CSV is empty or invalid.");
//           setIsLoading(false);
//           return;
//         }
//         const headers = Object.keys(result.data[0]);
//         setCsvHeaders(headers);
//         setCsvData(result.data);
//         setUploadStep(1);
//         setIsLoading(false);
//       },
//     });
//   };

//   const handleSubmit = async () => {
//     setIsLoading(true);

//     const mappedData = csvData.map((row) => {
//       const mapped = {};
//       for (const csvHeader in fieldMapping) {
//         const backendField = fieldMapping[csvHeader];
//         if (backendField && row[csvHeader] !== undefined) {
//           if (backendField.includes(".")) {
//             const [outer, inner] = backendField.split(".");
//             if (!mapped[outer]) mapped[outer] = {};
//             mapped[outer][inner] = row[csvHeader];
//           } else {
//             mapped[backendField] = row[csvHeader];
//           }
//         }
//       }

//       // 🔍 Additional fallback logic
//       if (!mapped.ticketPrice && mapped.totalPaid && mapped.quantity) {
//         const price = Number(mapped.totalPaid) / Number(mapped.quantity);
//         if (!isNaN(price)) {
//           mapped.ticketPrice = price.toFixed(2);
//         }
//       }

//       return mapped;
//     });

//     const formData = new FormData();
//     formData.append("data", JSON.stringify(mappedData));
//     formData.append("importType", importType);

//     try {
//       const res = await axios.post(
//         `${VITE_API}/api/import/import-excel`,
//         formData
//       );
//       alert(res.data.message || "Import complete");
//       setUploadStep(2);
//       onSuccess?.();
//     } catch (err) {
//       console.error(err);
//       alert("Import failed. Check console.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const reset = () => {
//     setCsvHeaders([]);
//     setCsvData([]);
//     setFieldMapping({});
//     setUploadStep(0);
//     setIsLoading(false);
//     setImportType("mixed");
//   };

//   const backendFieldOptions = {
//     user: [
//       "firstName",
//       "lastName",
//       "email",
//       "mobile",
//       "dob",
//       "gender",
//       "city",
//       "state",
//       "country",
//       "marketingOptIn",
//       "lastActivity",
//       "socialMedia.instagram",
//       "socialMedia.tiktok",
//       "socialMedia.spotify",
//     ],
//     booking: [
//       "bookingId",
//       "userEmail",
//       "eventName",
//       "eventId",
//       "eventDate",
//       "eventTime",
//       "eventTimezone",
//       "venue",
//       "ticketType",
//       "ticketPrice",
//       "quantity",
//       "totalPaid",
//       "source",
//       "bookedDate",
//     ],
//     payment: [
//       "paymentId",
//       "bookingId",
//       "amount",
//       "method",
//       "status",
//       "transactionDate",
//       "currency",
//       "eventbriteFee",
//       "processingFee",
//       "tax",
//       "royalty",
//       "netSales",
//       "email",
//     ],
//   };

//   const getRelevantFields = () => {
//     if (importType === "mixed") {
//       return [
//         ...backendFieldOptions.user,
//         ...backendFieldOptions.booking,
//         ...backendFieldOptions.payment,
//       ];
//     }
//     return backendFieldOptions[importType];
//   };

//   return (
//     <Dialog
//       open={isOpen}
//       onClose={() => {
//         reset();
//         onClose();
//       }}
//       className="fixed z-50 inset-0 overflow-y-auto"
//     >
//       <div className="flex items-center justify-center min-h-screen p-4">
//         <Dialog.Panel className="bg-white w-full max-w-2xl p-6 rounded-xl shadow-xl">
//           <Dialog.Title className="text-xl font-bold mb-4">
//             Import Data
//           </Dialog.Title>

//           {/* Step 0: Upload + Type */}
//           {uploadStep === 0 && (
//             <>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Select Import Type
//                 </label>
//                 <select
//                   className="w-full border px-3 py-2 rounded"
//                   value={importType}
//                   onChange={(e) => setImportType(e.target.value)}
//                 >
//                   <option value="mixed">
//                     Mixed (User + Booking + Payment)
//                   </option>
//                   <option value="user">User Only</option>
//                   <option value="booking">Booking Only</option>
//                   <option value="payment">Payment Only</option>
//                 </select>
//               </div>

//               <div className="mb-4 p-4 border-l-4 bg-blue-50 border-blue-500 text-blue-800 rounded">
//                 <p className="font-semibold mb-2">📝 Required Fields:</p>
//                 <ul className="list-disc ml-6 text-sm">
//                   {importType === "user" || importType === "mixed" ? (
//                     <>
//                       <li>
//                         <code>email</code> (or <code>userEmail</code>)
//                       </li>
//                       <li>
//                         <code>firstName</code> or <code>fullName</code>
//                       </li>
//                     </>
//                   ) : null}
//                   {importType === "booking" || importType === "mixed" ? (
//                     <>
//                       <li>
//                         <code>bookingId</code>
//                       </li>
//                       <li>
//                         <code>eventName</code>, <code>quantity</code>
//                       </li>
//                       <li>
//                         <code>ticketPrice</code> or <code>totalPaid</code>
//                       </li>
//                     </>
//                   ) : null}
//                   {importType === "payment" || importType === "mixed" ? (
//                     <>
//                       <li>
//                         <code>paymentId</code> (optional)
//                       </li>
//                       <li>
//                         <code>bookingId</code>, <code>amount</code>,{" "}
//                         <code>transactionDate</code>
//                       </li>
//                     </>
//                   ) : null}
//                 </ul>
//               </div>

//               <input
//                 type="file"
//                 accept=".csv"
//                 className="mt-2"
//                 onChange={handleFileUpload}
//               />
//             </>
//           )}

//           {/* Step 1: Mapping */}
//           {uploadStep === 1 && (
//             <>
//               <p className="mb-2 text-sm text-gray-600">
//                 Map database fields to your CSV headers:
//               </p>
//               <div className="grid grid-cols-1 gap-4 max-h-72 overflow-y-auto">
//                 {getRelevantFields().map((backendField) => {
//                   return (
//                     <div
//                       key={backendField}
//                       className="flex justify-between items-center gap-4"
//                     >
//                       <label className="w-44 text-sm font-medium text-gray-700 break-words">
//                         {backendField}
//                       </label>
//                       <select
//                         value={
//                           Object.keys(fieldMapping).find(
//                             (csvKey) =>
//                               fieldMapping[csvKey] === backendField
//                           ) || ""
//                         }
//                         onChange={(e) => {
//                           const selectedHeader = e.target.value;
//                           const updated = { ...fieldMapping };
//                           for (const key in updated) {
//                             if (updated[key] === backendField) {
//                               delete updated[key];
//                             }
//                           }
//                           if (selectedHeader) {
//                             updated[selectedHeader] = backendField;
//                           }
//                           setFieldMapping(updated);
//                         }}
//                         className="w-full border px-3 py-2 rounded-md"
//                       >
//                         <option value="">-- Not Mapped --</option>
//                         {csvHeaders.map((header) => (
//                           <option key={header} value={header}>
//                             {header}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   );
//                 })}
//               </div>

//               <button
//                 onClick={handleSubmit}
//                 className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
//                 disabled={isLoading}
//               >
//                 {isLoading ? "Importing..." : "Import Now"}
//               </button>
//             </>
//           )}

//           {/* Step 2: Success */}
//           {uploadStep === 2 && (
//             <div className="text-center">
//               <CheckCircle className="text-green-500 w-10 h-10 mx-auto" />
//               <p className="text-green-700 font-semibold mt-2">
//                 Import completed!
//               </p>
//               <button
//                 onClick={() => {
//                   reset();
//                   onClose();
//                 }}
//                 className="mt-4 bg-gray-200 px-4 py-2 rounded"
//               >
//                 Close
//               </button>
//             </div>
//           )}
//         </Dialog.Panel>
//       </div>
//     </Dialog>
//   );
// };

// export default ImportDataModal;


import React, { useState } from "react";
import Papa from "papaparse";
import { Dialog } from "@headlessui/react";
import axios from "axios";
import { 
  CheckCircle, 
  Upload, 
  FileText, 
  Settings, 
  X, 
  Info, 
  AlertCircle, 
  Users, 
  User,
  ArrowLeft,
  Plus
} from "lucide-react";

// Main Import Contact Modal Component
const ImportContactModal = ({ isOpen, onClose, onSuccess }) => {
  const [importMode, setImportMode] = useState(null); // 'mass' or 'single'

  const handleModeSelect = (mode) => {
    setImportMode(mode);
  };

  const handleBack = () => {
    setImportMode(null);
  };

  const handleCloseModal = () => {
    setImportMode(null);
    onClose();
  };

  

  return (
    <Dialog
      open={isOpen}
      onClose={handleCloseModal}
      className="fixed z-50 inset-0 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen p-4 bg-black bg-opacity-50">
        <Dialog.Panel className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
            >
              <X size={24} />
            </button>

            {importMode && (
              <button
                onClick={handleBack}
                className="absolute top-4 left-4 text-white hover:text-gray-200 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
            )}

            <Dialog.Title className="text-2xl font-bold mb-2">
              {!importMode && "Import Contacts"}
              {importMode === 'mass' && "Mass Import"}
              {importMode === 'single' && "Add New Contact"}
            </Dialog.Title>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {!importMode ? (
              <ImportModeSelector onModeSelect={handleModeSelect} />
            ) : importMode === 'mass' ? (
              <MassImportComponent onSuccess={onSuccess} />
            ) : (
              <SingleContactForm onSuccess={onSuccess} onClose={handleCloseModal} />
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

// Import Mode Selection Component
const ImportModeSelector = ({ onModeSelect }) => {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Choose Import Method
        </h3>
        <p className="text-gray-600">
          Select how you would like to add contacts to your system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mass Import Option */}
        <div 
          onClick={() => onModeSelect('mass')}
          className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-8 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
              <Users className="text-white w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-blue-800 mb-3">
              Mass Import
            </h4>
            <p className="text-blue-700 mb-4 leading-relaxed">
              Import multiple contacts at once using a CSV file. Perfect for bulk data uploads.
            </p>
            <div className="bg-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 font-medium">
                ✓ Upload CSV files
              </p>
              <p className="text-sm text-blue-800 font-medium">
                ✓ Map data fields
              </p>
              <p className="text-sm text-blue-800 font-medium">
                ✓ Import hundreds of contacts
              </p>
            </div>
          </div>
        </div>

        {/* Single Contact Option */}
        <div 
          onClick={() => onModeSelect('single')}
          className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-8 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <User className="text-white w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-green-800 mb-3">
              Single Contact
            </h4>
            <p className="text-green-700 mb-4 leading-relaxed">
              Add one contact at a time using a detailed form. Great for individual entries.
            </p>
            <div className="bg-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800 font-medium">
                ✓ Easy form interface
              </p>
              <p className="text-sm text-green-800 font-medium">
                ✓ Detailed information
              </p>
              <p className="text-sm text-green-800 font-medium">
                ✓ Instant validation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Info className="text-gray-600 mt-1" size={20} />
          <div>
            <h4 className="font-medium text-gray-800 mb-2">
              Need Help Deciding?
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Use <strong>Mass Import</strong> if you have contact data in a spreadsheet or CSV file. 
              Use <strong>Single Contact</strong> if you want to add contacts one by one with a simple form.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Single Contact Form Component
const SingleContactForm = ({ onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    dob: "",
    gender: "",
    city: "",
    state: "",
    country: "",
    marketingOptIn: false,
    instagram: "",
    tiktok: "",
    spotify: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const VITE_API = import.meta.env.VITE_API_URL;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const addContact = async () => {
    const response = await axios.post(`${VITE_API}/api/import/addcontact`,formData)
    onClose()
    console.log(response)
  }

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (formData.mobile && !/^\+?[\d\s-()]+$/.test(formData.mobile)) {
      newErrors.mobile = 'Invalid mobile number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data in the same format as mass import
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobile: formData.mobile || undefined,
        dob: formData.dob || undefined,
        gender: formData.gender || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        country: formData.country || undefined,
        marketingOptIn: formData.marketingOptIn,
        socialMedia: {
          instagram: formData.instagram || undefined,
          tiktok: formData.tiktok || undefined,
          spotify: formData.spotify || undefined
        }
      };

      // Remove empty socialMedia object if no social media data
      if (!userData.socialMedia.instagram && !userData.socialMedia.tiktok && !userData.socialMedia.spotify) {
        delete userData.socialMedia;
      }

      const response = await axios.post(
        `${VITE_API}/api/import/import-excel`,
        {
          data: JSON.stringify([userData]),
          importType: 'user',
          fileName: 'single-contact.json'
        }
      );

      console.log('Contact added successfully:', response.data);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Failed to add contact. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter first name"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter last name"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile
            </label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                errors.mobile ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter mobile number"
            />
            {errors.mobile && (
              <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          Location Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder="Enter city"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder="Enter state"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder="Enter country"
            />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          Social Media (Optional)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instagram
            </label>
            <input
              type="text"
              name="instagram"
              value={formData.instagram}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder="@username or URL"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              TikTok
            </label>
            <input
              type="text"
              name="tiktok"
              value={formData.tiktok}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder="@username or URL"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Spotify
            </label>
            <input
              type="text"
              name="spotify"
              value={formData.spotify}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder="Profile URL"
            />
          </div>
        </div>
      </div>

      {/* Marketing Opt-in */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <div className="flex items-center">
          <input
            type="checkbox"
            name="marketingOptIn"
            id="marketingOptIn"
            checked={formData.marketingOptIn}
            onChange={handleInputChange}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="marketingOptIn" className="ml-2 block text-sm text-gray-700">
            Opt-in to marketing communications
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          disabled={isSubmitting}
          onClick={addContact}
          className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-colors ${
            isSubmitting 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              Adding Contact...
            </>
          ) : (
            <>
              <Plus size={20} />
              Add Contact
            </>
          )}
        </button>
      </div>
    </form>
  );
};

// Mass Import Component (your existing ImportDataModal logic)
const MassImportComponent = ({ onSuccess }) => {
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [fieldMapping, setFieldMapping] = useState({});
  const [uploadStep, setUploadStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [importType, setImportType] = useState("mixed");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [eventNamePromptOpen, setEventNamePromptOpen] = useState(false);
  const [manualEventName, setManualEventName] = useState("");

  const VITE_API = import.meta.env.VITE_API_URL;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFile(file);
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

  const processMappedData = () => {
    return csvData.map((row) => {
      const mapped = {};

      for (const [backendField, csvKey] of Object.entries(fieldMapping)) {
        const value = row[csvKey];
        if (value !== undefined) {
          if (backendField.includes(".")) {
            const [outer, inner] = backendField.split(".");
            if (!mapped[outer]) mapped[outer] = {};
            mapped[outer][inner] = value;
          } else {
            mapped[backendField] = value;
          }
        }
      }

      if (
        (importType === "mixed" || importType === "booking") &&
        !mapped.eventName &&
        manualEventName
      ) {
        mapped.eventName = manualEventName;
      }

      if (!mapped.ticketPrice && mapped.totalPaid && mapped.quantity) {
        const price = Number(mapped.totalPaid) / Number(mapped.quantity);
        if (!isNaN(price)) {
          mapped.ticketPrice = price.toFixed(2);
        }
      }

      return mapped;
    });
  };

  const handleSubmit = () => {
    const isEventNameMissing = !fieldMapping["eventName"];
    const shouldAskEventName =
      (importType === "mixed" || importType === "booking") && isEventNameMissing;

    if (shouldAskEventName) {
      setEventNamePromptOpen(true);
      return;
    }
    proceedSubmit();
  };

  const proceedSubmit = async () => {
    setIsLoading(true);

    const mappedData = processMappedData();

    const formData = new FormData();
    formData.append("data", JSON.stringify(mappedData));
    formData.append("importType", importType);
    formData.append("fileName", uploadedFile?.name || "Unknown.csv");

    try {
      const res = await axios.post(
        `${VITE_API}/api/import/import-excel`,
        formData
      );
      console.log(res.data.message || "Import complete");
      setUploadStep(2);
      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert("Import failed. Check console.");
    } finally {
      setIsLoading(false);
      setEventNamePromptOpen(false);
    }
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
    ],
  };

  const getRelevantFields = () => {
    if (importType === "mixed") {
      const all = [
        ...backendFieldOptions.user,
        ...backendFieldOptions.booking,
        ...backendFieldOptions.payment,
      ];
      const unique = [...new Set(all)];
      return { mixed: unique };
    } else {
      return {
        [importType]: backendFieldOptions[importType],
      };
    }
  };

  const importTypeDescriptions = {
    mixed: "Import users, bookings, and payment data all together",
    user: "Import only user profile information",
    booking: "Import only booking and event data",
    payment: "Import only payment and transaction data"
  };

  const getStepTitle = () => {
    switch (uploadStep) {
      case 0: return "Select File & Import Type";
      case 1: return "Map Your Data Fields";
      case 2: return "Import Complete";
      default: return "Import Data";
    }
  };

  const mappedFieldsCount = Object.keys(fieldMapping).filter(key => fieldMapping[key]).length;
  const totalFields = Object.values(getRelevantFields()).flat().length;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium text-purple-800">
            {getStepTitle()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white bg-opacity-60 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((uploadStep + 1) / 3) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium text-purple-700">
            Step {uploadStep + 1} of 3
          </span>
        </div>
      </div>

      {/* Step 0: Upload */}
      {uploadStep === 0 && (
        <div className="space-y-6">
          {/* Import Type Selection */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="text-purple-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">
                Choose Import Type
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(importTypeDescriptions).map(([type, description]) => (
                <label 
                  key={type}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    importType === type 
                      ? 'border-purple-600 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="importType"
                    value={type}
                    checked={importType === type}
                    onChange={(e) => setImportType(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-start gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1 ${
                      importType === type 
                        ? 'border-purple-600 bg-purple-600' 
                        : 'border-gray-400'
                    }`}>
                      {importType === type && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 capitalize">
                        {type === 'mixed' ? 'Mixed Data' : `${type} Only`}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {description}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <Upload className="text-purple-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">
                Upload CSV File
              </h3>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 mb-4">
                Select a CSV file to import your data
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={isLoading}
              />
              <label
                htmlFor="file-upload"
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                  isLoading 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                <Upload size={20} />
                {isLoading ? 'Processing...' : 'Choose CSV File'}
              </label>
              {uploadedFile && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {uploadedFile.name}
                </p>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="text-blue-600 mt-0.5" size={20} />
              <div>
                <h4 className="font-medium text-blue-800 mb-1">
                  File Requirements
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• File must be in CSV format</li>
                  <li>• First row should contain column headers</li>
                  <li>• Make sure data is clean and properly formatted</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Mapping */}
      {uploadStep === 1 && (
        <div className="space-y-6">
          {/* Progress Info */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="text-purple-600" size={20} />
                <span className="font-medium text-purple-800">
                  Field Mapping Progress
                </span>
              </div>
              <div className="text-sm text-purple-700">
                {mappedFieldsCount} of {totalFields} fields mapped
              </div>
            </div>
            <div className="mt-2 bg-white rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(mappedFieldsCount / totalFields) * 100}%` }}
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-amber-600 mt-0.5" size={20} />
              <div>
                <h4 className="font-medium text-amber-800 mb-1">
                  How to Map Fields
                </h4>
                <p className="text-sm text-amber-700">
                  Match each database field on the left with the corresponding column from your CSV file on the right. 
                  Leave fields unmapped if they don't exist in your CSV file.
                </p>
              </div>
            </div>
          </div>

          {/* Mapping Interface */}
          <div className="space-y-6">
            {Object.entries(getRelevantFields()).map(([section, fields]) => (
              <div key={section} className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 capitalize flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                  {section} Fields
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fields.map((field) => (
                    <div
                      key={field}
                      className="bg-white p-4 rounded-lg border border-gray-200"
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field}
                      </label>
                      <select
                        value={fieldMapping[field] || ""}
                        onChange={(e) =>
                          setFieldMapping({
                            ...fieldMapping,
                            [field]: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                      >
                        <option value="">-- Select CSV Column --</option>
                        {csvHeaders.map((header) => (
                          <option key={header} value={header}>
                            {header}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-colors ${
                isLoading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Start Import
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Success */}
      {uploadStep === 2 && (
        <div className="text-center py-12">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="text-green-600 w-10 h-10" />
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Import Completed Successfully!
          </h3>
          
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Your data has been successfully imported into the system. 
            You can now close this dialog and continue working.
          </p>
        </div>
      )}

      {/* Event Name Prompt Modal */}
      {eventNamePromptOpen && (
        <Dialog
          open={eventNamePromptOpen}
          onClose={() => setEventNamePromptOpen(false)}
          className="fixed z-50 inset-0 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen p-4 bg-black bg-opacity-50">
            <Dialog.Panel className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
                <Dialog.Title className="text-xl font-bold">
                  Event Name Required
                </Dialog.Title>
                <p className="text-purple-100 mt-2 text-sm">
                  Please provide an event name for your booking data
                </p>
              </div>
              
              <div className="p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name
                </label>
                <input
                  type="text"
                  value={manualEventName}
                  onChange={(e) => setManualEventName(e.target.value)}
                  placeholder="Enter event name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                />
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    onClick={() => setEventNamePromptOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      !manualEventName.trim()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                    onClick={proceedSubmit}
                    disabled={!manualEventName.trim()}
                  >
                    Confirm & Import
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default ImportContactModal;

