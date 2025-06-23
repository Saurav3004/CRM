import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  eventName: { type: String, required: true },
  venue: String,
  ticketType: String, // e.g., VIP, General
  ticketPrice: Number,
  availableQuantity: Number,
  totalIssued: Number
}, { timestamps: true });

export const Ticket = mongoose.model("Ticket", ticketSchema);
