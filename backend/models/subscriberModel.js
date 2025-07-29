import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  city: String,
  source: { type: String, default: "form" },
  dropIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Drop" }], // CHANGED
  tags: [String],
  instagramId: { type: String, unique: true, sparse: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  createdAt: { type: Date, default: Date.now }
});


const Subscriber = mongoose.model("Subscriber", subscriberSchema);
export default Subscriber;
