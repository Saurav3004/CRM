import { User } from '../models/userModel.js';
import { Booking } from '../models/bookingModel.js';
import { Payment } from '../models/paymentModel.js';
import { Parser } from 'json2csv';

const fieldMap = {
  firstName: 'user.firstName',
  lastName: 'user.lastName',
  email: 'user.email',
  mobile: 'user.mobile',
  gender: 'user.gender',
  dob: 'user.dob',

  eventName: 'booking.eventName',
  quantity: 'booking.quantity',
  bookedDate: 'booking.bookedDate',
  venue: 'booking.venue',
  source: 'booking.source',

  ticketPrice: 'booking.ticketPrice',  // virtual field
  amount: 'payment.amount',            // will map to booking.totalPaid
  method: 'payment.method',
  currency: 'payment.currency',
  status: 'payment.status',
  transactionDate: 'payment.transactionDate',
};

export const exportData = async (req, res) => {
  try {
    let { fields = [], filters = {} } = req.body;

    if (!Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({ message: "No fields selected for export." });
    }

    const mappedFields = fields.map(f => fieldMap[f] || f);

    const mappedFilters = {};
    for (const key in filters) {
      const mappedKey = fieldMap[key] || key;
      if (filters[key]) {
        mappedFilters[mappedKey] = filters[key];
      }
    }

    // Build MongoDB query for payment filters
    const mongoQuery = {};
    for (const f in mappedFilters) {
      if (f.startsWith('payment.')) {
        mongoQuery[f.replace('payment.', '')] = mappedFilters[f];
      }
    }

    const payments = await Payment.find(mongoQuery)
      .populate('user')
      .populate('booking')
      .lean();

    const combined = [];

    for (const payment of payments) {
      const user = payment.user || {};
      const booking = payment.booking || {};
      const row = {};

      let matches = true;

      for (const f in mappedFilters) {
        const [group, key] = f.split(".");
        const val =
          group === 'user' ? user[key]
          : group === 'booking' ? booking[key]
          : payment[key];

        if (val !== mappedFilters[f]) {
          matches = false;
          break;
        }
      }

      if (matches) {
        mappedFields.forEach(f => {
          if (f === 'payment.amount') {
            // Override with booking.totalPaid
            row[f] = booking.totalPaid ?? payment.amount ?? '';
          } else if (f === 'booking.ticketPrice') {
            // Calculate price per ticket
            row[f] =
              typeof booking.totalPaid === 'number' &&
              typeof booking.quantity === 'number' &&
              booking.quantity !== 0
                ? (booking.totalPaid / booking.quantity).toFixed(2)
                : '';
          } else {
            const [group, key] = f.split('.');
            row[f] =
              group === 'user'
                ? user[key]
                : group === 'booking'
                ? booking[key]
                : payment[key];
          }
        });

        combined.push(row);
      }
    }

    if (combined.length === 0) {
      return res.json({ message: "No data exported" });
    }

    const parser = new Parser({ fields: mappedFields });
    const csv = parser.parse(combined);

    res.header('Content-Type', 'text/csv');
    res.attachment('export.csv');
    res.send(csv);

  } catch (err) {
    console.error('❌ Export failed:', err);
    res.status(500).json({ message: "Export failed", error: err.message });
  }
};
