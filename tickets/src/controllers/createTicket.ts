import { Request, Response } from "express";
import { Ticket } from "../models/ticket";
import { TicketCreatedPublisher } from "../events/publishers/TicketCreatedPublisher";
import { natsWrapper } from "../Nats";

export const createTicket = async (req: Request, res: Response) => {
  const { title, price } = req.body;
  const ticket = await Ticket.build({
    title,
    price,
    userId: req.user!.id,
  });

  await new TicketCreatedPublisher(natsWrapper.client).publish({
    id: ticket.id,
    title: ticket.title,
    version: ticket.version,
    price: ticket.price,
    userId: ticket.userId
  })

  res.status(201).send(ticket);
};
