import axios from 'axios';
import qs from 'qs';
import { config } from 'dotenv';
import { User } from '../models/userModel.js';
import { Booking } from '../models/bookingModel.js';
import { Ticket } from '../models/ticketModel.js';
import { Payment } from '../models/paymentModel.js';
config();

const tokenStore = new Map(); // { userId: accessToken }

// Step 1: OAuth Redirect
export const eventbriteOAuthStart = (req, res) => {
  const url = `https://www.eventbrite.com/oauth/authorize?response_type=code&client_id=${process.env.EVENTBRITE_CLIENT_ID}&redirect_uri=${process.env.EVENTBRITE_REDIRECT_URI}&scope=event_management%20organizer_read%20event_read%20user_read%20attendee_read%20order_read`;
  console.log('[🔁 Redirecting to Eventbrite OAuth]:', url);
  res.redirect(url);
};

// Step 2: OAuth Callback
export const eventbriteOAuthCallback = async (req, res) => {
  const { code } = req.query;
  console.log('[✅ OAuth callback code]:', code);
  try {
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
    console.log(accessToken)

    const { data: userInfo } = await axios.get(
      'https://www.eventbriteapi.com/v3/users/me/',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const userId = userInfo.id;
    const email = userInfo.emails[0].email
    console.log(email)
    tokenStore.set(userId, accessToken);
    console.log('[💾 Token stored for userId]:', userId,"and token is",accessToken);

    res.send(`
      <script>
        window.opener.location.href = 'http://localhost:5173/integration?userId=${userId}';
        window.close();
      </script>
    `);
  } catch (err) {
    console.error('[❌ Callback Error]:', err.response?.data || err.message);
    res.status(400).send('OAuth failed');
  }
};

// Authenticated API helper
const getEB = (userId) => {
  const token = tokenStore.get(userId);
  if (!token) throw new Error('No token for this user');
  return axios.create({
    baseURL: 'https://www.eventbriteapi.com/v3',
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Fetch Organizers
export const getOrganizers = async (req, res) => {
  const { userId } = req.query;
  try {
    const EB = getEB(userId);
    const { data } = await EB.get('/users/me/organizations/');
    res.json({ organizers: data.organizations });
  } catch (error) {
    console.error('[❌ getOrganizers error]:', error.response?.data || error.message);
    res.status(401).json({ error: 'Unauthorized or no organizers found' });
  }
};

// Fetch Events directly from user (no organizerId needed)
export const getEvents = async (req, res) => {
  const { userId } = req.query;
  try {
    console.log('[🔍 Incoming userId]:', userId);
    const token = tokenStore.get(userId);
    console.log('[🔍 Stored token]:', token);
    if (!token) return res.status(401).json({ error: 'No token for this user' });

    const EB = axios.create({
      baseURL: 'https://www.eventbriteapi.com/v3',
      headers: { Authorization: `Bearer ${token}` },
    });

    // Step 1: Get Organization ID
    const { data: orgData } = await EB.get('/users/me/organizations/');
    const orgId = orgData.organizations?.[0]?.id;
    if (!orgId) return res.status(404).json({ error: 'No organization found' });

    console.log('[🏢 Using organization ID]:', orgId);

    // Step 2: Get Events for that Organization
    const { data } = await EB.get(`/organizations/${orgId}/events/?status=live,draft,started,ended,completed`);

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

// Sync Attendees for a Given Event
export const syncEventData = async (req, res) => {
  const { userId, eventId } = req.body;

  try {
    console.log('[🔄 Syncing attendees for eventId]:', eventId, 'userId:', userId);

    const EB = getEB(userId); // This uses the accessToken from tokenStore
    const { data: attendeesData } = await EB.get(`/events/${eventId}/attendees/?expand=order,event,attendee,quantity`);

    console.log('[📥 Attendees fetched]:', attendeesData.attendees.length);

    let inserted = 0;

    for (const a of attendeesData.attendees) {
      const uData = a.profile;
      const bookingId = a.order_id;
      const ticketPrice = parseFloat(a.costs.gross.value) / 100;

      let user = await User.findOne({ email: uData.email });
      if (!user) {
        user = await User.create({
          firstName: uData.first_name,
          lastName: uData.last_name,
          email: uData.email,
        });
      }

      let booking = await Booking.findOne({ bookingId });
if (!booking) {
  // Count how many attendees share the same order_id
  const attendeesInOrder = attendeesData.attendees.filter(att => att.order_id === bookingId);
  const quantity = attendeesInOrder.length;

  booking = await Booking.create({
    bookingId,
    user: user._id,
    eventName: a.event?.name?.text || 'Unknown Event',
    venue: a.event?.venue?.name || '',
    quantity,
    totalPaid: ticketPrice * quantity,
    bookedDate: new Date(a.created),
    tickets: []
  });
}


      const ticket = await Ticket.create({
        ticketCode: a.barcode || `TIX-${bookingId}-${Math.floor(Math.random() * 10000)}`,
        bookingId: booking._id,
        user: user._id,
        eventName: a.event?.name.text,
        ticketPrice,
        qrCode: a.barcode
      });

      booking.tickets.push(ticket._id);
      await booking.save();

      const payExists = await Payment.findOne({ paymentId: bookingId });
      if (!payExists) {
        await Payment.create({
          paymentId: bookingId,
          user: user._id,
          booking: booking._id,
          amount: ticketPrice,
          method: a.payment?.method || 'unknown',
          status: a.status,
          transactionDate: new Date(a.created),
          // currency: a.ticket_class.currency
        });
      }

      await User.updateOne(
        { _id: user._id },
        { $inc: { totalSpent: ticketPrice, ticketsPurchased: 1 }, $set: { lastActivity: new Date() } }
      );

      inserted++;
    }

    console.log(`[✅ Synced ${inserted} attendees]`);
    res.json({ message: `Synced ${inserted} attendees.` });

  } catch (error) {
    console.error('[❌ syncEventData error]:', error.response?.data || error.message);
    res.status(500).json({ message: 'Sync failed' });
  }
};


