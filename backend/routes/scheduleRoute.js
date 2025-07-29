import express from 'express'
import { deleteScheduledMessageHandler, scheduleMessageHandler, updateScheduledMessageHandler } from '../controllers/scheduleController.js'

const router = express.Router()

router.post("/:dropId",scheduleMessageHandler)
router.delete('/:id', deleteScheduledMessageHandler);
router.put('/:id', updateScheduledMessageHandler);



export default router