import nats from 'node-nats-streaming'
import { TicketCreatedPublisher } from './events/TicketCreatedPublisher'
import { randomBytes } from 'crypto'

const stan = nats.connect('ticketer', randomBytes(4).toString("hex"), {
    url: 'http://localhost:4222'
})

stan.on('connect', async () => {
    console.log('Publisher connected to NATS')

    const publisher = new TicketCreatedPublisher(stan)
    
    try {
        await publisher.publish({
            id:  '123',
            title: 'title',
            price: 20
        })
    } catch (err) {
        console.error(err)
    }
})