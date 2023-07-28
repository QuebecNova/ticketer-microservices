import {
    Listener,
    Subjects,
    ExpirationCompletedEvent,
    OrderStatus,
    NotFoundError,
} from '@quebecnovaorg/common'
import { Message } from 'node-nats-streaming'
import { queueGroupName } from './queueGroupName'
import { Order } from '../../models/order'
import { OrderCancelledPublisher } from '../publishers/OrderCancelledPublisher'

export class ExpirationCompletedListener extends Listener<ExpirationCompletedEvent> {
    readonly subject = Subjects.ExpirationCompleted
    queueGroupName = queueGroupName

    async onMessage(data: ExpirationCompletedEvent['data'], msg: Message) {
        const { orderId } = data

        const order = await Order.findById(
            orderId,
        ).populate('ticket')

        if (!order) {
            throw new NotFoundError('Order not found')
        }

        if (order.status === OrderStatus.Completed) {
            return msg.ack()
        }

        order.set({status: OrderStatus.Cancelled})
        await order.save()

        await new OrderCancelledPublisher(this.client).publish({
            id: order!.id,
            version: order!.version,
            userId: order!.userId,
            ticket: {
                id: order!.ticket.id,
            },
        })

        msg.ack()
    }
}
