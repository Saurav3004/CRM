// EventbriteIntegration.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, 
  Users, 
  Link, 
  RefreshCw, 
  Zap, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  ExternalLink,
  Activity,
  AlertCircle,
  Download,
  Settings,
  Power,
  Loader2
} from 'lucide-react';

const EventbriteIntegration = () => {
  const [events, setEvents] = useState([]);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [syncingEventId, setSyncingEventId] = useState('');
  const [url, setUrl] = useState("");
  const VITE_API = import.meta.env.VITE_API_URL
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlUserId = params.get('userId');
    const storedUserId = localStorage.getItem('userId');
    const resolvedUserId = urlUserId || storedUserId;

    if (resolvedUserId) {
      // Check if actually connected before setting
      axios.get(`${VITE_API}/api/integrate/eventbrite/status`, {
        params: { userId: resolvedUserId }
      }).then((res) => {
        if (res.data.connected) {
          setUserId(resolvedUserId);
          localStorage.setItem('userId', resolvedUserId);
          loadEvents(resolvedUserId);
        } else {
          // ❌ Not connected, clear everything
          localStorage.removeItem('userId');
          setUserId('');
          setEvents([]);
        }
      }).catch((err) => {
        console.error('Error checking connection status:', err);
        setUserId('');
      });
    }
  }, []);

  const connectWithEventbrite = () => {
    window.open(
      `${VITE_API}/api/integrate/eventbrite/connect`,
      'eventbritePopup',
      'width=600,height=700'
    );
  };

  const disconnect = async () => {
    try {
      await axios.post(`${VITE_API}/api/integrate/eventbrite/disconnect`, {
        userId,
      });

      localStorage.removeItem('userId');
      setUserId('');
      setEvents([]);
      setSyncMessage('🔌 Disconnected from Eventbrite.');

      // 🧹 Remove query params like ?userId=xxxx
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      console.error('Disconnect failed:', err);
      setSyncMessage('❌ Failed to disconnect.');
    }
  };

  const loadEvents = async (id) => {
    setLoading(true);
    setSyncMessage('');
    try {
      const res = await axios.get(`${VITE_API}/api/integrate/eventbrite/organizer-events`, {
        params: { userId: id }
      });
      setEvents(res.data.events || []);
    } catch (err) {
      console.error(err);
      console.log('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const syncEvent = async (eventId) => {
    setSyncingEventId(eventId);
    setSyncMessage('');
    try {
      const res = await axios.post(`${VITE_API}/api/integrate/eventbrite/sync-event`, {
        eventId,
        userId
      });
      setSyncMessage(res.data.message || 'Synced successfully.');
    } catch (err) {
      console.error('Sync failed:', err);
      setSyncMessage('Sync failed.');
    } finally {
      setSyncingEventId('');
    }
  };

  const getMessageStyle = (message) => {
    if (message.includes('✅') || message.includes('successfully')) {
      return 'bg-green-50 text-green-800 border-green-200';
    } else if (message.includes('❌') || message.includes('failed')) {
      return 'bg-red-50 text-red-800 border-red-200';
    } else if (message.includes('🔌')) {
      return 'bg-blue-50 text-blue-800 border-blue-200';
    }
    return 'bg-gray-50 text-gray-800 border-gray-200';
  };

  const getMessageIcon = (message) => {
    if (message.includes('✅') || message.includes('successfully')) {
      return <CheckCircle className="text-green-600" size={20} />;
    } else if (message.includes('❌') || message.includes('failed')) {
      return <XCircle className="text-red-600" size={20} />;
    } else if (message.includes('🔌')) {
      return <Power className="text-blue-600" size={20} />;
    }
    return <AlertCircle className="text-gray-600" size={20} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Eventbrite Integration</h1>
                <p className="text-gray-600 mt-1">Sync your events and manage attendees seamlessly</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-600">Live Integration</span>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        {!userId ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Link className="text-purple-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Connect Your Eventbrite Account</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Link your Eventbrite account to sync events and manage attendees directly from your CRM
              </p>
              <button
                onClick={connectWithEventbrite}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-orange-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Link size={20} className="mr-2" />
                Connect with Eventbrite
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Connected Successfully</h3>
                  <p className="text-sm text-gray-600">User ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{userId}</span></p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => loadEvents(userId)}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 size={16} className="mr-2 animate-spin" />
                  ) : (
                    <RefreshCw size={16} className="mr-2" />
                  )}
                  {loading ? 'Loading...' : 'Reload Events'}
                </button>
                <button
                  onClick={disconnect}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Power size={16} className="mr-2" />
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-lg font-medium text-gray-700">Loading your events...</p>
            </div>
          </div>
        )}

        {/* Sync Message */}
        {syncMessage && (
          <div className={`rounded-xl border p-4 mb-8 ${getMessageStyle(syncMessage)}`}>
            <div className="flex items-center space-x-3">
              {getMessageIcon(syncMessage)}
              <p className="font-medium">{syncMessage}</p>
            </div>
          </div>
        )}

        {/* Events Grid */}
        {events.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Events</h2>
                <p className="text-gray-600 mt-1">{events.length} events found</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Activity size={16} />
                <span>Auto-sync enabled</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg flex items-center justify-center">
                        <Calendar className="text-white" size={20} />
                      </div>
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                    
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                      {event.name}
                    </h3>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                      <Clock size={14} />
                      <span>{event.start}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
                      <Users size={14} />
                      <span>Attendees available</span>
                    </div>
                  </div>
                  
                  <div className="px-6 pb-6">
                    <button
                      onClick={() => syncEvent(event.id)}
                      className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                        syncingEventId === event.id
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-orange-500 text-white hover:from-purple-700 hover:to-orange-600 shadow-md hover:shadow-lg'
                      }`}
                      disabled={syncingEventId === event.id}
                    >
                      {syncingEventId === event.id ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Loader2 size={16} className="animate-spin" />
                          <span>Syncing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <Download size={16} />
                          <span>Sync Attendees</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {userId && !loading && events.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No Events Found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You don't have any events in your Eventbrite account yet, or they haven't loaded properly.
            </p>
            <button
              onClick={() => loadEvents(userId)}
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              <RefreshCw size={16} className="mr-2" />
              Try Again
            </button>
          </div>
        )}

        

        {/* Integration Info */}
        <div className="bg-gradient-to-r from-purple-600 to-orange-500 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              
              <h3 className="text-xl font-bold mb-2">Integration Benefits</h3>
              <ul className="space-y-2 text-purple-100">
                <li className="flex items-center space-x-2">
                  <CheckCircle size={16} />
                  <span>Automatic attendee synchronization</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle size={16} />
                  <span>Real-time event updates</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle size={16} />
                  <span>Centralized contact management</span>
                </li>
              </ul>
            </div>
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Zap className="text-white" size={32} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventbriteIntegration;