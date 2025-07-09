import { Booking } from '../models/bookingModel.js';
import { Payment } from '../models/paymentModel.js';

export const getBookingDetails = async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId })
      .populate('user')
      .populate({
        path: 'tickets',
        populate: {
          path: 'user',
          model: 'User',
        }
      });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const payments = await Payment.find({ booking: booking._id });

    // Only include tickets that match the booking's user
    const filteredTickets = booking.tickets.filter(t => {
      return t.user && t.user._id.toString() === booking.user._id.toString();
    });

    res.status(200).json({
      booking,
      tickets: filteredTickets,
      payments
    });
  } catch (err) {
    console.error('❌ Error fetching booking details:', err);
    res.status(500).json({ message: 'Error fetching booking details' });
  }
};

