// src/pages/SubscriptionSuccess.jsx

import React from "react";
import { useParams, Link } from "react-router-dom";

const SubscriptionSuccess = () => {
  const { slug } = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-xl p-8 max-w-xl w-full text-center">
        <h1 className="text-3xl font-bold text-purple-700 mb-4">🎉 You're In!</h1>

        <p className="text-gray-700 mb-4">
          Thanks for subscribing to <strong>{slug.replace(/-/g, " ")}</strong>.
        </p>

        <p className="text-gray-600 mb-4">
          We'll keep you updated. Stay tuned for exclusive content and announcements.
        </p>

        <p className="text-gray-500 text-sm mt-2">
          📬 Please check your inbox to confirm your email and get updates.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
          <a
            href={`https://twitter.com/share?text=I just joined the drop!&url=https://yourdomain.com/subscribe/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold"
          >
            Share on Twitter
          </a>

          <a
            href={`https://calendar.google.com/calendar/u/0/r/eventedit?text=${slug.replace(/-/g, " ")}+Drop&details=Stay+tuned+for+updates&dates=20250101T190000Z/20250101T193000Z`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg font-semibold"
          >
            Add to Calendar
          </a>
        </div>

        <a
          href="https://instagram.com/bollywoodclubx"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-sm text-pink-600 hover:underline"
        >
          💬 Follow & DM us @yourhandle to get updates via Instagram DMs!
        </a>

        <div className="mt-8">
          <Link to="/" className="text-sm text-purple-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
