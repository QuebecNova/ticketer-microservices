import express from 'express'
import 'express-async-errors'
import cookieSession from 'cookie-session'
import { NotFoundError, currentUser, errorHandler } from '@quebecnovaorg/common'
import { paymentsRouter } from './routes/payments'

export const app = express()

app.set('trust proxy', true)

app.use(express.json())

app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
}))

app.use(currentUser)

app.use('/api/v1/payments', paymentsRouter)

app.all('*', async (req, res) => {
    throw new NotFoundError(req.originalUrl)
})

app.use(errorHandler)