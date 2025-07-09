import { User } from '../models/userModel.js';
import { Booking } from '../models/bookingModel.js';
import { Payment } from '../models/paymentModel.js';
import { Ticket } from '../models/ticketModel.js';
import { Event } from '../models/eventModel.js';
import { parse, isValid } from 'date-fns';
import { nanoid } from 'nanoid';

const clean = (val) => typeof val === 'string' ? val.trim() : val;

const parseDate = (val) => {
  if (!val || typeof val !== 'string') return null;
  const trimmed = val.trim().toLowerCase();
  if (['n/a', 'na', '', '-'].includes(trimmed)) return null;

  const formats = ['yyyy-MM-dd', 'dd-MM-yyyy', 'MM/dd/yyyy', 'MM/dd/yyyy HH:mm', 'MM-dd-yyyy HH:mm'];
  for (const fmt of formats) {
    const parsed = parse(trimmed, fmt, new Date());
    if (isValid(parsed)) return parsed;
  }

  return null;
};

const detectType = (headers) => {
  const lower = headers.map(h => h.toLowerCase());
  const hasFirstName = lower.includes('firstname') || lower.includes('fullname');
  const hasEmail = lower.includes('email');
  const hasUser = hasEmail && hasFirstName;
  const hasBookingFields = lower.includes('bookingid') && lower.includes('eventname');
  const hasPaymentFields = (lower.includes('paymentid') || lower.includes('amount') || lower.includes('method')) && lower.includes('bookingid');

  if (hasUser && !hasBookingFields && !hasPaymentFields) return 'user';
  if (hasBookingFields && !hasUser && !hasPaymentFields) return 'booking';
  if (hasPaymentFields && !hasUser && !hasBookingFields) return 'payment';
  return 'mixed';
};

