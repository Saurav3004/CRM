import React, { useEffect, useState } from 'react';
import {
  User, Mail, Phone, MapPin, Calendar, Ticket,
  TrendingUp, Instagram, Music, Headphones, Star, Award, DollarSign, Users, Cake
} from 'lucide-react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const UserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/user/${id}`);
      setUser(res.data.user);
    } catch (error) {
      console.error('Failed to fetch user', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
    
  }, [id]);

  console.log(user)
  const formatDate = (date) => {
    if(!date) return 'Not Provided';
    const d = new Date(date);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : 'N/A';
  };

  const formatGender = (gender) => {
    if (!gender) return 'Not specified';
    return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  };

  const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <div className={`${bgColor} p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-all`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('800', '100')}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  const SocialLink = ({ icon: Icon, platform, username, color }) => (
    <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
      <div className={`p-2 rounded-full ${color}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-800">{platform}</p>
        <p className="text-sm text-gray-600">{username || 'Not connected'}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">User Not Found</h2>
          <p className="text-gray-600">This profile could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-start space-x-6">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <User className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User'}
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-600">
                <div className="flex items-center space-x-2"><Mail className="w-4 h-4" /><span>{user.email}</span></div>
                <div className="flex items-center space-x-2"><Phone className="w-4 h-4" /><span>{user.mobile || 'Not provided'}</span></div>
                <div className="flex items-center space-x-2"><MapPin className="w-4 h-4" /><span>{[user.city, user.state, user.country].filter(Boolean).join(', ')}</span></div>
                <div className="flex items-center space-x-2"><Calendar className="w-4 h-4" /><span>{formatDate(user.dob)}</span></div>
                <div className="flex items-center space-x-2"><Cake className="w-4 h-4" /><span>Age: {calculateAge(user.dob)}</span></div>
                <div className="flex items-center space-x-2"><Users className="w-4 h-4" /><span>{formatGender(user.gender)}</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={Ticket} label="Total Tickets" value={user.ticketsPurchased || 0} color="text-purple-800" bgColor="bg-purple-50" />
          <StatCard icon={Star} label="Events Attended" value={user.eventsPurchased || 0} color="text-blue-800" bgColor="bg-blue-50" />
          <StatCard icon={DollarSign} label="Total Spent" value={`${user.payments[0].currency} ${(user.totalSpent).toFixed(2) || 0}`} color="text-green-800" bgColor="bg-green-50" />
          <StatCard icon={Award} label="Member Since" value={user.createdAt ? new Date(user.createdAt).getFullYear() : 'N/A'} color="text-orange-800" bgColor="bg-orange-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Social */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center"><TrendingUp className="w-5 h-5 mr-2" /> Social Media</h3>
            <div className="space-y-4">
              <SocialLink icon={Instagram} platform="Instagram" username={user.socialMedia?.instagram} color="bg-pink-500" />
              <SocialLink icon={Music} platform="TikTok" username={user.socialMedia?.tiktok} color="bg-black" />
              <SocialLink icon={Headphones} platform="Spotify" username={user.socialMedia?.spotify} color="bg-green-500" />
            </div>
          </div>

          {/* Right: Bookings */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center"><Ticket className="w-5 h-5 mr-2" /> Booking History ({user.bookings.length})</h3>
            {!user.bookings || user.bookings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No bookings found for this user.</div>
            ) : (
              <div>
                {user.bookings.map((booking, index) => (
                  <Link to={`/user/booking/${booking.bookingId}`} key={index}>
                    <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition cursor-pointer mb-1">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-800">{booking.eventName || 'N/A'}</h4>
                        <span className="text-sm text-gray-500">#{booking.bookingId}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div><p className="text-gray-500">Venue</p><p className="font-medium">{booking.venue || 'N/A'}</p></div>
                        
                        <div><p className="text-gray-500">Quantity</p><p className="font-medium">{booking.quantity ?? '0'}</p></div>
                        <div><p className="text-gray-500">Booked Date</p><p className="font-medium">{formatDate(booking.bookedDate)}</p></div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
