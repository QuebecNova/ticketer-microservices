import { Request, Response } from 'express'
import { Order } from '../models/order'
import { OrderCreatedPublisher } from '../events/publishers/OrderCreatedPublisher'
import { natsWrapper } from '../Nats'
import { Ticket } from '../models/ticket'
import { BadRequestError, NotFoundError } from '@quebecnovaorg/common'

const EXPIRATION_WINDOW_SECONDS = 15 * 60

export const createOrder = async (req: Request, res: Response) => {
    const { ticketId } = req.body

    const ticket = await Ticket.findById(ticketId)

    if (!ticket) {
        throw new NotFoundError('Ticket not found')
    }

    const isReserved = await ticket.isReserved()

    if (isReserved) {
        throw new BadRequestError('Ticket is already reserved')
    }

    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + EXPIRATION_WINDOW_SECONDS)

    const order = await Order.build({
        ticket,
        userId: req.user!.id,
        expiresAt,
    })

    await new OrderCreatedPublisher(natsWrapper.client).publish({
        id: order.id,
        status: order.status,
        userId: order.userId,
        version: order.version,
        ticket: {
            id: order.ticket.id,
            price: order.ticket.price,
        },
        expiresAt: order.expiresAt.toUTCString(),
    })

    console.log(order.expiresAt)

    res.status(201).send(order)
}
