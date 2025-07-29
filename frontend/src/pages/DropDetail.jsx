import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ScheduledMessageModal from '../components/ScheduleMessageModal';

const DropDetail = () => {
  const { id } = useParams();
  const VITE_API = import.meta.env.VITE_API_URL;

  const [drop, setDrop] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null); // For editing

  useEffect(() => {
    const fetchDropDetails = async () => {
      try {
        const dropRes = await axios.get(`${VITE_API}/api/drops/${id}`);
        setDrop(dropRes.data);

        const messagesRes = await axios.get(`${VITE_API}/api/drops/messages/${id}`);
        setMessages(messagesRes.data.messages);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDropDetails();
  }, [id]);

  const handleDropUpdate = async () => {
    try {
      await axios.put(`${VITE_API}/api/drops/${id}`, drop);
      alert("Drop updated successfully");
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleAddScheduledMessage = async (msgData) => {
    try {
      if (editingMessage) {
        // EDIT Mode
        const res = await axios.put(`${VITE_API}/api/scheduled-message/${editingMessage._id}`, {
          message: msgData.message,
          channel: msgData.channel,
          scheduledAt: msgData.scheduledAt,
        });

        setMessages((prev) =>
          prev.map((m) => (m._id === editingMessage._id ? res.data.data : m))
        );
        alert("Message updated");
      } else {
        // ADD Mode
        const res = await axios.post(`${VITE_API}/api/scheduled-message/${msgData.dropId}`, {
          message: msgData.message,
          channel: msgData.channel,
          scheduledAt: msgData.scheduledAt,
        });

        setMessages((prev) => [res.data.data, ...prev]);
        alert("Message scheduled successfully");
      }

      setShowScheduleModal(false);
      setEditingMessage(null);
    } catch (err) {
      console.error('Error scheduling/editing message:', err?.response?.data || err.message);
      alert('Something went wrong');
    }
  };

  const handleEditScheduledMessage = (msg) => {
    setEditingMessage(msg); // Set current message to edit
    setShowScheduleModal(true);
  };

  const handleDeleteScheduledMessage = async (msgId) => {
    if (confirm("Are you sure you want to delete this scheduled message?")) {
      try {
        await axios.delete(`${VITE_API}/api/scheduled-message/${msgId}`);
        setMessages((prev) => prev.filter((msg) => msg._id !== msgId));
        alert("Message deleted");
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Failed to delete");
      }
    }
  };

  if (!drop) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Edit Drop</h2>
      <div className="space-y-4">
        <input
          className="border px-4 py-2 w-full"
          value={drop.name}
          onChange={(e) => setDrop({ ...drop, name: e.target.value })}
        />
        <textarea
          className="border px-4 py-2 w-full"
          value={drop.description}
          onChange={(e) => setDrop({ ...drop, description: e.target.value })}
        />
        <select
          className="border px-4 py-2"
          value={drop.status}
          onChange={(e) => setDrop({ ...drop, status: e.target.value })}
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
        </select>
        <button
          onClick={handleDropUpdate}
          className="bg-green-600 text-white px-4 py-2 rounded m-2"
        >
          Save Changes
        </button>

        <button
          onClick={() => {
            setEditingMessage(null); // Reset editing
            setShowScheduleModal(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Schedule Message
        </button>
      </div>

      <h3 className="text-xl font-semibold mt-8">Scheduled Messages</h3>
      <table className="min-w-full border border-gray-300 mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border">Channel</th>
            <th className="py-2 px-4 border">Message</th>
            <th className="py-2 px-4 border">Scheduled At</th>
            <th className="py-2 px-4 border">Status</th>
            <th className="py-2 px-4 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((msg) => (
            <tr key={msg._id}>
              <td className="py-2 px-4 border">{msg.channel}</td>
              <td className="py-2 px-4 border">{msg.message}</td>
              <td className="py-2 px-4 border">
                {new Date(msg.scheduledAt).toLocaleString()}
              </td>
              <td className="py-2 px-4 border">{msg.status}</td>
              <td className="py-2 px-4 border space-x-2">
                <button
                  onClick={() => handleEditScheduledMessage(msg)}
                  className="text-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteScheduledMessage(msg._id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ScheduledMessageModal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          setEditingMessage(null);
        }}
        onSubmit={handleAddScheduledMessage}
        defaultDropId={id}
        editData={editingMessage}
      />
    </div>
  );
};

export default DropDetail;
