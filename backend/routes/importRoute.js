import express from 'express'
import { addContactHandler, importCSVData } from '../controllers/importController.js'
import upload from '../utils/multer.js'
const router = express.Router()



router.post('/import-excel',upload.none(),importCSVData)
router.post('/addcontact',addContactHandler)

export default router