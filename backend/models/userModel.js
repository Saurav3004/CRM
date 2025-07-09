import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, required: true, unique: true },
  mobile: String,
  dob: Date,
  gender: String,
  city: String,
  state: String,
  country: String,
  socialMedia: {
    instagram: String,
    tiktok: String,
    spotify: String,
  },
  marketingOptIn:{
    type:Boolean,
    default:true
  },
  totalSpent: { type: Number, default: 0 },
  eventsPurchased: { type: Number, default: 0 },
  ticketsPurchased: { type: Number, default: 0 },
  lastActivity: Date,
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
