const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { findUserByEmail, registerUser, insertOtp, removeOtp, getOtpOfUser, updateOtp } = require("../model/userModel")
const {getOtp} = require("../utils/otpGenerator");
const {sendOtp} = require("../services/emailServices");

async function hashPassword(password){
    const saltRound = 5;
    const hashedPassword = await bcrypt.hash(password, saltRound);
    return hashedPassword;
}

exports.sendLoginPage = (req, res)=>{
    res.render("login", { isLogin: true });
}

exports.sendSignupPage = (req, res)=>{
    res.render("login", { isLogin: false });
}

exports.signupPost = async (req, res)=>{
    const token = req.cookies["temp-token"];
    const {email, password} = req.body;
    const availableUser = await findUserByEmail(email);

    if(availableUser.length !== 0){
        console.log("Already registered ",availableUser)
        return res.status(401).json({ message: "This email is already registered. Please sign in instead." });
    }

    //*If user changes the email after requesting otp remove old tuple
    if(token)
    {
        const decoded = jwt.verify(token, "secretKey");
        if(email !== decoded.email){
            console.log("OTP Removed");
            await removeOtp(email);
        }
    }
    const PasswordHash = await hashPassword(password);
    const otp = getOtp();
    const Hashed_otp = await hashPassword(otp);
    await insertOtp(email, PasswordHash, Hashed_otp);
    sendOtp(email, otp);
    try{
        const token = jwt.sign({email},"secretKey");
        res.cookie("temp-token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict"
        })
        console.log("Temp Cookie set");
        return res.sendStatus(201);
    }catch(e){
        console.log("Error ", e);
        return res.status(500).json({ message: "Internal server error." });
    }
}

exports.loginpost = async (req, res)=>{                                                         //^LOGIN
    const {email, password} = req.body;
    const availableUser = await findUserByEmail(email);
    if(availableUser.length === 0){
        console.log("No user")
        return res.status(401).json({ message: "No account found for this email. Please sign up first." });
    }
    const user = availableUser[0];
    console.log(user);
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if(!isMatch){
        console.log("Password mismatch");
        return res.status(401).json({ message: "Incorrect password. Please try again." });
    }

    try{
        const token = jwt.sign({id: user.id, email: user.email},"secretKey");
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict"
        })
        console.log("Cookie set");
        return res.status(200).json({
            message: "Login successful.",
            redirectUrl: "/user/dashboard"
        });
    }catch(e){
        console.log("Error ", e);
        return res.status(500).json({ message: "Internal server error." });
    }
}

exports.logoutUser = (req, res)=>{
    console.log("User logged out");
    res.clearCookie("token");
    return res.json({
        redirectUrl: "/" 
    })
}

function checkExpired(time)
{
    const createdAt = new Date(time);
    const now = new Date();
    if (now - createdAt > 10 * 60 * 1000) 
        return true; //*Expired
    else
        return false;
}

exports.verifyOtp = async (req, res)=>{
    const token = req.cookies["temp-token"];
    const {otp} = req.body;
    console.log("In verify ", otp);

    const decoded = jwt.verify(token, "secretKey");
    const userEmail = decoded.email;
    console.log(userEmail);

    const availableUser = await getOtpOfUser(userEmail);
    if(availableUser.length === 0)
        return res.status(401).json({
            message: "OTP not generated"   //*Check Exists
        })

    const userOtp = availableUser[0];

    const isExpired = checkExpired(userOtp.created_at);
    if(isExpired)
        return res.status(401).json({
            message: "OTP has expired"   //*OTP Expired
        })

    const isMatch = await bcrypt.compare(otp, userOtp.otp);
    if(!isMatch)
        return res.status(401).json({
            message: "OTP doesn't match"   //*OTP don't match
        })

    res.sendStatus(201);
}

exports.resendOtp = async(req, res)=>{
    const token = req.cookies["temp-token"];
    const {resend} = req.body;
    if(!token || !resend)
        return res.status(401).json({ message : "Unauthorized"});
    try{
        const decoded = jwt.verify(token, "secretKey");
        const userEmail = decoded.email;
        const newotp = getOtp();
        const Hashed_otp = await hashPassword(newotp);
        await updateOtp(userEmail, Hashed_otp);
        sendOtp(userEmail, newotp);
        res.json({
            message: "OTP resent"
        })
    }catch(e){
        console.log("Error while verifying token");
        return res.sendStatus(401);
    }
}
exports.completeProfile = async (req, res)=>{
    try{
        const tempToken = req.cookies["temp-token"];
        const decoded = jwt.verify(tempToken, "secretKey");
        const userEmail = decoded.email;
        const {name} = req.body;
        const user = await registerUser(userEmail, name);
        res.clearCookie("temp-token");

        const token = jwt.sign({id: user.id, email: user.email},"secretKey");
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict"
        })
        console.log("Cookie set in complete profile");
        return res.status(200).json({
            message: "Login successful.",
            redirectUrl: "/user/dashboard"
        });

    }catch(e){
        res.status(401).json({
            message: "Failed to complete profile",
            redirectUrl: "/auth/signup"
        })
    } 
}