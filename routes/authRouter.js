// External Module
const express = require("express");
const authRouter = express.Router();

// Local Module
const authController = require("../controllers/authController");

authRouter.get("/login", authController.getlogin);
authRouter.post("/login", authController.postlogin);
authRouter.get("/logout", authController.getlogout);
authRouter.get("/logout", authController.getlogout);
authRouter.get("/signup", authController.getSignup);

authRouter.post("/signup", authController.postSignup);
module.exports = authRouter;
