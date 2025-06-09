import { Application, Request, Response } from 'express'
import { HTTP_STATUS } from '~/constants/http'
// import userRoute from '~/features/user/route/user.route'

const appRoutes = (app: Application) => {
  // app.use('/api/v1/users', userRoute)
  app.use('/', (req: Request, res: Response) => {
    return res.status(HTTP_STATUS.OK).json('connected successfully')
  })
}

export default appRoutes
