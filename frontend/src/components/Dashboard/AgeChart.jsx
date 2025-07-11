import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const AgeChart = () => {
  const [data, setData] = useState([]);
  const VITE_API = import.meta.env.VITE_API_URL

  useEffect(() => {
    const fetchAges = async () => {
      const { data } = await axios.get(`${VITE_API}/api/dashboard/age-distribution`);
      console.log(data)
      const formatted = Object.entries(data).map(([group, count]) => ({ group, count }));
      setData(formatted);
    };
    fetchAges();
  }, []);

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl">
      <h2 className="text-xl font-bold mb-4">📊 Age Group Distribution</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="group" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#6366F1" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AgeChart;
