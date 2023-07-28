import { Listener, OrderCreatedEvent, Subjects } from '@quebecnovaorg/common'
import { queueGroupName } from './queueGroupName'
import { Message } from 'node-nats-streaming'
import { expirationQueue } from '../../queue/expirationQueue'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated
    queueGroupName = queueGroupName

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime()
        console.log('waiting', delay / 1000 / 60, 'ms')
        await expirationQueue.add(
            {
                orderId: data.id,
            },
            { delay }
        )

        msg.ack()
    }
}
