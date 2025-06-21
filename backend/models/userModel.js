import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  fullName: String,
  email: {
    type: String,
    required: true,
    unique: true, // recommended for clean user management
    lowercase: true,
    trim: true
  },
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  dob: Date,
  mobile: {
    type: String,
    trim: true,
  },
  city: String,
  country: String,
  state: String,
  age: Number,
  totalSpent: {
    type: Number,
    default: 0
  },
  socialMedia: {
    instagram: String,
    tiktok: String,
    spotify:String
  }
}, {
  timestamps: true
});

export const User = mongoose.model("User", userSchema);
