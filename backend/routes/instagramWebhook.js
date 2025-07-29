// routes/instagramWebhook.js
import express from "express";
import Drop from "../models/dropModel.js";
import { sendInstagramMessage } from "../utils/sendInstagramMessage.js";
// import Subscriber from "../models/subscriberModel.js";
import InstagramSubscriberModel from "../models/InstagramSubscriberModel.js";
const router = express.Router();

router.get("/", (req, res) => {
  const VERIFY_TOKEN = "1234560987"; // This should match what you enter on Facebook Developer Portal

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ Webhook verified successfully!");
      return res.status(200).send(challenge);
    } else {
      console.log("❌ Token mismatch.");
      return res.sendStatus(403);
    }
  }

  res.sendStatus(400);
});


router.post("/", async (req, res) => {
  try {
    const messagingEvent = req.body?.entry?.[0]?.messaging?.[0];

    const senderId = messagingEvent?.sender?.id || null;
    const message = messagingEvent?.message;
    const messageText = message?.text?.toLowerCase() || null;
    const isEcho = message?.is_echo || false;

    if (!messageText || !senderId || isEcho) {
      return res.sendStatus(200);
    }

    const drop = await Drop.findOne({ keywords: messageText });

    if (drop) {
      // 🔄 Upsert subscriber
      let subscriber = await InstagramSubscriberModel.findOne({ instagramId: senderId });

      if (!subscriber) {
        subscriber = new InstagramSubscriberModel({
          instagramId: senderId,
          subscribedDrops: [{ drop: drop._id }],
        });
      } else {
        const alreadySubscribed = subscriber.subscribedDrops.some(
          (d) => d.drop.toString() === drop._id.toString()
        );
        if (!alreadySubscribed) {
          subscriber.subscribedDrops.push({ drop: drop._id });
        }
      }

      await subscriber.save();

      const responseText = `🎟️ Get your tickets for "${drop.name}": ${process.env.FRONTEND_URL}/subscribe/${drop.slug}`;
      await sendInstagramMessage(senderId, responseText);
    } else {
      await sendInstagramMessage(senderId, `Sorry, no drop found for "${messageText}".`);
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    return res.sendStatus(500);
  }
});


export default router;
