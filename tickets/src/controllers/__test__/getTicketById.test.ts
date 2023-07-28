import { app } from "../../app";
import request from "supertest";
import mongoose from "mongoose";
import { createTicket } from './createTicket.test';

it("200: finds an existing ticket", async () => {
  const newTicket = (await createTicket())[0]

  const response = await request(app)
    .get("/api/v1/tickets/" + newTicket.id).send()
    .expect(200);

  expect(response.body.id).toEqual(newTicket.id);
});

it("404: don't finds an non-existing ticket", async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    await request(app)
      .get("/api/v1/tickets/" + id).send()
      .expect(404);
  });