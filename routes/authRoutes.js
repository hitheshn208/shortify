const express = require("express");
const {checkAuth} = require("../middleware/auth")
const {
	sendLoginPage,
	sendSignupPage,
	signupPost,
	loginpost,
    logoutUser,
	verifyOtp,
	resendOtp,
	completeProfile
} = require("../controllers/authController")
const authRouter = express.Router();


authRouter.get("/login", checkAuth, sendLoginPage)
authRouter.get("/signup", checkAuth, sendSignupPage)
authRouter.post("/login", loginpost)
authRouter.post("/signup", signupPost)
authRouter.get("/logout", logoutUser)
authRouter.post("/verify-otp", verifyOtp)
authRouter.post("/signup/resend-otp", resendOtp);
authRouter.post("/complete-profile", completeProfile);

module.exports = authRouter;