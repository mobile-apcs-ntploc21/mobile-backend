import { Request, Response, NextFunction, Router } from "express";
import { authMiddleware } from "../utils/authMiddleware";

const serverRouter = Router();
