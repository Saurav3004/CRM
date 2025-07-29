import React, { useState } from 'react';

const ScheduledMessageModal = ({ isOpen, onClose, onSubmit, defaultDropId }) => {
  const [messageData, setMessageData] = useState({
    dropId: defaultDropId || '',
    message: '',
    channel: 'email',
    scheduledAt: '',
    status: 'scheduled'
  });

  const handleChange = (e) => {
    setMessageData({ ...messageData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!messageData.dropId || !messageData.message || !messageData.scheduledAt) {
      alert("All fields are required");
      return;
    }
    onSubmit(messageData);
    setMessageData({
      dropId: defaultDropId || '',
      message: '',
      channel: 'email',
      scheduledAt: '',
      status: 'scheduled'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90%] md:w-[500px]">
        <h2 className="text-xl font-bold mb-4">Add Scheduled Message</h2>

        <label className="block mb-2">
          Channel:
          <select
            name="channel"
            value={messageData.channel}
            onChange={handleChange}
            className="border px-3 py-2 w-full"
          >
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
          </select>
        </label>

        <label className="block mb-2">
          Message:
          <textarea
            name="message"
            value={messageData.message}
            onChange={handleChange}
            className="border px-3 py-2 w-full"
          />
        </label>

        <label className="block mb-2">
          Scheduled At:
          <input
            type="datetime-local"
            name="scheduledAt"
            value={messageData.scheduledAt}
            onChange={handleChange}
            className="border px-3 py-2 w-full"
          />
        </label>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="bg-gray-300 text-black px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduledMessageModal;
