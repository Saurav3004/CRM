import express from 'express';
import { getAllUsersWithDetails, getUserProfileById } from '../controllers/userController.js';
const router = express.Router()


router.get('/allusers',getAllUsersWithDetails)
router.get("/:id",getUserProfileById)

export default router