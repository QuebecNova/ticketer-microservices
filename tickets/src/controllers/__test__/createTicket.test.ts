import { app } from '../../app'
import request from 'supertest'
import { getSignUpCookie } from '../../test/getSignUpCookie'
import { Ticket, TicketDoc } from '../../models/ticket'
import { natsWrapper } from '../../Nats'
import mongoose from 'mongoose'

export const createTicket = async (count = 1): Promise<TicketDoc[]> => {
    const tickets: TicketDoc[] = []
    while (count > 0) {
        const response = await request(app)
            .post('/api/v1/tickets')
            .set('Cookie', getSignUpCookie())
            .send({ title: `awegaw-${count}`, price: 100 })
            .expect(201)
        tickets.push(response.body)
        --count
    }
    return tickets
}

it('not 404: has a route handler POST: /api/tickets', async () => {
    const response = await request(app).post('/api/v1/tickets').send({})

    expect(response.status).not.toEqual(404)
})

it('401: user must be logged in', async () => {
    await request(app).post('/api/v1/tickets').send({}).expect(401)
})

it('not 401: user signed in', async () => {
    const response = await request(app)
        .post('/api/v1/tickets')
        .set('Cookie', getSignUpCookie())
        .send({})

    expect(response.status).not.toEqual(401)
})

it('400: an invalid title provided', async () => {
    await request(app)
        .post('/api/v1/tickets')
        .set('Cookie', getSignUpCookie())
        .send({ title: '', price: 10 })
        .expect(400)

    await request(app)
        .post('/api/v1/tickets')
        .set('Cookie', getSignUpCookie())
        .send({ price: 10 })
        .expect(400)
})

it('400: an invalid price provided', async () => {
    await request(app)
        .post('/api/v1/tickets')
        .set('Cookie', getSignUpCookie())
        .send({ title: 'awegaw', price: -10 })
        .expect(400)

    await request(app)
        .post('/api/v1/tickets')
        .set('Cookie', getSignUpCookie())
        .send({ title: 'awegaw' })
        .expect(400)
})

it('201: created ticket', async () => {
    const newTicket = (await createTicket())[0]

    const ticket = await Ticket.findById(newTicket.id)

    expect(ticket?.id).toStrictEqual(newTicket.id)
})

it('published created ticket event', async () => {
    await createTicket()

    expect(natsWrapper.client.publish).toBeCalled()
})
