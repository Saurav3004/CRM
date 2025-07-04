import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EventbriteIntegration = () => {
  const [events, setEvents] = useState([]);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [syncingEventId, setSyncingEventId] = useState('');

  // Extract userId from URL and load events
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('userId');
    if (id) {
      setUserId(id);
      loadEvents(id);
    }
  }, []);

  const connectWithEventbrite = () => {
    const popup = window.open(
      'http://localhost:3000/api/integrate/eventbrite/connect',
      'eventbritePopup',
      'width=600,height=700'
    );
  };

  const loadEvents = async (id) => {
    setLoading(true);
    setSyncMessage('');
    try {
      const res = await axios.get('http://localhost:3000/api/integrate/eventbrite/organizer-events', {
        params: { userId: id }
      });
      setEvents(res.data.events || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const syncEvent = async (eventId) => {
    setSyncingEventId(eventId);
    setSyncMessage('');
    try {
      const res = await axios.post('http://localhost:3000/api/integrate/eventbrite/sync-event', {
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

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">🎟️ Eventbrite Integration</h1>

      {!userId ? (
        <button
          onClick={connectWithEventbrite}
          className="bg-purple-700 text-white px-4 py-2 rounded"
        >
          Connect with Eventbrite
        </button>
      ) : (
        <div>
          <p className="text-gray-600 mb-4">✅ Connected as user ID: {userId}</p>
          <button
            onClick={() => loadEvents(userId)}
            className="bg-green-600 text-white px-4 py-2 rounded mb-4"
          >
            Load My Events
          </button>
        </div>
      )}

      {loading && <p className="text-blue-500">🔄 Loading events...</p>}

      {syncMessage && (
        <div className="my-3 text-sm font-semibold text-green-600">{syncMessage}</div>
      )}

      {events.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Your Events</h2>
          <div className="flex gap-6 flex-wrap">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex flex-col justify-between border border-gray-400 shadow-md rounded p-4 w-64 h-60"
              >
                <div>
                  <p className="font-bold mb-1">{event.name}</p>
                  <p className="text-sm text-gray-500 mb-4">{event.start}</p>
                </div>
                <button
                  onClick={() => syncEvent(event.id)}
                  className={`px-3 py-1 rounded text-white ${
                    syncingEventId === event.id
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  disabled={syncingEventId === event.id}
                >
                  {syncingEventId === event.id ? 'Syncing...' : 'Sync Attendees'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventbriteIntegration;
