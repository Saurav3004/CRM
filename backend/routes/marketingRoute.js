import express from 'express';
import { sendMarketingMessage } from '../controllers/marketingHandler.js';
const router = express.Router()

router.post("/send",sendMarketingMessage)

export default router