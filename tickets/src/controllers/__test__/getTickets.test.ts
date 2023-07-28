import { app } from "../../app";
import request from "supertest";
import { createTicket } from "./createTicket.test";

it("200: finds an existing tickets", async () => {
  const createdTickets = await createTicket(3);

  const findResponse = await request(app)
    .get("/api/v1/tickets")
    .send()
    .expect(200);

  expect(findResponse.body.count).toEqual(createdTickets.length);
  expect(findResponse.body.data.length).toEqual(createdTickets.length)
});

it("200: finds 0 tickets", async () => {
  const findResponse = await request(app)
    .get("/api/v1/tickets")
    .send()
    .expect(200);

  expect(findResponse.body.count).toEqual(0)
  expect(findResponse.body.data.length).toEqual(0)
});
