import express from "express";
import { signUp, logIn, logOut } from '../controllers/userStateController.js'

const router = express.Router();

router.post("/sign_up", signUp);
router.post("/log_in", logIn);
router.delete("/log_out", logOut);

export default router;