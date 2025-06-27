import { Booking } from '../models/bookingModel.js';
import { Payment } from '../models/paymentModel.js';

export const getBookingDetails = async (req, res) => {
  try {
    // 🔍 Find booking by bookingId and populate user and tickets
    const booking = await Booking.findOne({ bookingId: req.params.bookingId })
      .populate('user')
      .populate('tickets'); 

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // 💳 Find payments for this booking
    const payments = await Payment.find({ booking: booking._id });

    res.status(200).json({
      booking,
      tickets: booking.tickets || [],  // ✅ ensure fallback
      payments
    });
  } catch (err) {
    console.error('❌ Error fetching booking details:', err);
    res.status(500).json({ message: 'Error fetching booking details' });
  }
};
