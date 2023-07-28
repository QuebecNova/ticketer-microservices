import express from "express";
import { createCharge } from "../controllers/createCharge";
import { requireAuth, validateRequest } from "@quebecnovaorg/common";
import { body } from "express-validator";

export const validationTicket = [
  body("token").trim().not().isEmpty().withMessage("token is required"),
  body("orderId").trim().not().isEmpty().withMessage("orderId is required"),
];

export const paymentsRouter = express.Router();

paymentsRouter.post(
  "/",
  requireAuth,
  validationTicket,
  validateRequest,
  createCharge
);