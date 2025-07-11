import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FunnelWidget = () => {
  const [funnel, setFunnel] = useState(null);
  const VITE_API = import.meta.env.VITE_API_URL

  useEffect(() => {
    const fetchFunnel = async () => {
      const { data } = await axios.get(`${VITE_API}/api/dashboard/funnel`);
      setFunnel(data);
    };
    fetchFunnel();
  }, []);

  if (!funnel) return <p className="p-4">Loading funnel...</p>;

  const stages = [
    { label: "👥 Total Users", value: funnel.totalUsers },
    { label: "📥 Bookings Made", value: funnel.withBookings },
    { label: "💰 Payments Done", value: funnel.withPayments },
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">🔻 Revenue Funnel</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stages.map((stage, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow p-4 text-center">
            <h4 className="text-lg font-semibold">{stage.label}</h4>
            <p className="text-2xl font-bold text-indigo-600">{stage.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FunnelWidget;
