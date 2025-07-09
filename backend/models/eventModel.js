import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // prevent duplicate event names
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now // placeholder if not passed from booking
  },
  venue: {
    type: String,
    default: ''
  },
  totalTickets: {
    type: Number,
    default: 500
  },
  pricePerTicket: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['upcoming', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

export const Event = mongoose.model('Event', eventSchema);
