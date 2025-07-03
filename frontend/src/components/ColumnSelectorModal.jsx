import React from 'react';

export default function ColumnSelectorModal({ isOpen, onClose, selectedFields, onSave, allFields }) {
  const [localSelection, setLocalSelection] = React.useState(selectedFields);

  const toggleField = (key) => {
    if (localSelection.includes(key)) {
      setLocalSelection(localSelection.filter(f => f !== key));
    } else {
      setLocalSelection([...localSelection, key]);
    }
  };

  const handleSave = () => {
    onSave(localSelection);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Customize Columns</h2>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-white/60 rounded-full transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Select which columns to display in your table
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[50vh] overflow-y-auto">
          <div className="space-y-1">
            {allFields.map((field) => (
              <label 
                key={field.key} 
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-150 group"
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={localSelection.includes(field.key)}
                    onChange={() => toggleField(field.key)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-colors"
                  />
                  {localSelection.includes(field.key) && (
                    <svg className="absolute inset-0 w-4 h-4 text-blue-600 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="text-gray-700 group-hover:text-gray-900 transition-colors select-none">
                  {field.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {localSelection.length} of {allFields.length} selected
            </span>
            <div className="flex gap-3">
              <button 
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium" 
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 font-medium shadow-sm" 
                onClick={handleSave}
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}