export const importCSVData = async (req, res) => {
  try {
    const rows = JSON.parse(req.body.data);
    let importType = req.body.importType;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty data' });
    }

    if (!importType) {
      const headers = Object.keys(rows[0]);
      importType = detectType(headers);
    }

    const inserted = [], updated = [], skipped = [];

    for (const row of rows) {
      const email = clean(row.email || row.userEmail);
      const bookingId = clean(row.bookingId);
      const quantity = Number(row.quantity || 0);
      let price = Number(row.ticketPrice || 0);
      const totalPaid = Number(row.totalPaid || row.amount || 0);
      const amount = Number(row.amount || totalPaid);
      const transactionDate = parseDate(row.transactionDate);
      const shouldRunUser = ['user', 'mixed'].includes(importType);
      const shouldRunBooking = ['booking', 'mixed'].includes(importType);
      const shouldRunPayment = ['payment', 'mixed'].includes(importType);

      let user = email ? await User.findOne({ email }) : null;

      // Create user if needed
      if (shouldRunUser && email && !user) {
        try {
          const dob = parseDate(row.dob);
          user = await User.create({
            firstName: clean(row.firstName || 'Unknown'),
            lastName: clean(row.lastName),
            email,
            mobile: clean(row.mobile),
            dob,
            gender: clean(row.gender),
            city: clean(row.city),
            state: clean(row.state),
            country: clean(row.country),
            socialMedia: {
              instagram: clean(row['socialMedia.instagram']),
              tiktok: clean(row['socialMedia.tiktok']),
              spotify: clean(row['socialMedia.spotify']),
            },
            totalSpent: 0,
            eventsPurchased: 0,
            ticketsPurchased: 0,
            marketingOptIn: row.marketingOptIn === 'true' || row.marketingOptIn === true
          });
          inserted.push({ type: 'user', email });
        } catch (err) {
          skipped.push({ reason: 'User creation failed: ' + err.message, row });
          continue;
        }
      }

      if (!user && (shouldRunBooking || shouldRunPayment) && email) {
        user = await User.create({
          email,
          firstName: clean(row.firstName || 'Unknown'),
          totalSpent: 0,
          eventsPurchased: 0,
          ticketsPurchased: 0
        });
        inserted.push({ type: 'user-auto', email });
      }

      if (!user) {
        skipped.push({ reason: 'No user found', row });
        continue;
      }

      // BOOKING + EVENT
      if (shouldRunBooking && bookingId && row.eventName && !isNaN(quantity)) {
        const eventName = clean(row.eventName);
        const ticketType = clean(row.ticketType);
        const bookedDate = parseDate(row.bookedDate) || new Date();

        // 🎯 Event Auto Create/Fetch
        let event = await Event.findOne({ name: eventName });
        if (!event) {
          event = await Event.create({
            name: eventName,
            startDate: parseDate(row.eventStartDate) || null,
            endDate: parseDate(row.eventEndDate) || null,
            venue: clean(row.venue),
            city: clean(row.city),
            source: 'CSV',
            totalRevenue: 0,
            ticketsSold: 0
          });
          inserted.push({ type: 'event', name: eventName });
        }

        if (price === 0 && totalPaid && quantity > 0) {
          price = totalPaid / quantity;
        }

        if (price <= 0) {
          skipped.push({ reason: 'Invalid or missing ticket price', row });
          continue;
        }

        let booking = await Booking.findOne({ bookingId });

        if (!booking) {
          booking = await Booking.create({
            bookingId,
            user: user._id,
            eventName,
            eventId: event._id,
            venue: clean(row.venue),
            bookedDate,
            source: clean(row.source || 'CSV'),
            tickets: [],
            quantity: 0,
            totalPaid: 0,
          });
          inserted.push({ type: 'booking', bookingId });
        } else {
          updated.push({ type: 'booking', bookingId });
        }

        // Create Tickets
        const tickets = [];

        for (let i = 0; i < quantity; i++) {
          const rawCode = clean(row.ticketCode) || `TIX-${bookingId}-${ticketType}-${i + 1}-${nanoid(6)}`;
          const exists = await Ticket.findOne({ ticketCode: rawCode });
          if (exists) {
            skipped.push({ reason: 'Duplicate ticketCode', ticketCode: rawCode });
            continue;
          }

          tickets.push({
            ticketCode: rawCode,
            bookingId: booking._id,
            user: user._id,
            eventId: event._id, // ✅ added here
            eventName,
            ticketType,
            ticketPrice: price,
            qrCode: `QR-${bookingId}-${ticketType}-${i + 1}-${nanoid(4)}`
          });
        }

        if (tickets.length > 0) {
          const savedTickets = await Ticket.insertMany(tickets);
          booking.tickets.push(...savedTickets.map(t => t._id));
          booking.totalPaid += price * tickets.length;
          booking.quantity += tickets.length;
          await booking.save();

          await User.updateOne({ _id: user._id }, {
            $inc: {
              totalSpent: price * tickets.length,
              eventsPurchased: 1,
              ticketsPurchased: tickets.length
            },
            $set: { lastActivity: new Date() }
          });

          await Event.updateOne({ _id: event._id }, {
            $inc: {
              totalRevenue: price * tickets.length,
              ticketsSold: tickets.length
            }
          });
        }
      }

      // 💳 Payment
      if (shouldRunPayment && bookingId && !isNaN(amount) && transactionDate) {
        const booking = await Booking.findOne({ bookingId });
        if (!booking) {
          skipped.push({ reason: 'Booking not found for payment', bookingId });
          continue;
        }

        const paymentId = clean(row.paymentId) || `PAY-${bookingId}-${nanoid(6)}`;
        const exists = await Payment.findOne({ paymentId });

        if (!exists) {
          await Payment.create({
            paymentId,
            user: user._id,
            booking: booking._id,
            amount,
            method: clean(row.method || 'unknown'),
            status: clean(row.status || 'paid'),
            transactionDate,
            currency: clean(row.currency || 'INR'),
            eventbriteFee: Number(row.eventbriteFee || 0),
            processingFee: Number(row.processingFee || 0),
            tax: Number(row.tax || 0),
            royalty: Number(row.royalty || 0),
            netSales: Number(row.netSales || 0)
          });
          inserted.push({ type: 'payment', paymentId });
        } else {
          updated.push({ type: 'payment', paymentId });
        }
      }
    }

    res.status(200).json({
      message: `${inserted.length + updated.length} records processed.`,
      insertedCount: inserted.length,
      updatedCount: updated.length,
      skippedCount: skipped.length,
      inserted,
      updated,
      skipped
    });

  } catch (err) {
    console.error('❌ Import failed:', err);
    res.status(500).json({ message: 'Import failed', error: err.message });
  }
};
