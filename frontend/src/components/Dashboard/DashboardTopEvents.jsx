import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TopEvents = () => {
  const [topEvents, setTopEvents] = useState({ topByTickets: [], topByRevenue: [] });

  useEffect(() => {
    const fetchTopEvents = async () => {
      try {
        const { data } = await axios.get('http://localhost:3000/api/dashboard/top-events');
        setTopEvents(data);
      } catch (err) {
        console.error('Failed to fetch top events', err);
      }
    };
    fetchTopEvents();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* By Tickets */}
      <div className="bg-white shadow rounded-2xl p-5">
        <h3 className="text-lg font-semibold mb-4">🎟️ Top Events by Tickets Sold</h3>
        <ul className="space-y-3">
          {topEvents?.topByTickets?.map((ev, idx) => (
            <li key={idx} className="flex justify-between border-b pb-2 text-gray-700">
              <span className="font-medium">{ev._id}</span>
              <span>{ev.ticketsSold} Tickets</span>
            </li>
          ))}
        </ul>
      </div>

      {/* By Revenue */}
      <div className="bg-white shadow rounded-2xl p-5">
        <h3 className="text-lg font-semibold mb-4">💰 Top Events by Revenue</h3>
        <ul className="space-y-3">
          {topEvents?.topByRevenue?.map((ev, idx) => (
            <li key={idx} className="flex justify-between border-b pb-2 text-gray-700">
              <span className="font-medium">{ev._id}</span>
              <span>AUD {ev.totalRevenue.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TopEvents;
