// ✅ Final backend Eventbrite controller (with Token persistence + tokenStore + user linking)

import axios from 'axios';
import qs from 'qs';
import { config } from 'dotenv';
import { User } from '../models/userModel.js';
import { Booking } from '../models/bookingModel.js';
import { Ticket } from '../models/ticketModel.js';
import { Payment } from '../models/paymentModel.js';
import { Token } from '../models/tokenModel.js';
// import { tokenStore } from '../utils/tokenStore.js';
config();

const tokenStore = new Map(); // In-memory cache { userId: accessToken }

// Step 1: OAuth Redirect
export const eventbriteOAuthStart = (req, res) => {
  const url = `https://www.eventbrite.com/oauth/authorize?response_type=code&client_id=${process.env.EVENTBRITE_CLIENT_ID}&redirect_uri=${process.env.EVENTBRITE_REDIRECT_URI}&scope=event_management%20organizer_read%20event_read%20user_read%20attendee_read%20order_read`;
  res.redirect(url);
};

// Step 2: OAuth Callback
export const eventbriteOAuthCallback = async (req, res) => {
  const { code } = req.query;

  try {
    // Step 1: Exchange code for access token
    const { data } = await axios.post(
      'https://www.eventbrite.com/oauth/token',
      qs.stringify({
        code,
        client_id: process.env.EVENTBRITE_CLIENT_ID,
        client_secret: process.env.EVENTBRITE_CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: process.env.EVENTBRITE_REDIRECT_URI,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const accessToken = data.access_token;

    // Step 2: Get organizer's user info
    const { data: userInfo } = await axios.get(
      'https://www.eventbriteapi.com/v3/users/me/',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const eventbriteId = userInfo.id;
    const email = userInfo.email || userInfo.emails?.[0]?.email || null;

    // ✅ Instead of creating a User, store only the token info
    const tokenDoc = await Token.findOneAndUpdate(
      { platformUserId: eventbriteId, platform: 'eventbrite' },
      {
        accessToken,
        connected: true,
      },
      { upsert: true, new: true }
    );

    tokenStore.set(`${tokenDoc._id}`, accessToken); // Store by token ID or platform ID

    res.send(`
      <script>
        window.opener.location.href = 'http://localhost:5173/integration?userId=${tokenDoc._id}';
        window.close();
      </script>
    `);
  } catch (err) {
    console.error('[❌ OAuth Callback Error]:', err.response?.data || err.message);
    res.status(400).send('OAuth failed');
  }
};


// Helper to retrieve EB client with token
const getEB = async (userId) => {
  let token = tokenStore.get(userId);

  if (!token) {
    const tokenDoc = await Token.findOne({ userId, platform: 'eventbrite' });
    if (!tokenDoc) throw new Error('No Eventbrite token found');
    token = tokenDoc.accessToken;
    tokenStore.set(userId, token);
  }

  return axios.create({
    baseURL: 'https://www.eventbriteapi.com/v3',
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ✅ New API to check if Eventbrite is connected for this user
export const checkEventbriteAuth = async (req, res) => {
  const { userId } = req.query;
  const tokenDoc = await Token.findOne({ userId, platform: 'eventbrite' });
  res.json({ connected: !!tokenDoc });
};

// ✅ Get events from user's Eventbrite account
export const getEvents = async (req, res) => {
  const { userId } = req.query;
  try {
    const EB = await getEB(userId);
    const { data: orgData } = await EB.get('/users/me/organizations/');
    const orgId = orgData.organizations?.[0]?.id;

    if (!orgId) return res.status(404).json({ error: 'No organization found' });

    const { data } = await EB.get(`/organizations/${orgId}/events/?status=live,draft,started,ended,completed`);
    console.log(data)
    res.json({
      events: data.events.map(e => ({
        id: e.id,
        name: e.name.text,
        start: e.start.local,
        image: e.logo?.url || null,
        url: e.url,
      })),
    });
  } catch (err) {
    console.error('[❌ getEvents error]:', err.response?.data || err.message);
    res.status(500).json({ error: 'Could not fetch events' });
  }
};

// ✅ Sync Attendees
export const syncEventData = async (req, res) => {
  const { userId, eventId } = req.body;

  try {
    const EB = await getEB(userId);

    const { data: attendeesData } = await EB.get(
      `/events/${eventId}/attendees/?expand=order,event`
    );

    let inserted = 0;
    const eventName = attendeesData.attendees[0]?.event?.name?.text || 'Unknown Event';

    for (const attendee of attendeesData.attendees) {
      const profile = attendee.profile;
      const bookingId = attendee.order_id;
      const email = profile?.email;

      // Skip if email is missing
      if (!email) continue;

      // Avoid duplicate ticket creation
      const barcode = attendee.barcode || `TIX-${bookingId}-${attendee.id}`;
      const ticketExists = await Ticket.findOne({ qrCode: barcode });
      if (ticketExists) continue;

      // ✅ Get opt-in preference
      const marketingConsent = attendee.opted_in === true;

      // 🔍 Find or create user
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          firstName: profile.first_name,
          lastName: profile.last_name,
          email,
          marketingOptIn: marketingConsent, // 👈 set marketing option
        });
      } else {
        // Update opt-in status if user already exists
        await User.updateOne(
          { _id: user._id },
          { $set: { marketingOption: marketingConsent } }
        );
      }

      // 🔍 Check if user already has a booking for this event
      const hasExistingBookingForEvent = await Booking.exists({
        user: user._id,
        eventName: eventName,
      });

      const ticketPrice = parseFloat(attendee.costs.gross.value) / 100;

      // Find or create booking
      let booking = await Booking.findOne({ bookingId });
      if (!booking) {
        const attendeesInOrder = attendeesData.attendees.filter(
          a => a.order_id === bookingId
        );
        const quantity = attendeesInOrder.length;

        booking = await Booking.create({
          bookingId,
          user: user._id,
          eventName: eventName,
          venue: attendee.event?.venue?.name || '',
          quantity,
          totalPaid: ticketPrice * quantity,
          bookedDate: new Date(attendee.created),
          source: 'eventbrite',
          tickets: [],
        });
      }

      // Create ticket
      const ticket = await Ticket.create({
        ticketCode: barcode,
        bookingId: booking._id,
        user: user._id,
        eventName,
        ticketPrice,
        qrCode: barcode,
      });

      booking.tickets.push(ticket._id);
      await booking.save();

      // Create payment if not already exists
      const payExists = await Payment.findOne({ paymentId: bookingId });
      if (!payExists) {
        await Payment.create({
          paymentId: bookingId,
          user: user._id,
          booking: booking._id,
          amount: ticketPrice,
          method: attendee.payment?.method || 'unknown',
          status: attendee.status || 'completed',
          transactionDate: new Date(attendee.created),
          currency: attendee.costs?.gross?.currency || 'AUD',
        });
      }

      // Update user stats
      const userUpdate = {
        $inc: {
          totalSpent: ticketPrice,
          ticketsPurchased: 1,
        },
        $set: { lastActivity: new Date(attendee.created) },
      };

      if (!hasExistingBookingForEvent) {
        userUpdate.$inc.eventsPurchased = 1;
      }

      await User.updateOne({ _id: user._id }, userUpdate);

      inserted++;
    }

    res.json({ message: `✅ Synced ${inserted} new attendees.` });
  } catch (error) {
    console.error('[❌ syncEventData error]:', error.response?.data || error.message);
    res.status(500).json({ message: 'Sync failed' });
  }
};




export const disconnectEventbrite = async (req, res) => {
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ message: 'Missing userId' });

  try {
    const tokenDoc = await Token.findOne({ _id:userId, platform: 'eventbrite' });

    if (!tokenDoc) {
      console.log('[❗] No token found to delete for:', userId);
      return res.status(404).json({ message: 'No token found' });
    }

    console.log('[🔍 Found Token]:', tokenDoc);

    const result = await Token.deleteOne({ _id:userId, platform: 'eventbrite' });
    console.log('[🗑️ Delete Result]:', result);

    // Remove from memory store
    tokenStore.delete(userId);

    res.json({ message: '🔌 Successfully disconnected from Eventbrite.' });
  } catch (err) {
    console.error('[❌ Disconnect Error]:', err.message);
    res.status(500).json({ message: 'Failed to disconnect' });
  }
};

export const checkEventbriteStatus = async (req, res) => {
  const { userId } = req.query;

  if (!userId) return res.status(400).json({ connected: false });

  const token = await Token.findOne({ _id:userId, platform: 'eventbrite' });
  if (token) {
    res.json({ connected: true });
  } else {
    res.json({ connected: false });
  }
};





