import {User} from '../models/userModel.js';
import nodemailer from 'nodemailer';
import { config } from 'dotenv';
// import twilio from 'twilio'; // Uncomment if using Twilio
import twilio from 'twilio';

config()
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port:587,
  secure:false,
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendMarketingMessage = async (req, res) => {
  const { userIds, channel, message } = req.body;
  console.log(req.body)

  try {
    if (!userIds?.length || !channel || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const users = await User.find({ _id: { $in: userIds }, marketingOptIn: true });

    for (const user of users) {
      switch (channel) {
        case 'email':
          await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: '📢 Marketing Message',
            text: message,
            html: `<p>${message}</p>`,
          });
          break;

        case 'sms':
          console.log(`📲 Sending SMS to ${user.mobile}: ${message}`);
          if (user.mobile) {
        await twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: user.mobile, // Must be in E.164 format (+91...)
        });
        console.log(`✅ SMS sent to ${user.mobile}`);
      } else {
        console.warn(`⚠️ No mobile number for user ${user._id}`);
      }
      break;

        case 'whatsapp':
          console.log(`💬 Sending WhatsApp to ${user.mobile}: ${message}`);
          // Implement real WhatsApp API here
          break;

        default:
          console.warn('Unsupported channel:', channel);
      }
    }

    res.status(200).json({ message: `✅ Marketing messages sent via ${channel}` });
  } catch (err) {
    console.error('Marketing Send Error:', err);
    res.status(500).json({ error: 'Failed to send marketing messages' });
  }
};
