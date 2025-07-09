import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  ticketCode: {
    type: String,
    required: true,
    unique: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: false // Optional but very useful for dashboards
  },
  eventName: {
    type: String
  },
  ticketType: {
    type: String,
    default: "General"
  },
  ticketPrice: {
    type: Number
  },
  qrCode: {
    type: String
  },
  status: {
    type: String,
    enum: ['Not Used', 'Checked In', 'Cancelled'],
    default: 'Not Used'
  }
}, { timestamps: true });

export const Ticket = mongoose.model("Ticket", ticketSchema);
