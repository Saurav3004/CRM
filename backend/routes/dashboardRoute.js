// routes/dashboardRoutes.js
import express from 'express';
import { getAgeDistribution, getDashboardKPIs, getFunnelData, getRecentData, getSegmentsOverview, getSpenderInsights, getTopEvents, getTrendsData } from '../controllers/dashboardController.js';
const router = express.Router();

router.get('/kpis', getDashboardKPIs);
router.get('/recent',getRecentData)
router.get('/top-events',getTopEvents)
router.get('/trends',getTrendsData)
router.get('/spender-insights', getSpenderInsights);
router.get('/segments', getSegmentsOverview);
router.get('/funnel', getFunnelData);
router.get('/age-distribution', getAgeDistribution);

export default router;
