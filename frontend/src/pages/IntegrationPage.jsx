import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EventbriteIntegration = () => {
  const [userId, setUserId] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const connectEventbrite = () => {
    window.location.href = 'http://localhost:3000/api/integrate/eventbrite/connect';
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const uid = params.get('userId');
    if (uid) {
      setUserId(uid);
      fetchEvents(uid);
    }
  }, []);

  const fetchEvents = async (uid) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:3000/api/integrate/eventbrite/events?userId=${uid}`);
      setEvents(res.data.events || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      alert('No events found or error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Eventbrite Integration</h1>

      {!userId ? (
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded"
          onClick={connectEventbrite}
        >
          Connect with Eventbrite
        </button>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-4">Connected as: {userId}</p>

          {loading ? (
            <p className="text-gray-500">Loading events...</p>
          ) : events.length > 0 ? (
            <div>
              <h2 className="text-xl font-semibold mb-2">Your Events:</h2>
              {events.map(e => (
                <div key={e.id} className="border p-3 rounded mb-2">
                  <h3 className="font-bold">{e.name}</h3>
                  <p className="text-sm text-gray-600">{e.start}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No events found.</p>
          )}
        </>
      )}
    </div>
  );
};

export default EventbriteIntegration;
