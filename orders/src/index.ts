import mongoose from 'mongoose'
import { app } from './app'
import { natsWrapper } from './Nats'
import { TicketCreatedListener } from './events/listeners/TicketCreatedListener'
import { TicketUpdatedListener } from './events/listeners/TicketUpdatedListener'
import { ExpirationCompletedListener } from './events/listeners/ExpirationCompletedListener'
import { PaymentCreatedListener } from './events/listeners/PaymentCreatedListener'

const start = async () => {
    const envs = ['MONGO_URI', 'NATS_URL', 'NATS_CLIENT_ID', 'NATS_CLUSTER_ID']
    envs.forEach((env) => {
        if (!(env in process.env)) {
            throw new Error(env + ' is not defined')
        }
    })

    const { NATS_CLUSTER_ID, NATS_CLIENT_ID, NATS_URL, MONGO_URI } = process.env

    try {
        await natsWrapper.connect(NATS_CLUSTER_ID!, NATS_CLIENT_ID!, NATS_URL!)
        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed')
            process.exit()
        })
        process.on('SIGINT', () => natsWrapper.client.close())
        process.on('SIGTERM ', () => natsWrapper.client.close())

        new TicketCreatedListener(natsWrapper.client).listen()
        new TicketUpdatedListener(natsWrapper.client).listen()
        new ExpirationCompletedListener(natsWrapper.client).listen()
        new PaymentCreatedListener(natsWrapper.client).listen()

        await mongoose.connect(MONGO_URI!)
        console.log('Connected to DB')
    } catch (err) {
        console.error(err)
    }

    app.listen(3000, () => {
        console.log('listening on port 3000')
    })
}

start()
