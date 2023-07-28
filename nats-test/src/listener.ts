import { randomBytes } from "crypto";
import nats from "node-nats-streaming";
import { TicketCreatedListner } from "./events/TicketCreatedListener";

const stan = nats.connect("ticketer", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to NATS");

  stan.on("close", () => {
    process.exit();
  });

  new TicketCreatedListner(stan).listen()
});

process.on("SIGINT", () => stan.close());
process.on("SIGTERM ", () => stan.close());
