import express from 'express'
import Server from '../src/server'
import serverless from 'serverless-http'

const app = express()
const server = new Server(app)

export const handler = serverless(server.getApp())
export default handler
