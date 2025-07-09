import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SpenderInsights = () => {
  const [topUser, setTopUser] = useState(null);
  const [topCities, setTopCities] = useState([]);

  useEffect(() => {
    const fetchSpenders = async () => {
      try {
        const { data } = await axios.get('http://localhost:3000/api/dashboard/spender-insights');
        console.log(data)
        setTopUser(data.topUser);
        setTopCities(data.topCities);
      } catch (err) {
        console.error('Error fetching spender data:', err);
      }
    };
    fetchSpenders();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      {/* 💰 Top User */}
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">💰 Top Paying User</h3>
        {topUser ? (
          <div>
            <p className="text-lg font-medium">{topUser.firstName} {topUser.lastName}</p>
            <p className="text-gray-500 text-sm">{topUser.email}</p>
            <p className="text-gray-500 text-sm">City: {topUser.city || 'Unknown'}</p>
            <p className="text-green-600 font-bold text-xl mt-2">AUD {topUser.totalSpent.toFixed(2)}</p>
          </div>
        ) : (
          <p>No top spender found</p>
        )}
      </div>

      {/* 🏙️ Top Cities */}
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">🏙️ Top Cities by Revenue</h3>
        <ul className="space-y-2">
          {topCities.map((city, i) => (
            <li key={i} className="flex justify-between text-sm border-b pb-1">
              <span>{city._id || 'Unknown'}</span>
              <span className="text-green-700 font-medium">AUD {city.totalSpent.toFixed(0)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SpenderInsights;
