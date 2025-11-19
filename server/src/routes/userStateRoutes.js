import express from "express";
import { signUp, logIn, logOut } from '../controllers/userStateController.js'

const router = express.Router();

router.post("/signUp", signUp);
router.post("/logIn", logIn);
router.delete("/logOut", logOut);

export default router;