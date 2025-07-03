import express from 'express';
import {
  eventbriteOAuthStart,
  eventbriteOAuthCallback,
  getEvents
} from '../controllers/IntegrationController.js';

const router = express.Router();

router.get('/connect', eventbriteOAuthStart);
router.get('/callback', eventbriteOAuthCallback);
router.get('/events', getEvents);

export default router;
