import React, { useState } from "react";
import axios from "axios";

const VITE_API = import.meta.env.VITE_API_URL;

const CreateDropModal = ({ onClose }) => {
  const [form, setForm] = useState({ 
    name: "", 
    description: "", 
    tags: "", 
    keywords: "" 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publicLink, setPublicLink] = useState("");
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...form,
        tags: form.tags.split(",").map((tag) => tag.trim()),
        keywords: form.keywords.split(",").map((kw) => kw.trim()),
      };

      const { data } = await axios.post(`${VITE_API}/api/drops`, payload);
      const link = `${window.location.origin}/subscribe/${data.slug}`;
      setPublicLink(link);
    } catch (error) {
      console.error("Drop creation error:", error);
      alert("Failed to create drop. Please try again.");
    }

    setIsSubmitting(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"
          onClick={onClose}
        >
          ❌
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-2">🎉 Create New Drop</h2>
        <p className="text-gray-500 mb-6 text-sm">
          Create a campaign landing page to collect leads for a specific artist or event.
        </p>

        {publicLink ? (
          <div className="bg-green-100 p-4 rounded-lg text-green-800 border border-green-200 relative">
            <p className="font-medium mb-2">✅ Drop Created Successfully!</p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-sm break-all">
                <strong>Public Link:</strong> {publicLink}
              </p>
              <button
                onClick={handleCopy}
                className="mt-2 sm:mt-0 px-4 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                {copied ? "✅ Copied!" : "📋 Copy"}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Drop Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Justin Bieber India Tour"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Short note about this drop..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="concert, vip, india"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keywords (comma separated)
              </label>
              <input
                type="text"
                name="keywords"
                value={form.keywords}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="tickets, pass, link, vip"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
            >
              {isSubmitting ? "Creating Drop..." : "🚀 Create Drop"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateDropModal;
