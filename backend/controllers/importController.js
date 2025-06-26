import { User } from '../models/userModel.js';
import { Booking } from '../models/bookingModel.js';
import { Payment } from '../models/paymentModel.js';
import { Ticket } from '../models/ticketModel.js';
import { parse, isValid } from 'date-fns';
import { nanoid } from 'nanoid';

// Helper: Clean value
const clean = (val) => typeof val === 'string' ? val.trim() : val;

// Helper: Detect import type
export const detect = (headers) => {
  const lower = headers.map(h => h.toLowerCase());
  const hasUser = lower.includes('email') && (lower.includes('firstname') || lower.includes('fullname'));
  const hasBooking = lower.includes('bookingid') && lower.includes('eventname');
  const hasPayment = lower.includes('paymentid') && lower.includes('amount');
  if (hasBooking) return 'booking';
  if (hasPayment) return 'payment';
  if (hasUser) return 'user';
  return 'unknown';
};

// Helper: Parse date
const parseDate = (val) => {
  if (!val || typeof val !== 'string') return null;
  const trimmed = val.trim().toLowerCase();
  if (['n/a', 'na', '', '-'].includes(trimmed)) return null;

  let parsed = parse(trimmed, 'yyyy-MM-dd', new Date());
  if (isValid(parsed)) return parsed;

  parsed = parse(trimmed, 'dd-MM-yyyy', new Date());
  if (isValid(parsed)) return parsed;

  return null;
};

// Main Import Controller
export const importCSVData = async (req, res) => {
  try {
    const rows = JSON.parse(req.body.data);
    if (!Array.isArray(rows) || rows.length === 0)
      return res.status(400).json({ message: 'Invalid or empty data' });

    const headers = Object.keys(rows[0]);
    const importType = detect(headers);
    console.log('📥 Detected import type:', importType);

    const inserted = [], updated = [], skipped = [];

    for (const row of rows) {
      const email = clean(row.email || row.userEmail);
      if (!email) {
        skipped.push({ reason: 'Missing user email', row });
        continue;
      }

      let user = await User.findOne({ email });

      // USER IMPORT
      if (importType === 'user') {
        if (!user) {
          const dob = parseDate(row.dob);
          try {
            user = await User.create({
              firstName: clean(row.firstName),
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
                spotify: clean(row['socialMedia.spotify'])
              },
              totalSpent: 0,
              eventsPurchased: 0,
              ticketsPurchased: 0
            });
            inserted.push({ type: 'user', email });
          } catch (err) {
            skipped.push({ reason: 'User creation failed: ' + err.message, row });
          }
        } else {
          updated.push({ type: 'user', email });
        }
        continue;
      }

      // BOOKING IMPORT (with ticket append support)
      if (importType === 'booking') {
        const bookingId = clean(row.bookingId);
        const eventName = clean(row.eventName);
        const ticketType = clean(row.ticketType);
        const price = Number(row.ticketPrice || 0);
        const qty = Number(row.quantity || 1);

        if (!bookingId || !eventName || !ticketType || isNaN(price) || isNaN(qty)) {
          skipped.push({ reason: 'Invalid booking fields', bookingId, email });
          continue;
        }

        if (!user) {
          skipped.push({ reason: 'No user found for booking', email });
          continue;
        }

        let bookedDate = parseDate(row.bookedDate) || new Date();
        const existing = await Booking.findOne({ bookingId });

        if (!existing) {
          // New Booking
          const newBooking = await Booking.create({
            bookingId,
            user: user._id,
            ticketId: clean(row.ticketId),
            eventName,
            venue: clean(row.venue),
            ticketType,
            ticketPrice: price,
            quantity: qty,
            bookedDate,
            source: clean(row.source || 'CSV')
          });

          const tickets = [];
          for (let i = 1; i <= qty; i++) {
            tickets.push({
              ticketCode: `TIX-${bookingId}-${i}-${nanoid(6)}`,
              bookingId: newBooking._id,
              user: user._id,
              eventName,
              ticketType,
              ticketPrice: price,
              qrCode: `QR-${bookingId}-${i}-${nanoid(4)}`
            });
          }

          const saved = await Ticket.insertMany(tickets);
          newBooking.tickets = saved.map(t => t._id);
          await newBooking.save();

          await User.updateOne(
            { _id: user._id },
            {
              $inc: {
                totalSpent: price * qty,
                eventsPurchased: 1,
                ticketsPurchased: qty
              },
              $set: { lastActivity: new Date() }
            }
          );

          inserted.push({ type: 'booking', bookingId });
        } else {
          // Append new tickets to existing booking
          const tickets = [];
          for (let i = 1; i <= qty; i++) {
            tickets.push({
              ticketCode: `TIX-${bookingId}-${i}-${nanoid(6)}`,
              bookingId: existing._id,
              user: user._id,
              eventName,
              ticketType,
              ticketPrice: price,
              qrCode: `QR-${bookingId}-${i}-${nanoid(4)}`
            });
          }

          const saved = await Ticket.insertMany(tickets);
          existing.tickets.push(...saved.map(t => t._id));
          existing.quantity += qty;
          await existing.save();

          await User.updateOne(
            { _id: user._id },
            {
              $inc: {
                totalSpent: price * qty,
                ticketsPurchased: qty
              },
              $set: { lastActivity: new Date() }
            }
          );

          updated.push({ type: 'booking', bookingId });
        }
        continue;
      }

      // PAYMENT IMPORT
      if (importType === 'payment') {
        const paymentId = clean(row.paymentId);
        const bookingId = clean(row.bookingId);
        const transactionDate = parseDate(row.transactionDate);
        const amount = Number(row.amount || 0);

        if (!paymentId || !bookingId || isNaN(amount) || !transactionDate) {
          skipped.push({ reason: 'Invalid payment fields', paymentId, bookingId });
          continue;
        }

        const booking = await Booking.findOne({ bookingId });
        if (!booking) {
          skipped.push({ reason: 'No booking found for payment', bookingId });
          continue;
        }

        if (!user) {
          skipped.push({ reason: 'No user found for payment', email });
          continue;
        }

        const exists = await Payment.findOne({ paymentId, booking: booking._id });
        if (!exists) {
          await Payment.create({
            paymentId,
            user: user._id,
            booking: booking._id,
            amount,
            method: clean(row.method || 'unknown'),
            status: clean(row.status || 'paid'),
            transactionDate
          });
          inserted.push({ type: 'payment', paymentId });
        } else {
          updated.push({ type: 'payment', paymentId });
        }
        continue;
      }
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
    console.error('❌ Import failed:', err);
    return res.status(500).json({ message: 'Import failed', error: err.message });
  }
};
