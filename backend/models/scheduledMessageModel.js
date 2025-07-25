import mongoose from "mongoose";

const scheduledMessageSchema = new mongoose.Schema({
  drop: { type: mongoose.Schema.Types.ObjectId, ref: "Drop", required: true },
  message: { type: String, required: true },
  channel: { type: String, enum: ["email", "instagram"], required: true },
  scheduledAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ScheduledMessage = mongoose.model("ScheduledMessage", scheduledMessageSchema);
export default ScheduledMessage;
