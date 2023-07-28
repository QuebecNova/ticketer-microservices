import express from "express";
import { createTicket } from "../controllers/createTicket";
import { requireAuth, validateRequest } from "@quebecnovaorg/common";
import { getTicketById } from "../controllers/getTicketById";
import { getTickets } from "../controllers/getTickets";
import { updateTicket } from "../controllers/updateTicket";
import { body } from "express-validator";

export const validationTicket = [
  body("title").trim().not().isEmpty().withMessage("Title is required"),
  body("price").isFloat({ gt: 0 }).withMessage("Price is required"),
];

export const ticketsRouter = express.Router();

ticketsRouter.post(
  "/",
  requireAuth,
  validationTicket,
  validateRequest,
  createTicket
);
ticketsRouter.patch(
  "/:id",
  requireAuth,
  validationTicket,
  validateRequest,
  updateTicket
);
ticketsRouter.get("/:id", getTicketById);
ticketsRouter.get("/", getTickets);
