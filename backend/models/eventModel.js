import mongoose from "mongoose";

const ticketTypeSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g. "VIP", "General"
  price: { type: Number, required: true },
  quantity: { type: Number, default: 0 }
}, { _id: false }); // don't need an ID per ticket type

const eventSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  eventDate: { type: Date, required: true },
  venue: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ['upcoming', 'live', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  ticketTypes: [ticketTypeSchema]
}, {
  timestamps: true
});

export const Event = mongoose.model("Event", eventSchema);
