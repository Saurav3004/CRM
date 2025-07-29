import cron from "node-cron";
import ScheduledMessage from "../models/scheduledMessageModel.js";
// import Drop from "../models/Drop.js";
import InstagramSubscriber from "../models/InstagramSubscriberModel.js";
import {sendInstagramMessage} from "../utils/sendInstagramMessage.js";
// import sendEmail from "../utils/sendEmail.js";

// Runs every minute
cron.schedule('*/20 * * * * *', async () => {
  const now = new Date();
  const istTime = now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }); 
 

const oneMinuteAgo = new Date(now.getTime() - 30 * 1000); // 30 seconds before now
const oneMinuteLater = new Date(now.getTime() + 30 * 1000); // 30 seconds after now

  try {
 console.log(`🕐 [Cron] Running scheduled message job at ${istTime}`);
    // 🔍 Only pick messages that are due and not already sent
    const messages = await ScheduledMessage.find({
  scheduledAt: { $gte: oneMinuteAgo, $lte: oneMinuteLater },
  status: "pending"
}).populate("drop");

    if (!messages.length) {
      console.log("⏳ No pending scheduled messages to send.",messages);
      return;
    }

    for (const msg of messages) {
      const { drop, message, channel, _id } = msg;
      const dropId = drop?._id;

      if (!drop) {
        console.warn(`⚠️ Drop not found for message ID: ${_id}`);
        continue;
      }

      console.log(`📤 Sending "${channel}" message for drop: "${drop.name}"`);

      // ✅ Get subscribers for this drop
     const subscribers = await InstagramSubscriber.find({
  subscribedDrops: { $elemMatch: { drop: dropId } }
});

      if (!subscribers.length) {
        console.log(`📭 No Instagram subscribers found for drop: ${drop.name}`);
        // Optional: mark message as cancelled or failed
        await ScheduledMessage.findByIdAndUpdate(_id, { status: "cancelled" });
        continue;
      }

      for (const subscriber of subscribers) {
        try {
          if (channel === "instagram" && subscriber.instagramId) {
            await sendInstagramMessage(subscriber.instagramId, message);
          } else if (channel === "email" && subscriber.email) {
            await sendEmail(subscriber.email, "📢 Event Update", message);
          } else {
            console.warn(`❌ No valid channel for subscriber ${subscriber._id}`);
          }
        } catch (err) {
          console.error(`⚠️ Failed to send message to subscriber ${subscriber._id}:`, err.message);
        }
      }

      // ✅ Mark as sent
      await ScheduledMessage.findByIdAndUpdate(_id, { status: "sent", sentAt: new Date() });

      console.log(`✅ Message marked as sent for drop: "${drop.name}"`);
    }
  } catch (err) {
    console.error("❌ Error in scheduled message cron job:", err.message);
  }
});
