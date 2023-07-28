import { natsWrapper } from "../../../Nats"
import mongoose from "mongoose"
import { Message } from "node-nats-streaming"
import { Ticket } from "../../../models/ticket"
import { OrderCreatedListener } from "../OrderCreatedListener"
import { OrderCreatedEvent, OrderStatus } from "@quebecnovaorg/common"

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client)
    
    const ticket = await Ticket.build({
        title: 'concert',
        price: 20,
        userId: new mongoose.Types.ObjectId().toHexString(),
    })
    
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        ticket: {
            id: ticket.id,
            price: ticket.price,
        },
        status: OrderStatus.Created,
        expiresAt: '???',
        userId: new mongoose.Types.ObjectId().toHexString(),
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener,ticket, data, msg}
}

it('sets the userId of the ticket', async () => {

    const {listener, data, msg} = await setup()

    await listener.onMessage(data,msg)

    const ticket = await Ticket.findById(data.ticket.id)

    expect(ticket!.orderId).toEqual(data.id)
})

it('acks() a message', async () => {

    const {listener, data, msg} = await setup()

    await listener.onMessage(data,msg)

    expect(msg.ack).toHaveBeenCalled()
})

it('publsihes ticket:updated event', async () => {

    const {listener, data, msg} = await setup()

    await listener.onMessage(data,msg)

    expect(natsWrapper.client.publish).toHaveBeenCalled()

    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])

    expect(data.id).toEqual(ticketUpdatedData.orderId)
})
