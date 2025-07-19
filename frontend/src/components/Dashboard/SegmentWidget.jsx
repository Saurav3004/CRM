import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SegmentsWidget = () => {
  const [segments, setSegments] = useState(null);
  const VITE_API = import.meta.env.VITE_API_URL

  useEffect(() => {
    const fetchSegments = async () => {
      const { data } = await axios.get(`${VITE_API}/api/dashboard/segments`);
      setSegments(data);
      console.log("segments",data)
    };
    fetchSegments();
  }, []);

  if (!segments) return <p className="p-4">Loading segments...</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-bold mb-2">📍 Top Cities</h3>
        <ul>
          {segments?.byCity?.map(city => (
            <li key={city._id}>{city._id || 'Unknown'} – {city.count}</li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-bold mb-2">🚻 Gender</h3>
        <ul>
          {segments?.byGender?.map(g => (
            <li key={g._id}>{g._id || 'Unspecified'} – {g.count}</li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-bold mb-2">📬 Marketing Opt-In</h3>
        <ul>
          {segments?.marketingOptIn?.map(opt => (
            <li key={opt._id}>{opt._id ? 'Yes' : 'No'} – {opt.count}</li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-bold mb-2">🕓 Active Users (30 days)</h3>
        <p className="text-lg font-semibold">{segments.activeUsers}</p>
      </div>
    </div>
  );
};

export default SegmentsWidget;
