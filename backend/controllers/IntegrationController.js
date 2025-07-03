import axios from 'axios';
import qs from 'qs';
import { config } from 'dotenv';

config();

// In-memory token store (replace with DB for production)
const tokenStore = new Map(); // { userId: accessToken }

// Step 1: Start OAuth
export const eventbriteOAuthStart = (req, res) => {
  const authUrl = `https://www.eventbrite.com/oauth/authorize?response_type=code&client_id=${process.env.EVENTBRITE_CLIENT_ID}&redirect_uri=${process.env.EVENTBRITE_REDIRECT_URI}&scope=event_management%20organizer_read%20event_read%20user_read%20attendee_read%20order_read`;
  console.log('[🔁 Redirecting to Eventbrite OAuth]:', authUrl);
  res.redirect(authUrl);
};

// Step 2: OAuth Callback
export const eventbriteOAuthCallback = async (req, res) => {
  const { code } = req.query;
  console.log('[✅ Received OAuth callback] Code:', code);

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
    console.log('[✅ Access Token Received]:', accessToken);

    const { data: userInfo } = await axios.get('https://www.eventbriteapi.com/v3/users/me/', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const userId = userInfo.id;
    console.log('[👤 Eventbrite User Info]:', userInfo);

    tokenStore.set(userId, accessToken);
    console.log('[💾 Token stored for userId]:', userId);

    res.redirect(`http://localhost:5173/integration?userId=${userId}`);
  } catch (error) {
    console.error('[❌ OAuth Callback Error]:', error.response?.data || error.message);
    res.status(400).send('OAuth failed');
  }
};

// Step 3: Fetch Events directly (no organizer needed)
export const getEvents = async (req, res) => {
  const { userId } = req.query;
  const token = tokenStore.get(userId);

  if (!token) return res.status(401).json({ error: 'Unauthorized: No token found' });

  try {
    const EB = axios.create({
      baseURL: 'https://www.eventbriteapi.com/v3',
      headers: { Authorization: `Bearer ${token}` },
    });

    const { data } = await EB.get('/users/me/events/');
    const events = data.events.map(e => ({
      id: e.id,
      name: e.name.text,
      start: e.start.local,
    }));

    console.log('[📦 Events fetched]:', events.length);
    res.json({ events });
  } catch (err) {
    console.error('[❌ getEvents error]:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};
