import { Request, Response } from "express";
import { body } from "express-validator";
import { User } from "../models/user";
import { signAndAttachJWT } from "../helpers/jwt";
import { BadRequestError } from "@quebecnovaorg/common";

export const validationSignUp = [
  body("email").isEmail().withMessage("Email must be valid"),
  body("password")
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage("Password must be between 4 and 20 characters"),
];

export const signUp = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new BadRequestError("Email in use");
  }

  const user = User.build({ email, password });
  await user.save();

  signAndAttachJWT(req, user.id, user.email)

  res.status(201).send(user);
};
