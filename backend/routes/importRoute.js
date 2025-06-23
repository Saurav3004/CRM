import express from 'express'
import { importCSVData } from '../controllers/importController.js'
import upload from '../utils/multer.js'
const router = express.Router()



router.post('/import-excel',upload.none(),importCSVData)

export default router