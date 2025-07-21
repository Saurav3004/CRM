import mongoose from "mongoose";
import slugify from "slugify";

const dropSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  slug: { type: String, unique: true },
  tags: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["draft", "active", "closed"], default: "draft" },
  createdAt: { type: Date, default: Date.now }
});

dropSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

const Drop = mongoose.model("Drop", dropSchema);
export default Drop;
