import {
    Listener,
    OrderCreatedEvent,
    Subjects,
    pick,
} from '@quebecnovaorg/common'
import { queueGroupName } from './queueGroupName'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../models/ticket'
import { TicketUpdatedPublisher } from '../publishers/TicketUpdatedPublisher copy'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated
    queueGroupName = queueGroupName

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const ticket = await Ticket.findById(data.ticket.id)

        if (!ticket) {
            throw new Error('Ticket not found')
        }

        await ticket.set('orderId', data.id).save()

        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            price: ticket.price,
            title: ticket.title,
            userId: ticket.userId,  
            orderId: ticket.orderId,
            version: ticket.version,
        })

        msg.ack()
    }
}
