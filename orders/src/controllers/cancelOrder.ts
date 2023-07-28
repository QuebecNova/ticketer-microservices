import { Request, Response } from 'express'
import {
    NotAuthorizedError,
    NotFoundError,
    OrderStatus,
} from '@quebecnovaorg/common'
import { Order } from '../models/order'
import { OrderCancelledPublisher } from '../events/publishers/OrderCancelledPublisher'
import { natsWrapper } from '../Nats'

export const cancelOrder = async (req: Request, res: Response) => {
    const order = await Order.findOne({
        userId: req.user!.id,
        _id: req.params.id,
    }).populate('ticket')

    if (!order) {
        throw new NotFoundError('Order not found')
    }

    if (order.userId !== req.user!.id) {
        throw new NotAuthorizedError()
    }

    order.status = OrderStatus.Cancelled
    await order.save()

    await new OrderCancelledPublisher(natsWrapper.client).publish({
        id: order.id,
        userId: order.userId,
    version: order.version,
    ticket: {
            id: order.ticket.id,
        },
    })

    res.status(200).send(order)
}
