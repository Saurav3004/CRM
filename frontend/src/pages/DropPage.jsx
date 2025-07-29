import React, { useEffect, useState } from "react";
import axios from "axios";
import {useNavigate} from 'react-router-dom'

const DropPage = () => {
  const VITE_API = import.meta.env.VITE_API_URL;
  const [drops, setDrops] = useState([]);

  const navigate = useNavigate();

const handleDelete = async (dropId) => {
  if (confirm("Are you sure you want to delete this drop?")) {
    try {
      await axios.delete(`${VITE_API}/api/drops/${dropId}`);
      setDrops(drops.filter(drop => drop._id !== dropId));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }
};


  useEffect(() => {
    axios
      .get(`${VITE_API}/api/drops/alldrops`)
      .then((response) => {
        console.log(response.data);
        setDrops(response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);



  return (
    <div className="p-4 overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4">All Drops</h2>
      <table className="min-w-full border border-gray-300 rounded overflow-hidden">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="py-2 px-4 border">Drop Name</th>
            <th className="py-2 px-4 border">Channel</th>
            <th className="py-2 px-4 border">Scheduled At</th>
            <th className="py-2 px-4 border">Subscribers</th>
            <th className="py-2 px-4 border">Status</th>
            <th className="py-2 px-4 border">Created At</th>
            <th className="py-2 px-4 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {drops.map((drop) => (
            <tr key={drop._id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border">{drop.name || "—"}</td>
              <td className="py-2 px-4 border capitalize">{drop.channel}</td>
              <td className="py-2 px-4 border">
                {new Date(drop.scheduledAt).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  hour12: true,
                })}
              </td>
              <td className="py-2 px-4 border">{drop.subscribersCount}</td>
              <td className="py-2 px-4 border capitalize">{drop.status}</td>
              <td className="py-2 px-4 border">
                {new Date(drop.createdAt).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  hour12: true,
                })}
              </td>
              <td className="py-2 px-4 border">
                <button
                  onClick={() => navigate(`/drops/${drop._id}`)}
                  className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                >
                  View
                </button>
                <button
                  onClick={() => handleDelete(drop._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DropPage;
