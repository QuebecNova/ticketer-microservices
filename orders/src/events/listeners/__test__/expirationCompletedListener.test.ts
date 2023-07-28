import mongoose from 'mongoose'
import { natsWrapper } from '../../../Nats'
import { Ticket } from '../../../models/ticket'
import { ExpirationCompletedListener } from '../ExpirationCompletedListener'
import { Order } from '../../../models/order'
import { ExpirationCompletedEvent, OrderStatus } from '@quebecnovaorg/common'
import { Message } from 'node-nats-streaming'

const setup = async () => {
    const listener = new ExpirationCompletedListener(natsWrapper.client)

    const ticket = await Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20,
    })

    const order = await Order.build({
        status: OrderStatus.Created,
        userId: 'argaerhae',
        expiresAt: new Date(),
        ticket,
    })

    const data: ExpirationCompletedEvent['data'] = {
        orderId: order.id,
    }

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    }

    return { msg, data, order, ticket, listener }
}

it('updates the order status to cancelled', async () => {
    const { listener, data, msg } = await setup()

    await listener.onMessage(data, msg)

    const updatedOrder = await Order.findById(data.orderId)

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})
it('emit an order:cancelled event', async () => {
    const { listener, data, order, msg } = await setup()

    await listener.onMessage(data, msg)

    expect(natsWrapper.client.publish).toHaveBeenCalled()

    const eventData = JSON.parse(
        (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    )

    expect(order.id).toEqual(eventData.id)
})
it('ack the message', async () => {
    const { listener, data, msg } = await setup()

    await listener.onMessage(data, msg)

    expect(msg.ack).toHaveBeenCalled()
})
