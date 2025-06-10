import express from 'express'
import { dictionaryController } from '../controller/dictionary.controller'
const dictionaryRoute = express.Router()

// // global middlewares
// chatRoute.use(verifyUser)
// chatRoute.use(preventInActiveUser)

dictionaryRoute.post('/', dictionaryController.searchDictionary)

export default dictionaryRoute
