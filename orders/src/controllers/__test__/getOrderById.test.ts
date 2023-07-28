import { app } from "../../app";
import request from "supertest";
import mongoose from "mongoose";
import { createOrder } from "./createOrder.test";
import { getSignUpCookie } from "../../test/getSignUpCookie";

it('401: user must be logged in', async () => {
  await request(app).get('/api/v1/orders/randomId')
  .send({}).expect(401)
})

it('not 401: user signed in', async () => {
  const id = new mongoose.Types.ObjectId().toHexString()

  const response = await request(app)
      .get('/api/v1/orders/' + id)
      .set('Cookie', getSignUpCookie())
      .send({})

  expect(response.status).not.toEqual(401)
})

it("200: finds an existing order", async () => {
  const newOrder = (await createOrder())[0]

  const {body } = await request(app)
    .get("/api/v1/orders/" + newOrder.id)
    .set('Cookie', getSignUpCookie())
    .send()
    .expect(200);

  expect(body.id).toEqual(newOrder.id);
  expect(body.ticket.id).toEqual(newOrder.ticket.id)
});

it("404: don't finds an non-existing order", async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    await request(app)
      .get("/api/v1/orders/" + id)
      .set('Cookie', getSignUpCookie())
      .send()
      .expect(404);
  });