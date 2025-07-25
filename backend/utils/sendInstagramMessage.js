import axios from "axios";
import { config } from "dotenv";
config();

export const sendInstagramMessage = async (recipientId, message) => {
  const pageId = '697181333484420'
const url = `https://graph.facebook.com/v19.0/${pageId}/messages?access_token=${process.env.IG_PAGE_ACCESS_TOKEN}`;  console.log("🟢 Sending message to:", recipientId);
  console.log("🌐 URL:", url);
  console.log("📦 Payload:", {
    messaging_type: "RESPONSE",
    recipient: { id: recipientId },
    message: { text: message }
  });

  try {
    const response = await axios.post(url, {
      messaging_type: "RESPONSE",
      recipient: { id: recipientId },
      message: { text: message }
    });

    console.log("✅ Message sent successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error sending Instagram message:", error.response?.data || error.message);
    // Do not crash the app
    return null;
  }
};
