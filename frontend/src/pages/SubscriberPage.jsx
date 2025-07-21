import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const VITE_API = import.meta.env.VITE_API_URL;

const SubscribePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [drop, setDrop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    tags: "",
  });
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    axios
      .get(`${VITE_API}/api/drops/slug/${slug}`)
      .then((res) => setDrop(res.data.drop))
      .catch(() => setDrop(null));
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const payload = {
        ...formData,
        tags: formData.tags
          ? formData.tags.split(",").map((t) => t.trim())
          : [],
      };

      await axios.post(`${VITE_API}/api/drops/${slug}/subscribe`, payload);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        city: "",
        tags: "",
      });
      navigate(`/subscribe/${slug}/success`);
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message || "Subscription failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (drop === null) {
    return (
      <div className="p-8 text-center text-red-600">
        Invalid or expired drop link.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full">
        <h1 className="text-2xl font-bold mb-2 text-purple-700">{drop?.name}</h1>
        <p className="text-gray-600 mb-6">{drop?.description}</p>

        {successMsg ? (
          <div className="bg-green-100 text-green-800 p-4 rounded-lg">
            {successMsg}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="bg-red-100 text-red-800 p-3 rounded-md">
                {errorMsg}
              </div>
            )}

            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
              placeholder="Your full name"
            />

            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
              placeholder="you@example.com"
            />

            <div className="relative z-50">
              <PhoneInput
                country={'in'}
                value={formData.phone}
                onChange={(phone) =>
                  setFormData({ ...formData, phone })
                }
                inputStyle={{
                  width: '100%',
                  height: '44px',
                  paddingLeft: '48px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                }}
                buttonStyle={{
                  border: 'none',
                  background: 'none',
                  padding: '0 8px',
                  margin: 0,
                }}
                containerStyle={{
                  width: '100%',
                  position: 'relative',
                  zIndex: 50,
                }}
                dropdownStyle={{
                  zIndex: 9999,
                  maxHeight: '200px',
                  overflowY: 'auto',
                }}
              />
            </div>

            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
              placeholder="City (optional)"
            />

            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
              placeholder="Tags (comma-separated)"
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-md font-semibold transition-all duration-200 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              }`}
            >
              {loading ? (
                <span className="flex justify-center items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Subscribe"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SubscribePage;
