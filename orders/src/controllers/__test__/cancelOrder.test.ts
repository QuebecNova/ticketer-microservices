import mongoose from "mongoose";
import { app } from "../../app";
import { createOrder } from "./createOrder.test";
import request from 'supertest';
import { getSignUpCookie } from "../../test/getSignUpCookie";
import { OrderStatus } from "@quebecnovaorg/common";
import { natsWrapper } from "../../Nats";

it('401: user must be logged in', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()

    await request(app).patch('/api/v1/orders/cancel/' + id)
    .send({}).expect(401)
})

it('not 401: user signed in', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()

    const response = await request(app)
        .patch('/api/v1/orders/cancel/' + id)
        .set('Cookie', getSignUpCookie())
        .send({})

    expect(response.status).not.toEqual(401)
})

it('200: cancels an existing order', async () => {
    const newOrder = (await createOrder())[0]

    const {body} = await request(app)
    .patch("/api/v1/orders/cancel/" + newOrder.id).send()
    .set('Cookie', getSignUpCookie())
    .expect(200);

    expect(body.status).toEqual(OrderStatus.Cancelled)
})

it('404: cannot cancel non-existing order', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()

    await request(app)
    .patch("/api/v1/orders/cancel/" + id).send()
    .set('Cookie', getSignUpCookie())
    .expect(404);
})

it('published cancelled order event', async () => {
    const newOrder = (await createOrder())[0]

    const {body} = await request(app)
    .patch("/api/v1/orders/cancel/" + newOrder.id).send()
    .set('Cookie', getSignUpCookie())
    .expect(200);

    expect(body.status).toEqual(OrderStatus.Cancelled)

    expect(natsWrapper.client.publish).toBeCalled()
})
