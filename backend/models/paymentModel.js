import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  amount: Number,
  method: String,
  status: String,
  basePrice:Number,
  eventbriteFee: Number,
  transactionDate: Date,
  currency:String
}, { timestamps: true });

export const Payment = mongoose.model("Payment", paymentSchema);