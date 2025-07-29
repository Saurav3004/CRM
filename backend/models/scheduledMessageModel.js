import mongoose from "mongoose";

const scheduledMessageSchema = new mongoose.Schema({
  drop: { type: mongoose.Schema.Types.ObjectId, ref: "Drop", required: true },
  message: { type: String, required: true },
  channel: { type: String, enum: ["email", "instagram","whatsapp","sms"], required: true },
  status: { type: String, enum: ['pending', 'sent', 'cancelled'], default: 'pending' },
  scheduledAt: { type: Date, required: true },
  sentAt: Date,
  createdAt: { type: Date, default: Date.now }
});

const ScheduledMessage = mongoose.model("ScheduledMessage", scheduledMessageSchema);
export default ScheduledMessage;
