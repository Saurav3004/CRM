import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  channel: { type: String, enum: ['email', 'sms', 'whatsapp'], required: true },
  message: { type: String, required: true },
  recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  sentAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['running', 'completed', 'failed'], default: 'running' }
}, { timestamps: true });

export const Campaign = mongoose.model('Campaign', campaignSchema);
