import { app } from '../../app'
import request from 'supertest'
import { createTicket } from './createTicket.test'
import { getSignUpCookie } from '../../test/getSignUpCookie'
import mongoose from 'mongoose'
import { natsWrapper } from '../../Nats'
import { Ticket } from '../../models/ticket'

it("404: user can't update a ticket that not belongs to him", async () => {
    const newTicket = (await createTicket())[0]

    await request(app)
        .patch('/api/v1/tickets/' + newTicket.id)
        .set('Cookie', getSignUpCookie(true))
        .send({ title: 'asfafawf', price: 10 })
        .expect(404)
})

it('401: user must be logged in', async () => {
    const newTicket = (await createTicket())[0]

    await request(app)
        .patch('/api/v1/tickets/' + newTicket.id)
        .send({ title: 'asfafawf', price: 10 })
        .expect(401)
})

it('not 401: user signed in', async () => {
    const newTicket = (await createTicket())[0]

    const response = await request(app)
        .patch('/api/v1/tickets/' + newTicket.id)
        .set('Cookie', getSignUpCookie())
        .send({ title: 'asfafawf', price: 10 })

    expect(response.status).not.toEqual(401)
})

it('400: an invalid title provided', async () => {
    const newTicket = (await createTicket())[0]

    await request(app)
        .patch('/api/v1/tickets/' + newTicket.id)
        .set('Cookie', getSignUpCookie())
        .send({ title: '', price: 10 })
        .expect(400)

    await request(app)
        .patch('/api/v1/tickets/' + newTicket.id)
        .set('Cookie', getSignUpCookie())
        .send({ price: 10 })
        .expect(400)
})

it('400: an invalid price provided', async () => {
    const newTicket = (await createTicket())[0]

    await request(app)
        .patch('/api/v1/tickets/' + newTicket.id)
        .set('Cookie', getSignUpCookie())
        .send({ title: 'awegaw', price: -10 })
        .expect(400)

    await request(app)
        .patch('/api/v1/tickets/' + newTicket.id)
        .set('Cookie', getSignUpCookie())
        .send({ title: 'awegaw' })
        .expect(400)
})

it("404: don't finds an non-existing ticket", async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    await request(app)
        .patch('/api/v1/tickets/' + id)
        .set('Cookie', getSignUpCookie())
        .send({ title: 'asfafawf', price: 10 })
        .expect(404)
})

it('200: updates a ticket with valid info', async () => {
    const newTicket = (await createTicket())[0]

    const newTitle = 'New Title'

    const response = await request(app)
        .patch('/api/v1/tickets/' + newTicket.id)
        .set('Cookie', getSignUpCookie())
        .send({ title: newTitle, price: 10 })
        .expect(200)

    expect(response.body.title).toStrictEqual(newTitle)
})

it('published updated ticket event', async () => {
    const newTicket = (await createTicket())[0]

    const newTitle = 'New Title'

    const response = await request(app)
        .patch('/api/v1/tickets/' + newTicket.id)
        .set('Cookie', getSignUpCookie())
        .send({ title: newTitle, price: 10 })
        .expect(200)

    expect(response.body.title).toStrictEqual(newTitle)

    expect(natsWrapper.client.publish).toBeCalled()
})

it('400: rejects update to reserved ticket', async () => {
    const newTicket = (await createTicket())[0]

    const ticket = await Ticket.findByIdAndUpdate(newTicket.id, {
        orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    
    await request(app)
        .patch('/api/v1/tickets/' + ticket!.id)
        .set('Cookie', getSignUpCookie())
        .send({ title: 'awegaw', price: 10 })
        .expect(400)
})
