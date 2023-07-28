import { natsWrapper } from './Nats'
import { OrderCreatedListener } from './events/listeners/OrderCreatedListener'

const start = async () => {
    const envs = ['NATS_URL', 'NATS_CLIENT_ID', 'NATS_CLUSTER_ID']
    envs.forEach((env) => {
        if (!(env in process.env)) {
            throw new Error(env + ' is not defined')
        }
    })

    const { NATS_CLUSTER_ID, NATS_CLIENT_ID, NATS_URL } = process.env

    try {
        await natsWrapper.connect(NATS_CLUSTER_ID!, NATS_CLIENT_ID!, NATS_URL!)
        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed')
            process.exit()
        })
        process.on('SIGINT', () => natsWrapper.client.close())
        process.on('SIGTERM ', () => natsWrapper.client.close())

        new OrderCreatedListener(natsWrapper.client).listen()
    } catch (err) {
        console.error(err)
    }
}

start()
