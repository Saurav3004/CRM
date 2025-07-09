import { User } from '../models/userModel.js';
import { Booking } from '../models/bookingModel.js';
import { Payment } from '../models/paymentModel.js';
import { Ticket } from '../models/ticketModel.js';

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
        marketing: user.marketingOptIn ?? false
      };
    }));

    res.status(200).json({ users: enrichedUsers });
  } catch (error) {
    console.error("Fetch Users Error:", error);
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

// 🧾 Get user profile by ID with bookings & payments
// export const getUserProfileById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const user = await User.findById(id).lean();
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     const bookings = await Booking.find({ user: id }).lean();
//     const payments = await Payment.find({ user: id }).lean();

//     const totalTicketsPurchased = bookings.reduce((sum, b) => sum + (b.quantity || 0), 0);
//     const totalUniqueEvents = new Set(bookings.map(b => b.eventName)).size;
//     const totalSpent = user.totalSpent || 0;

//     const formattedBookings = bookings.map(b => ({
//       bookingId: b.bookingId,
//       eventName: b.eventName || 'N/A',
//       ticketType: b.ticketType || 'N/A',
//       ticketPrice: b.ticketPrice || 0,
//       quantity: b.quantity,
//       bookedDate: b.bookedDate,
//       venue: b.venue || 'Unknown'
//     }));

//     const formattedPayments = payments.map(p => ({
//       paymentId: p.paymentId,
//       amount: p.amount,
//       method: p.method,
//       status: p.status,
//       date: p.transactionDate,
//       currency: p.currency
//     }));

//     const profile = {
//       ...user,
//       totalSpent,
//       totalTicketsPurchased,
//       totalUniqueEvents,
//       bookings: formattedBookings,
//       payments: formattedPayments
//     };

//     res.status(200).json({ user: profile });

//   } catch (error) {
//     console.error("User profile error:", error);
//     res.status(500).json({ message: "Failed to fetch user profile", error: error.message });
//   }
// };


// export const getUserProfileById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // 1. Get user basic details
//     const user = await User.findById(id).lean();
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     // 2. Get all tickets booked by this user
//     const tickets = await Ticket.find({ user: id })
//       .populate('bookingId')
//       .lean();

//     // 3. Derive related bookings and events from tickets
//     const bookingMap = new Map();
//     const eventSet = new Set();
//     let totalSpent = 0;

//     for (const ticket of tickets) {
//       totalSpent += ticket.ticketPrice || 0;

//       if (ticket.eventName) eventSet.add(ticket.eventName);

//       const booking = ticket.bookingId;
//       if (booking && !bookingMap.has(booking.bookingId)) {
//         bookingMap.set(booking.bookingId, {
//           bookingId: booking.bookingId,
//           eventName: booking.eventName || 'N/A',
//           quantity: booking.quantity || 1,
//           bookedDate: booking.bookedDate,
//           venue: booking.venue || 'Unknown',
//         });
//       }
//     }

//     // 4. Get all payments by user
//     const payments = await Payment.find({ user: id }).lean();

//     // 5. Format for UI
//     const formattedBookings = Array.from(bookingMap.values());

//     const formattedPayments = payments.map(p => ({
//       paymentId: p.paymentId,
//       amount: p.amount,
//       method: p.method,
//       status: p.status,
//       date: p.transactionDate,
//       currency: p.currency
//     }));

//     const profile = {
//       ...user,
//       totalSpent,
//       totalTicketsPurchased: tickets.length,
//       totalUniqueEvents: eventSet.size,
//       bookings: formattedBookings,
//       payments: formattedPayments
//     };

//     res.status(200).json({ user: profile });

//   } catch (error) {
//     console.error("User profile error:", error);
//     res.status(500).json({ message: "Failed to fetch user profile", error: error.message });
//   }
// };


// export const getUserProfileById = async (req, res) => {
//   try {
//     // Fetch all tickets with related user and booking info
//     const tickets = await Ticket.find({})
//       .populate('user', 'email firstName lastName')
//       .populate('bookingId', 'eventName bookedDate venue totalPaid')
//       .lean();

//     const userMap = {};

//     for (const t of tickets) {
//       const userId = t.user?._id.toString();
//       if (!userMap[userId]) {
//         userMap[userId] = {
//           userId,
//           email: t.user?.email,
//           name: `${t.user?.firstName || ''} ${t.user?.lastName || ''}`.trim(),
//           tickets: [],
//           totalSpent: 0,
//           totalEvents: new Set(),
//         };
//       }

//       userMap[userId].tickets.push({
//         ticketId: t._id,
//         eventName: t.eventName,
//         ticketType: t.ticketType,
//         ticketPrice: t.ticketPrice,
//         bookingId: t.bookingId?._id,
//         bookedDate: t.bookingId?.bookedDate,
//         venue: t.bookingId?.venue,
//       });

//       userMap[userId].totalSpent += t.ticketPrice || 0;
//       userMap[userId].totalEvents.add(t.eventName);
//     }

//     // Final output
//     const users = Object.values(userMap).map(user => ({
//       ...user,
//       totalTickets: user.tickets.length,
//       totalEvents: user.totalEvents.size,
//     }));

//     res.json({ users });
//   } catch (err) {
//     console.error("Error fetching user ticket data:", err);
//     res.status(500).json({ message: "Failed to fetch data", error: err.message });
//   }
// };


export const getUserProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Instead of Booking.find({ user: id }) — we use Tickets
    const tickets = await Ticket.find({ user: id }).populate('bookingId').lean();

    const bookingsMap = {};

    for (const ticket of tickets) {
      const booking = ticket.bookingId;
      if (!booking) continue;

      const bId = booking._id.toString();

      if (!bookingsMap[bId]) {
        bookingsMap[bId] = {
          bookingId: booking.bookingId,
          eventName: booking.eventName,
          venue: booking.venue,
          quantity: 0,
          bookedDate: booking.bookedDate,
          totalPaid: booking.totalPaid,
          tickets: [],
        };
      }

      bookingsMap[bId].tickets.push({
        ticketId: ticket._id,
        ticketCode: ticket.ticketCode,
        type: ticket.ticketType,
        price: ticket.ticketPrice,
        status: ticket.status,
      });

      bookingsMap[bId].quantity++;
    }

    const bookings = Object.values(bookingsMap);
    const totalTicketsPurchased = tickets.length;
    const totalSpent = tickets.reduce((sum, t) => sum + (t.ticketPrice || 0), 0);
    const totalUniqueEvents = new Set(tickets.map(t => t.eventName)).size;

    const profile = {
      ...user,
      totalTicketsPurchased,
      totalSpent,
      totalUniqueEvents,
      bookings,
    };

    res.json({ user: profile });
  } catch (error) {
    console.error("User profile error:", error);
    res.status(500).json({ message: "Failed to fetch user profile", error: error.message });
  }
};
