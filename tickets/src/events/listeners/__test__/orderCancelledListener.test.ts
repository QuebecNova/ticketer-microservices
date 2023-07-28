import { natsWrapper } from '../../../Nats'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../../models/ticket'
import { OrderCancelledListener } from '../OrderCancelledListener'
import {
    OrderCancelledEvent,
    OrderCreatedEvent,
    OrderStatus,
} from '@quebecnovaorg/common'

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client)

    const orderId = new mongoose.Types.ObjectId().toHexString()

    const ticket = await Ticket.build({
        title: 'concert',
        price: 20,
        userId: new mongoose.Types.ObjectId().toHexString(),
    })

    await ticket.set({ orderId }).save()

    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        userId: ticket.userId,
        ticket: {
            id: ticket.id,
        },
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    }

    return { listener, ticket, data, msg }
}

it('removes the orderId of the ticket', async () => {
    const { listener, data, msg } = await setup()

    await listener.onMessage(data, msg)

    const ticket = await Ticket.findById(data.ticket.id)

    expect(ticket!.orderId).not.toBeDefined()
})

it('acks() a message', async () => {
    const { listener, data, msg } = await setup()

    await listener.onMessage(data, msg)

    expect(msg.ack).toHaveBeenCalled()
})

it('publsihes ticket:updated event', async () => {
    const { listener, data, msg } = await setup()

    await listener.onMessage(data, msg)

    expect(natsWrapper.client.publish).toHaveBeenCalled()

    const ticketUpdatedData = JSON.parse(
        (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    )

    const ticket = await Ticket.findById(data.ticket.id)

    expect(ticket!.orderId).toEqual(ticketUpdatedData.orderId)
})
