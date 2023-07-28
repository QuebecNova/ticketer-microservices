import { TicketUpdatedEvent } from "@quebecnovaorg/common"
import { natsWrapper } from "../../../Nats"
import { TicketUpdatedListener } from "../TicketUpdatedListener"
import mongoose from "mongoose"
import { Message } from "node-nats-streaming"
import { Ticket } from "../../../models/ticket"

const setup = async () => {
    const listener = new TicketUpdatedListener(natsWrapper.client)

    const ticket = await Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })

    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        title: 'not-concert',
        price: 10,
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: ticket.version + 1
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener, data, ticket, msg}
}

it('updates and saves a ticket', async () => {

    const {listener, data, msg} = await setup()

    await listener.onMessage(data,msg)

    const ticket = await Ticket.findById(data.id)

    expect(ticket!.title).toEqual(data.title)
    expect(ticket!.price).toEqual(data.price)
    expect(ticket!.version).toEqual(data.version)
})

it('acks() a message', async () => {

    const {listener, data, msg} = await setup()

    await listener.onMessage(data,msg)

    expect(msg.ack).toHaveBeenCalled()
})

it('does not call ack() if the event has a skipped version', async () => {
    const {msg, data, listener} = await setup()

    data.version = 10

    try {
        await listener.onMessage(data,msg)
    } catch (err) {}

    expect(msg.ack).not.toHaveBeenCalled()
})