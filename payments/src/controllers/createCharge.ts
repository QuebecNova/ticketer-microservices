import { Request, Response } from "express";
import { PaymentCreatedPublisher } from "../events/publishers/PaymentCreatedPublisher";
import { natsWrapper } from "../Nats";
import { Order } from "../models/order";
import { NotFoundError, OrderStatus } from "@quebecnovaorg/common";
import { stripe } from "../stripe";
import { Payment } from "../models/payment";

export const createCharge = async (req: Request, res: Response) => {
  const { orderId, token } = req.body;

  const order = await Order.findOne({_id: orderId, userId: req.user!.id, status: OrderStatus.Created})

  if (!order) {
    throw new NotFoundError('Order not found')
  }

  const charge = await stripe.charges.create({
    currency: 'usd',
    amount: order.price * 100,
    source: token
  })

  const payment = await Payment.build({
    orderId: order.id,
    chargeId: charge.id
  })

  await new PaymentCreatedPublisher(natsWrapper.client).publish({
    orderId: order.id,
    chargeId: charge.id,
    price: order.price,
    id: payment.id
  })

  res.status(201).send({id: payment.id});
};
