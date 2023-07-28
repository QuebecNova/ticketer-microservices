import { app } from '../../app'
import request from 'supertest'
import { getSignUpCookie } from '../../test/getSignUpCookie'
import { Ticket } from '../../models/ticket'
import { natsWrapper } from '../../Nats'
import mongoose from 'mongoose'
import { OrderDoc } from '../../models/order'

export const createOrder = async (count = 1): Promise<OrderDoc[]> => {
    const orders: OrderDoc[] = []
    while (count > 0) {
        const ticket = await Ticket.build({
            title: 'concert-' + count,
            price: 20,
        })

        const response = await request(app)
            .post('/api/v1/orders')
            .set('Cookie', getSignUpCookie())
            .send({ ticketId: ticket.id })
            .expect(201)
        orders.push(response.body)
        --count
    }
    return orders
}

it('400: ticket does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()

    await request(app)
        .post('/api/v1/orders')
        .set('Cookie', getSignUpCookie())
        .send({ ticketId: id })
        .expect(404)
})

it('400: ticket is already reserved', async () => {
    const ticket = await Ticket.build({
        title: 'concert',
        price: 20,
    })

    await request(app)
        .post('/api/v1/orders')
        .set('Cookie', getSignUpCookie())
        .send({ ticketId: ticket.id })
        .expect(201)

    await request(app)
        .post('/api/v1/orders')
        .set('Cookie', getSignUpCookie())
        .send({ ticketId: ticket.id })
        .expect(400)
})

it('not 404: has a route handler POST: /api/orders', async () => {
    const response = await request(app)
        .post('/api/v1/orders')
        .set('Cookie', getSignUpCookie())
        .send()

    expect(response.status).not.toEqual(404)
})

it('401: user must be logged in', async () => {
    await request(app).post('/api/v1/orders').send({}).expect(401)
})

it('not 401: user signed in', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()

    const response = await request(app)
        .post('/api/v1/orders')
        .set('Cookie', getSignUpCookie())
        .send({ ticketId: id })

    expect(response.status).not.toEqual(401)
})

it('201: creates an order', async () => {
    await createOrder()
})

it('published created order event', async () => {
    await createOrder()

    expect(natsWrapper.client.publish).toBeCalled()
})
