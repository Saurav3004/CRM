import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';

const DashboardCharts = ({ chartData }) => {
  const { revenueOverTime, bookingsPerEvent, userGrowth } = chartData;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
      {/* Revenue Over Time */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-bold mb-4">💰 Revenue Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueOverTime}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#6F44FF" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bookings Per Event */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-bold mb-4">📅 Bookings Per Event</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={bookingsPerEvent}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="event" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="bookings" fill="#6F44FF" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* User Growth */}
      <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-2">
        <h3 className="text-lg font-bold mb-4">📈 User Growth Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={userGrowth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="users" stroke="#34D399" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardCharts;
