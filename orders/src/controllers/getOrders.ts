import { Request, Response } from "express";
import { Order } from "../models/order";

export const getOrders = async (req: Request, res: Response) => {
  const orders = await Order.find({
    userId: req.user!.id
  }).populate('ticket') || [];

  res.send({ count: orders.length, data: orders });
};
