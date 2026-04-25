const express = require("express");
const {
	sendLoginPage,
	sendSignupPage,
	signupPost,
	loginpost,
    logoutUser
} = require("../controllers/authController")
const authRouter = express.Router();


authRouter.get("/login", sendLoginPage)
authRouter.get("/signup", sendSignupPage)
authRouter.post("/login", loginpost)
authRouter.post("/signup", signupPost)
authRouter.get("/logout", logoutUser)

module.exports = authRouter;