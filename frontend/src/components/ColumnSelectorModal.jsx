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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md w-96 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Select Columns to Display</h2>
        <div className="space-y-2">
          {allFields.map((field) => (
            <label key={field.key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localSelection.includes(field.key)}
                onChange={() => toggleField(field.key)}
              />
              {field.label}
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>Cancel</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleSave}>OK</button>
        </div>
      </div>
    </div>
  );
}
