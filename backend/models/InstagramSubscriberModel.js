import mongoose from "mongoose";

const instagramSubscriberSchema = new mongoose.Schema({
  instagramId: {
    type: String,
    required: true,
    unique: true,
  },
  subscribedDrops: [
    {
      drop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Drop",
      },
      subscribedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  firstSubscribedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

export default mongoose.model("InstagramSubscriber", instagramSubscriberSchema);
