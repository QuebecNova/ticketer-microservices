import express from "express";
import { getCurrentUser } from "../controllers/currentUser";
import { signOut } from "../controllers/signout";
import { signIn, validationSignIn } from "../controllers/signin";
import { signUp, validationSignUp } from "../controllers/signup";
import { requireAuth, validateRequest } from "@quebecnovaorg/common";

export const authRouter = express.Router();

authRouter.get("/current-user", requireAuth, getCurrentUser);

authRouter.get("/signout", signOut);

authRouter.post("/signin", validationSignIn, validateRequest, signIn);

authRouter.post("/signup", validationSignUp, validateRequest, signUp);
