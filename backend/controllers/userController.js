import { User } from '../models/userModel.js';
import { Booking } from '../models/bookingModel.js';
import { Payment } from '../models/paymentModel.js';

// 🧠 Fetch all users with aggregated booking details
export const getAllUsersWithDetails = async (req, res) => {
  try {
    const users = await User.find({}).lean();

    const enrichedUsers = await Promise.all(users.map(async (user) => {
      const bookings = await Booking.find({ user: user._id }).lean();

      const totalTicketsPurchased = bookings.reduce((sum, b) => sum + (b.quantity || 0), 0);
      const uniqueEvents = new Set(bookings.map(b => b.eventName)).size;

      return {
        ...user,
        bookings,
        totalSpent: user.totalSpent || 0,
        totalTicketsPurchased,
        totalUniqueEvents: uniqueEvents,
      };
    }));

    res.status(200).json({ users: enrichedUsers });
  } catch (error) {
    console.error("Fetch Users Error:", error);
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

// 🧾 Get user profile by ID with bookings & payments
export const getUserProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const bookings = await Booking.find({ user: id }).lean();
    const payments = await Payment.find({ user: id }).lean();

    const totalTicketsPurchased = bookings.reduce((sum, b) => sum + (b.quantity || 0), 0);
    const totalUniqueEvents = new Set(bookings.map(b => b.eventName)).size;
    const totalSpent = user.totalSpent || 0;

    const formattedBookings = bookings.map(b => ({
      bookingId: b.bookingId,
      eventName: b.eventName || 'N/A',
      ticketType: b.ticketType || 'N/A',
      ticketPrice: b.ticketPrice || 0,
      quantity: b.quantity,
      bookedDate: b.bookedDate,
      venue: b.venue || 'Unknown'
    }));

    const formattedPayments = payments.map(p => ({
      paymentId: p.paymentId,
      amount: p.amount,
      method: p.method,
      status: p.status,
      date: p.transactionDate,
      currency: p.currency
    }));

    const profile = {
      ...user,
      totalSpent,
      totalTicketsPurchased,
      totalUniqueEvents,
      bookings: formattedBookings,
      payments: formattedPayments
    };

    res.status(200).json({ user: profile });

  } catch (error) {
    console.error("User profile error:", error);
    res.status(500).json({ message: "Failed to fetch user profile", error: error.message });
  }
};
