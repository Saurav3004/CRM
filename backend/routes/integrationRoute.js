import express from 'express';
import {
  eventbriteOAuthStart,
  eventbriteOAuthCallback,
  getEvents,
  syncEventData,
} from '../controllers/IntegrationController.js';

const router = express.Router();

router.get('/connect', eventbriteOAuthStart);
router.get('/callback', eventbriteOAuthCallback);
// router.get('/my-organizers', getOrganizers);
router.get('/organizer-events', getEvents);
router.post('/sync-event', syncEventData);



export default router;
