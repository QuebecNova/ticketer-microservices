import Queue from 'bull'
import { ExpirationCompletedPublisher } from '../events/publishers/ExpirationCompletedPublisher'
import { natsWrapper } from '../Nats'

type Payload = {
    orderId: string
} 

export const expirationQueue = new Queue<Payload>('order:expiration', {
    redis: {
        host: process.env.REDIS_HOST
    }
})

expirationQueue.process(async (job) => {
    new ExpirationCompletedPublisher(natsWrapper.client).publish({
        orderId: job.data.orderId
    })
})