import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MarketingModal = ({ users, onClose }) => {
  const [channel, setChannel] = useState('email');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      alert("Message cannot be empty");
      return;
    }

    if (!users.length) {
      alert("No users selected for messaging");
      return;
    }

    setLoading(true);
    try {
      const userIds = users.map(u => u._id);
      await axios.post('http://localhost:3000/api/marketing/send', {
        userIds,
        channel,
        message,
      });

      setSuccess(true);
      setMessage('');
    } catch (err) {
      alert('❌ Failed to send messages.');
    } finally {
      setLoading(false);
    }
  };

  // Auto clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Helper for preview value
  const getPreviewValue = (u) => {
    switch (channel) {
      case 'sms':
      case 'whatsapp':
        return `📱 ${u.mobile || 'No Number'}`;
      default:
        return `📧 ${u.email}`;
    }
  };

  const getChannelIcon = (channelType) => {
    switch (channelType) {
      case 'email':
        return '📧';
      case 'sms':
        return '📱';
      case 'whatsapp':
        return '💬';
      default:
        return '📧';
    }
  };

  const getChannelColor = (channelType) => {
    switch (channelType) {
      case 'email':
        return 'from-blue-500 to-indigo-600';
      case 'sms':
        return 'from-green-500 to-emerald-600';
      case 'whatsapp':
        return 'from-green-400 to-green-600';
      default:
        return 'from-blue-500 to-indigo-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-3xl shadow-2xl max-w-xl w-full border border-white/20 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200 to-blue-200 rounded-full -translate-y-16 translate-x-16 opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-200 to-emerald-200 rounded-full translate-y-12 -translate-x-12 opacity-30"></div>
        
        {/* Header Section */}
        <div className="relative z-10 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl">
                <span className="text-white text-xl">📢</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Marketing Campaign
                </h2>
                <p className="text-gray-600 text-sm">
                  Send targeted messages to your audience
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <span className="text-2xl text-gray-400 hover:text-gray-600">×</span>
            </button>
          </div>
          
          {/* Audience Stats */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-2 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="p-1 bg-white rounded-xl shadow-sm">
                <span className="text-blue-600 text-xl">👥</span>
              </div>
              <div className='flex items-center justify-center gap-4'>
                <p className="text-2xl font-bold text-gray-800">
                  {users.length.toLocaleString()}
                </p>
                <p className="text-gray-600 text-sm">
                  Opted-in {users.length === 1 ? 'recipient' : 'recipients'} ready to receive your message
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Channel Selector */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            📡 Select Channel
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['email', 'sms', 'whatsapp'].map(opt => (
              <button
                key={opt}
                className={`relative overflow-hidden p-2 rounded-2xl text-center transition-all duration-300 transform hover:scale-105 ${
                  channel === opt
                    ? `bg-gradient-to-r ${getChannelColor(opt)} text-white shadow-lg`
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
                onClick={() => setChannel(opt)}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xl">{getChannelIcon(opt)}</span>
                  <span className="font-semibold capitalize">{opt}</span>
                </div>
                {channel === opt && (
                  <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Recipients Preview */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            🎯 Recipients Preview
          </label>
          <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
            <div className="max-h-32 overflow-y-auto p-3 space-y-2">
              {users.map((u, index) => (
                <div key={u._id} className="flex items-center gap-3 py-2 px-3 bg-white rounded-xl shadow-sm">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {u.firstName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {u.firstName} {u.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {getPreviewValue(u)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            ✍️ Compose Message
          </label>
          <div className="relative">
            <textarea
              rows={5}
              className="w-full border-2 border-gray-200 rounded-2xl p-4 text-gray-700 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none resize-none"
              placeholder="Craft your engaging message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {message.length}/500
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            disabled={loading || !message.trim() || users.length === 0}
            onClick={handleSend}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              loading || !message.trim() || users.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <span className="text-lg">🚀</span>
                <span>Send Campaign</span>
              </>
            )}
          </button>
        </div>

        {/* Success Feedback */}
        {success && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-xl">
                <span className="text-green-600 text-lg">✅</span>
              </div>
              <div>
                <p className="text-green-800 font-semibold">Campaign Sent Successfully!</p>
                <p className="text-green-600 text-sm">Your message has been delivered to all recipients.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketingModal;