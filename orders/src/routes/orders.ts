import express from "express";
import { createOrder } from "../controllers/createOrder";
import { requireAuth, validateRequest } from "@quebecnovaorg/common";
import { getOrderById } from "../controllers/getOrderById";
import { getOrders } from "../controllers/getOrders";
import { cancelOrder } from "../controllers/cancelOrder";
import { body } from "express-validator";

export const validation = [
  body("ticketId").trim().not().isEmpty().withMessage("ticketId is required"),
];

export const ordersRouter = express.Router();

ordersRouter.post(
  "/",
  requireAuth,
  validation,
  validateRequest,
  createOrder
);
ordersRouter.get("/:id", requireAuth, getOrderById);
ordersRouter.get("/", requireAuth, getOrders);
ordersRouter.patch('/cancel/:id', requireAuth, cancelOrder)