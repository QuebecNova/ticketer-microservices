import { natsWrapper } from '../../../Nats'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { OrderCancelledListener } from '../OrderCancelledListener'
import {
    OrderCancelledEvent,
    OrderStatus,
} from '@quebecnovaorg/common'
import { Order } from '../../../models/order'

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client)

    const order = await Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        price: 20,
        userId: 'asdfasfawe',
        version: 0
    })

    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: 'arhea',
        },
        userId: order.userId,
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    }

    return { listener, data, msg }
}

it('changes status of order', async () => {
    const { listener, data, msg } = await setup()

    await listener.onMessage(data, msg)

    const order = await Order.findById(data.id)

    expect(order!.status).toEqual(OrderStatus.Cancelled)
})

it('acks() a message', async () => {
    const { listener, data, msg } = await setup()

    await listener.onMessage(data, msg)

    expect(msg.ack).toHaveBeenCalled()
})
