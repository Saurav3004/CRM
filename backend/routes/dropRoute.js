import express from "express";
import Drop from "../models/dropModel.js";
import Subscriber from "../models/subscriberModel.js";
import crypto from 'crypto'
import { sendVerificationEmail } from "../controllers/marketingHandler.js";
import { addScheduleMessage, deleteDropHandler, getAllDrops, getDropWithId, getMessagesByDropId, updateDrop } from "../controllers/dropController.js";

const router = express.Router();

// 1. Create Drop (admin panel)
router.post("/", async (req, res) => {
  try {
    const drop = new Drop(req.body);
    await drop.save();
    res.status(201).json(drop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Get Drop by Slug (public)
router.get("/slug/:slug", async (req, res) => {
  try {
    const drop = await Drop.findOne({ slug: req.params.slug });
    if (!drop) return res.status(404).json({ message: "Drop not found" });
    res.json({ drop });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Subscribe to Drop (public)
router.post("/:slug/subscribe", async (req, res) => {
  try {
    const drop = await Drop.findOne({ slug: req.params.slug });
    if (!drop) return res.status(404).json({ message: "Drop not found" });

    const { fullName, email, phone, city, tags = [] } = req.body;

    const existing = await Subscriber.findOne({ email, dropId: drop._id });
    if (existing) {
      return res.status(400).json({ message: "You already subscribed." });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const subscriber = new Subscriber({
      fullName,
      email,
      phone,
      city,
      dropId: drop._id,
      tags,
      verificationToken,
    });

    await subscriber.save();

    await sendVerificationEmail({ email, token: verificationToken });

    res.status(200).json({ message: "Subscribed. Check your email to confirm." });
  } catch (error) {
    console.error("Subscribe error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/alldrops",getAllDrops)
router.get("/:id",getDropWithId).put("/:id",updateDrop)
router.get("/messages/:id",getMessagesByDropId).post("/messages/:id",addScheduleMessage)
router.delete('/:dropId', deleteDropHandler);
export default router;
