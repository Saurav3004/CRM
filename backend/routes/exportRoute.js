import express from 'express';
import { exportData } from '../controllers/exportController.js';
const router = express.Router()

router.post('/data',exportData)

export default router