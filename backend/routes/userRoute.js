import express from 'express';
import { getAllUsers, getUserProfile, importCSVData } from '../controllers/userController.js';
import upload from '../utils/multer.js'
const router = express.Router()

router.post('/import-excel',upload.none(),importCSVData)
router.get('/allusers',getAllUsers)
router.get("/:id",getUserProfile)

export default router