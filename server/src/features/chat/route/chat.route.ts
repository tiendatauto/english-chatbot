import express from 'express'
import { chatController } from '../controller/chat.controller'
import { upload } from '~/middlewares/upload.middleware'

const chatRoute = express.Router()

// // global middlewares
// chatRoute.use(verifyUser)
// chatRoute.use(preventInActiveUser)

chatRoute.post('/', chatController.chat)
chatRoute.post('/whisper', upload.single('file'), chatController.whisper)
export default chatRoute
