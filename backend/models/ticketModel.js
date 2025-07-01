import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  ticketCode: { type: String, required: true, unique: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventName: String,
  ticketType: {type:String,default:"General"},
  ticketPrice: Number,
  qrCode: String,
  status: {
    type: String,
    enum: ['Not Used', 'Checked In', 'Cancelled'],
    default: 'Not Used'
  }
}, { timestamps: true });

export const Ticket = mongoose.model("Ticket", ticketSchema);
