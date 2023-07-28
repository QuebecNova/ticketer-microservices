import { Request, Response } from "express";
import { Ticket } from "../models/ticket";

export const getTickets = async (req: Request, res: Response) => {
  const tickets = await Ticket.find() || [];

  res.send({ count: tickets.length, data: tickets });
};
