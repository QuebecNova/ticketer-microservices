import { app } from "../../app";
import request from "supertest";
import { createOrder } from "./createOrder.test";
import { getSignUpCookie } from "../../test/getSignUpCookie";

it('401: user must be logged in', async () => {
  await request(app).get('/api/v1/orders').send({}).expect(401)
})

it('not 401: user signed in', async () => {
  const response = await request(app)
      .get('/api/v1/orders')
      .set('Cookie', getSignUpCookie())
      .send({})

  expect(response.status).not.toEqual(401)
})

it("200: finds an existing orders", async () => {
  const createdOrders = await createOrder(3);

  const {body} = await request(app)
    .get("/api/v1/orders")
    .set('Cookie', getSignUpCookie())
    .send()
    .expect(200);

  expect(body.count).toEqual(createdOrders.length);
  expect(body.data.length).toEqual(createdOrders.length)
  
  for (let i = 0; i < createdOrders.length; i++) {
    expect(body.data[i].id).toEqual(createdOrders[i].id)
    expect(body.data[i].ticket.id).toEqual(createdOrders[i].ticket.id)
  }
});

it("200: finds 0 orders", async () => {
  const findResponse = await request(app)
    .get("/api/v1/orders")
    .set('Cookie', getSignUpCookie())
    .send()
    .expect(200);

  expect(findResponse.body.count).toEqual(0)
  expect(findResponse.body.data.length).toEqual(0)
});
