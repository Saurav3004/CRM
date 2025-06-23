import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ticketId: { type: String },
  eventName: { type: String, required: true },
  venue: String,
  ticketType: String,
  ticketPrice: Number,
  quantity: Number,
  bookedDate: Date,
  source: String,
}, { timestamps: true });

export const Booking = mongoose.model("Booking", bookingSchema);