// models/tokenModel.js
import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // your app's userId (frontend)
  platform: { type: String, enum: ['eventbrite'], required: true },
  accessToken: { type: String, required: true },
  platformUserId: { type: String }, // optional: eventbrite user ID
  connected: { type: Boolean, default: true }
}, { timestamps: true });

export const Token = mongoose.model('Token', tokenSchema);
