import { User } from '../models/userModel.js';
import { Booking } from '../models/bookingModel.js';
import { Payment } from '../models/paymentModel.js';

// Detect import type
export const detect = (headers) => {
  const lower = headers.map(h => h.toLowerCase());
  if (lower.includes('bookingid') && lower.includes('eventname')) return 'booking';
  if (lower.includes('paymentid') && lower.includes('amount')) return 'payment';
  if (lower.includes('email') && (lower.includes('fullname') || lower.includes('firstname'))) return 'user';
  return 'combined';
};

export const importCSVData = async (req, res) => {
  try {
    const rows = JSON.parse(req.body.data);
    if (!Array.isArray(rows) || rows.length === 0)
      return res.status(400).json({ message: "Invalid or empty data" });

    const headers = Object.keys(rows[0]);
    const importType = detect(headers);

    const inserted = [], updated = [], skipped = [];

    for (const row of rows) {
      try {
        const email = row.email || row.userEmail;
        if (!email) {
          skipped.push({ row, reason: "Missing user email" });
          continue;
        }

        // ----- USER -----
        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            firstName: row.firstName,
            lastName: row.lastName,
            email,
            mobile: row.mobile,
            dob: row.dob ? new Date(row.dob) : undefined,
            gender: row.gender,
            city: row.city,
            state: row.state,
            country: row.country,
            socialMedia: {
              instagram: row["socialMedia.instagram"] || row.instagram,
              tiktok: row["socialMedia.tiktok"] || row.tiktok,
              spotify: row["socialMedia.spotify"] || row.spotify
            },
            totalSpent: 0,
            eventsPurchased: 0,
            ticketsPurchased: 0
          });
          inserted.push({ type: 'user', email });
        } else {
          updated.push({ type: 'user', email });
        }

        if (importType === 'user') continue;

        // ----- BOOKING -----
        const bookingId = row.bookingId;
        if (!bookingId) {
          skipped.push({ row, reason: "Missing bookingId" });
          continue;
        }

        const qty = Number(row.quantity || 1);
        const price = Number(row.ticketPrice || 0);
        const amount = qty * price;

        let booking = await Booking.findOne({ bookingId });

        let isNewBooking = false;
        if (!booking) {
          booking = await Booking.create({
            bookingId,
            user: user._id,
            ticketId: row.ticketId,
            eventName: row.eventName,
            venue: row.venue,
            ticketType: row.ticketType,
            ticketPrice: price,
            quantity: qty,
            bookedDate: row.bookedDate ? new Date(row.bookedDate) : new Date(),
            source: row.source || 'CSV'
          });

          inserted.push({ type: 'booking', bookingId });
          isNewBooking = true;
        } else {
          updated.push({ type: 'booking', bookingId });
        }

        // ✅ Only increment user totals if booking is new
        if (isNewBooking) {
          await User.updateOne(
            { _id: user._id },
            {
              $inc: {
                totalSpent: amount,
                eventsPurchased: 1,
                ticketsPurchased: qty
              },
              $set: { lastActivity: new Date() }
            }
          );
        }

        if (importType === 'booking' && !(row.paymentId || row.amount || row.transactionDate)) continue;

        // ----- PAYMENT -----
        if (row.paymentId || row.amount || row.transactionDate) {
          const paymentId = row.paymentId;
          if (!paymentId) {
            skipped.push({ row, reason: "Missing paymentId" });
          } else {
            const existingPayment = await Payment.findOne({ paymentId });
            if (!existingPayment) {
              await Payment.create({
                paymentId,
                user: user._id,
                booking: booking._id,
                amount: Number(row.amount) || 0,
                method: row.method || 'unknown',
                status: row.status || 'paid',
                transactionDate: row.transactionDate ? new Date(row.transactionDate) : new Date()
              });
              inserted.push({ type: 'payment', paymentId });
            } else {
              updated.push({ type: 'payment', paymentId });
            }
          }
        }

      } catch (err) {
        skipped.push({ row, reason: err.message });
      }
    }

    // ✅ (Optional) Final recalculation to ensure correctness
    const allUsers = await User.find({});
    for (const u of allUsers) {
      const bookings = await Booking.find({ user: u._id });
      const tickets = bookings.reduce((sum, b) => sum + (b.quantity || 0), 0);
      const events = new Set(bookings.map(b => b.eventName)).size;
      const spent = bookings.reduce((sum, b) => sum + ((b.ticketPrice || 0) * (b.quantity || 0)), 0);

      await User.updateOne({ _id: u._id }, {
        ticketsPurchased: tickets,
        eventsPurchased: events,
        totalSpent: spent
      });
    }

    return res.status(200).json({
      message: `${inserted.length + updated.length} records processed.`,
      insertedCount: inserted.length,
      updatedCount: updated.length,
      skippedCount: skipped.length,
      inserted,
      updated,
      skipped
    });
  } catch (err) {
    console.error("Import failed:", err);
    return res.status(500).json({ message: "Import failed", error: err.message });
  }
};
