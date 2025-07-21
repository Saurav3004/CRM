import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  city: String,
  source: { type: String, default: "form" },
  dropId: { type: mongoose.Schema.Types.ObjectId, ref: "Drop" },
  tags: [String],
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  createdAt: { type: Date, default: Date.now }
});

const Subscriber = mongoose.model("Subscriber", subscriberSchema);
export default Subscriber;
