import { natsWrapper } from "../../../Nats"
import mongoose from "mongoose"
import { Message } from "node-nats-streaming"
import { OrderCreatedListener } from "../OrderCreatedListener"
import { OrderCreatedEvent, OrderStatus } from "@quebecnovaorg/common"
import { Order } from "../../../models/order"

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client)
    
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        ticket: {
            id: 'arhea',
            price: 200,
        },
        status: OrderStatus.Created,
        expiresAt: '???',
        userId: new mongoose.Types.ObjectId().toHexString(),
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener, data, msg}
}

it('replicates order info', async () => {
    const {listener, data, msg} = await setup()

    await listener.onMessage(data,msg)

    const order = await Order.findById(data.id)

    expect(order!.price).toEqual(data.ticket.price)
})

it('acks() a message', async () => {

    const {listener, data, msg} = await setup()

    await listener.onMessage(data,msg)

    expect(msg.ack).toHaveBeenCalled()
})
