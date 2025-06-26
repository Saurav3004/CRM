// routes/bookingRoutes.js
import express from 'express';
import { getBookingDetails } from '../controllers/bookingController.js';
const router = express.Router();

router.get('/:bookingId', getBookingDetails);

export default router;
