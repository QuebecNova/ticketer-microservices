import { app } from '../../app'
import request from 'supertest'
import { cookieUserId, getSignUpCookie } from '../../test/getSignUpCookie'
import { natsWrapper } from '../../Nats'
import mongoose from 'mongoose'
import { Order, OrderDoc } from '../../models/order'
import { OrderStatus } from '@quebecnovaorg/common'
import { stripe } from '../../stripe'
import { Payment } from '../../models/payment'

export const testStripeToken = 'tok_visa'

export const createOrder = async (
    count = 1,
    status = OrderStatus.Created
): Promise<OrderDoc[]> => {
    const orders: OrderDoc[] = []
    while (count > 0) {
        const order = await Order.build({
            id: new mongoose.Types.ObjectId().toHexString(),
            price: parseInt(`${Math.random() * 100}`),
            status,
            userId: cookieUserId,
            version: 0,
        })
        orders.push(order)
        --count
    }
    return orders
}

it('not 404: has a route handler POST: /api/payments', async () => {
    const response = await request(app).post('/api/v1/payments').send({})

    expect(response.status).not.toEqual(404)
})

it('401: user must be logged in', async () => {
    await request(app).post('/api/v1/payments').send({}).expect(401)
})

it('not 401: user signed in', async () => {
    const response = await request(app)
        .post('/api/v1/payments')
        .set('Cookie', getSignUpCookie())
        .send({})

    expect(response.status).not.toEqual(401)
})

it('404: an invalid orderId provided', async () => {
    await request(app)
        .post('/api/v1/payments')
        .set('Cookie', getSignUpCookie())
        .send({
            orderId: new mongoose.Types.ObjectId().toHexString(),
            token: testStripeToken,
        })
        .expect(404)
})

it('404: order not belongs to userId', async () => {
    await createOrder()
    await request(app)
        .post('/api/v1/payments')
        .set('Cookie', getSignUpCookie(true))
        .send({
            orderId: new mongoose.Types.ObjectId().toHexString(),
            token: testStripeToken,
        })
        .expect(404)
})

it('404: invalid token provided', async () => {
    const order = (await createOrder())[0]
    await request(app)
        .post('/api/v1/payments')
        .set('Cookie', getSignUpCookie(true))
        .send({ orderId: order!.id, token: 'asdas' })
        .expect(404)
})

it('404: order status must be OrderStatus.Created', async () => {
    const order = (await createOrder(1, OrderStatus.Cancelled))[0]
    await request(app)
        .post('/api/v1/payments')
        .set('Cookie', getSignUpCookie(true))
        .send({ orderId: order.id, token: testStripeToken })
        .expect(404)
})

it('201: created charge', async () => {
    const order = (await createOrder())[0]

    await request(app)
        .post('/api/v1/payments')
        .set('Cookie', getSignUpCookie())
        .send({ orderId: order.id, token: testStripeToken })
        .expect(201)

    const response = await stripe.charges.list()
    const charge = response.data.find(
        (charge) => charge.amount === order.price * 100
    )

    expect(charge).toBeDefined()
    expect(charge!.currency).toEqual('usd')

    const payment = await Payment.findOne({
        orderId: order.id,
        chargeId: charge!.id,
    })

    expect(payment).not.toBeNull()
})

it('published payment:created event', async () => {
    const order = (await createOrder())[0]

    await request(app)
        .post('/api/v1/payments')
        .set('Cookie', getSignUpCookie())
        .send({ orderId: order.id, token: testStripeToken })
        .expect(201)

    expect(natsWrapper.client.publish).toBeCalled()
})
