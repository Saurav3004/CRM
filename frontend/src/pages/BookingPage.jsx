import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Ticket, Calendar, MapPin, DollarSign, CreditCard,
  QrCode, DivideSquare
} from 'lucide-react';
import axios from 'axios';

const BookingDetails = () => {
  const { bookingId } = useParams();
  const [data, setData] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:3000/api/booking/${bookingId}`)
      .then(res => setData(res.data))
      .catch(err => console.error('Failed to fetch booking:', err));
  }, [bookingId]);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : 'N/A';

  const groupTickets = (tickets) => {
    const grouped = {};
    tickets.forEach(t => {
      if (!grouped[t.ticketType]) {
        grouped[t.ticketType] = { count: 0, price: t.ticketPrice };
      }
      grouped[t.ticketType].count += 1;
    });
    return grouped;
  };

  const applyFilters = (tickets) => {
    return tickets.filter(t => {
      const statusMatch = statusFilter === 'All' || t.status === statusFilter;
      const typeMatch = !typeFilter || t.ticketType === typeFilter;
      const priceMatch =
        (!minPrice || t.ticketPrice >= Number(minPrice)) &&
        (!maxPrice || t.ticketPrice <= Number(maxPrice));
      return statusMatch && typeMatch && priceMatch;
    });
  };

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading booking details...</p>
        </div>
      </div>
  )

  const { booking, tickets, payments } = data;
  const grouped = groupTickets(tickets);
  const total = tickets.reduce((sum, t) => sum + t.ticketPrice, 0);

  // For dropdown options
  const ticketTypes = [...new Set(tickets.map(t => t.ticketType))];

  const filteredTickets = applyFilters(tickets);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Booking Details</h1>

      {/* Booking Info */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Booking Info</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-lg">
          <div><strong>Event:</strong> {booking.eventName}</div>
          <div><strong>Venue:</strong> {booking.venue}</div>
          <div><strong>Booked Date:</strong> {formatDate(booking.bookedDate)}</div>
          <div><strong>Total Tickets:</strong> {booking.quantity}</div>
          <div><strong>Total Paid:</strong> AUD {total}</div>
        </div>
      </div>

      {/* Ticket Breakdown */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">Ticket Breakdown</h2>
        {Object.entries(grouped).map(([type, info], i) => (
          <div key={i} className="flex justify-between items-center border-b py-2">
            <p><Ticket className="inline w-4 h-4 mr-2" /> {type}</p>
            <p>{info.count} × AUD {info.price} = <strong>AUD {info.count * info.price}</strong></p>
          </div>
        ))}
      </div>

      {/* Ticket Filters */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">Issued Tickets</h2>

        {/* Filter Inputs */}
        <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-4 mb-6">
          {/* Status Filter */}
          <select
            className="border rounded px-3 py-2"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Not Used">Not Used</option>
            <option value="Used">Used</option>
          </select>

          {/* Type Filter */}
          <select
            className="border rounded px-3 py-2"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            {ticketTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Min Price */}
          <input
            type="number"
            placeholder="Min Price"
            className="border rounded px-3 py-2"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
          />

          {/* Max Price */}
          <input
            type="number"
            placeholder="Max Price"
            className="border rounded px-3 py-2"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
          />
        </div>

        {/* Ticket List */}
        {filteredTickets.length === 0 ? (
          <p className="text-gray-500">No tickets match the filters.</p>
        ) : (
          filteredTickets.map(ticket => (
            <div key={ticket._id} className="border p-4 rounded-lg mb-3">
              <div className="flex items-center justify-between">
                <p><Ticket className="inline w-4 h-4 mr-1" /> <strong>{ticket.ticketCode}</strong></p>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{ticket.status}</span>
              </div>
              <div className="text-sm mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div><MapPin className="inline w-4 h-4 mr-1" /> {ticket.eventName}</div>
                <div><DollarSign className="inline w-4 h-4 mr-1" /> AUD {ticket.ticketPrice}</div>
                
                <div><DivideSquare className="inline w-4 h-4 mr-1" /> {ticket.ticketType}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Payments */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Payments</h2>
        {payments.length === 0 ? (
          <p className="text-gray-500">No payments found.</p>
        ) : (
          payments.map(payment => (
            <div key={payment._id} className="border p-4 rounded-lg mb-3">
              <div className="flex items-center justify-between">
                <p><CreditCard className="inline w-4 h-4 mr-1" /> #{payment.paymentId}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                  payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>{payment.status}</span>
              </div>
              <div className="text-sm mt-2 grid grid-cols-2 gap-2">
                <div>Method: {payment.method}</div>
                <div>Amount: AUD {payment.amount}</div>
                <div>Date: {formatDate(payment.transactionDate)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BookingDetails;
