import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DashboardRecent = () => {
  const [recent, setRecent] = useState({ recentUsers: [], recentBookings: [] });
  const VITE_API = import.meta.env.VITE_API_URL

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const { data } = await axios.get(`${VITE_API}/api/dashboard/recent`);
        setRecent(data);
      } catch (err) {
        console.error('Failed to fetch recent data:', err);
      }
    };
    fetchRecent();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Recent Users */}
      <div className="bg-white rounded-2xl shadow p-5">
        <h3 className="text-lg font-semibold mb-4">👥 Recent Users</h3>
        <ul className="space-y-3">
          {recent?.recentUsers?.map((user) => (
            <li key={user._id} className="border-b pb-2">
              <p className="font-medium text-gray-800">
                {user.firstName} {user.lastName || ''}
              </p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-xs text-gray-400">
                Joined: {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl shadow p-5">
        <h3 className="text-lg font-semibold mb-4">🎟️ Recent Bookings</h3>
        <ul className="space-y-3">
          {recent?.recentBookings?.map((booking) => (
            <li key={booking._id} className="border-b pb-2">
              <p className="font-medium text-gray-800">{booking.eventName}</p>
              <p className="text-sm text-gray-500">
                {booking.user?.firstName} ({booking.user?.email})
              </p>
              <p className="text-xs text-gray-400">
                AUD {booking.totalPaid} | {new Date(booking.bookedDate).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DashboardRecent;
