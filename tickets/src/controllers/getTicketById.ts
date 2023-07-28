import { Request, Response } from "express";
import { Ticket } from "../models/ticket";
import { NotFoundError } from "@quebecnovaorg/common";

export const getTicketById = async (req: Request, res: Response) => {
    const { id } = req.params;

    const ticket = await Ticket.findById(id)

    if (!ticket) {
      throw new NotFoundError('Ticket not found')
    }

    res.send(ticket);
  };
  