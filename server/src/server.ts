// src/server.ts
import express, { Application, NextFunction, Request, Response } from 'express'
import appRoutes from './routes/appRoutes'
import { CustomError, IError, NotFoundException } from './middlewares/error.middleware'
import { HTTP_STATUS } from './constants/http'
import cors from 'cors'

export default class Server {
  private app: Application

  constructor(app: Application) {
    this.app = app
  }

  public setup(): void {
    this.setupMiddleware()
    this.setupRoutes()
    this.setupGlobalError()
  }

  public getApp(): Application {
    return this.app
  }

  public start(): void {
    // Chỉ gọi khi chạy local
    this.setup()
    const port = parseInt(process.env.PORT || '5050')
    this.app.listen(port, () => {
      console.log(`Server listening on port ${port}`)
    })
  }

  private setupMiddleware(): void {
    this.app.use(cors())
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
  }

  private setupRoutes(): void {
    appRoutes(this.app)
  }

  private setupGlobalError(): void {
    this.app.all('*', (req, res, next) => {
      return next(new NotFoundException(`The url ${req.originalUrl} not found`))
    })

    this.app.use((error: IError, req: Request, res: Response, next: NextFunction) => {
      console.log('check error: ', error)
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json(error.getErrorResponse())
      }

      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error })
    })
  }
}
