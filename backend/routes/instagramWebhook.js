// routes/instagramWebhook.js
import express from "express";
import Drop from "../models/dropModel.js";
import { sendInstagramMessage } from "../utils/sendInstagramMessage.js";
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

    console.log("🔔 Webhook triggered");
    console.log("👤 Sender ID:", senderId);
    console.log("💬 Message:", messageText);

    // Ignore echo messages or anything without text
    if (!messageText || !senderId || isEcho) {
      console.log("⛔ Skipping self-message or invalid");
      return res.sendStatus(200);
    }

    // Search for drop
    const drop = await Drop.findOne({ keywords: messageText });
    const responseText = drop
      ? `🎟️ Get your tickets for "${drop.name}": ${process.env.FRONTEND_URL}/subscribe/${drop.slug}`
      : `Sorry, I couldn't find any drop for "${messageText}".`;

    console.log("📤 Responding with:", responseText);
    await sendInstagramMessage(senderId, responseText);

    return res.sendStatus(200);
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return res.sendStatus(500);
  }
});








export default router;
