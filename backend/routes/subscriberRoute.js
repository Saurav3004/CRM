import express from "express";
import Subscriber from "../models/subscriberModel.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { fullName, email, phone, city, dropId } = req.body;

    const exists = await Subscriber.findOne({ email, dropId });
    if (exists) {
      return res.status(409).json({ message: "Already subscribed" });
    }

    const subscriber = new Subscriber({ fullName, email, phone, city, dropId });
    await subscriber.save();

    res.status(201).json(subscriber);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
