import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventName: { type: String, required: true },
  venue: String,
  // ticketType: String,
  // ticketPrice: Number,
  quantity: {type:Number,default:0},
  totalPaid:{type:Number,default:0},
  bookedDate: Date,
  source: String,
  tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }]
}, { timestamps: true });


export const Booking = mongoose.model("Booking", bookingSchema);