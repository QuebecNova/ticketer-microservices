import { Request, Response } from "express";
import { Ticket } from "../models/ticket";
import { BadRequestError, NotAuthorizedError, NotFoundError } from "@quebecnovaorg/common";
import { natsWrapper } from "../Nats";
import { TicketUpdatedPublisher } from "../events/publishers/TicketUpdatedPublisher copy";

export const updateTicket = async (req: Request, res: Response) => {
  const ticket = await Ticket.findOneAndUpdate(
    { userId: req.user!.id, _id: req.params.id },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!ticket) {
    throw new NotFoundError("Ticket not found");
  }

  if (ticket.userId !== req.user!.id) {
    throw new NotAuthorizedError();
  }

  if (ticket.orderId) {
    console.log('eeeee')
    throw new BadRequestError('Cannot edit a reserved ticket')
  }

  new TicketUpdatedPublisher(natsWrapper.client).publish({
    id: ticket.id,
    version: ticket.version,
    title: ticket.title,
    price: ticket.price,
    userId: ticket.userId
  })

  res.send(ticket);
};
