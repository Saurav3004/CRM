// routes/verifyRoutes.js

import express from "express";
import Subscriber from "../models/subscriberModel.js";
import { config } from "dotenv";

const router = express.Router();
config()

router.get("/:token", async (req, res) => {
  try {
    const subscriber = await Subscriber.findOne({ verificationToken: req.params.token });

    if (!subscriber) {
      return res.status(400).send("Invalid or expired token.");
    }

    subscriber.isVerified = true;
    subscriber.verificationToken = undefined;
    await subscriber.save();

    return res.redirect(`${process.env.FRONTEND_URL}/verify/success`);
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
});

export default router;
