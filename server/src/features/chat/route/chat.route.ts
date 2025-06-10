import express from 'express'
import { chatController } from '../controller/chat.controller'
// import { userController } from '../controller/user.controller'
// import { validateSchema } from '~/globals/middlewares/validate.middleware'
// import { userSchemaCreate, userSchemaUpdate } from '../schema/user.schema'

const chatRoute = express.Router()

// // global middlewares
// chatRoute.use(verifyUser)
// chatRoute.use(preventInActiveUser)

chatRoute.post('/', chatController.chat)

export default chatRoute
