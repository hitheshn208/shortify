const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { findUserByEmail, registerUser } = require("../model/userModel");
const { insertOtp, removeOtp, getOtpOfUser, refreshCredential, updateOtp, getPassword} = require("../model/redisuserModel")
const {getOtp} = require("../utils/otpGenerator");
const {sendOtp} = require("../services/emailServices");
const dotenv  = require("dotenv");
const path = require("path");
const { log } = require("console");
dotenv.config({ path: path.join(__dirname, '../.env') });

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
    const token = req.cookies["temp-token"]; //*Will be available if user changes email
    const {email, password} = req.body;
    const availableUser = await findUserByEmail(email);

    if(availableUser.length !== 0){
        // console.log("Already registered ",availableUser)
        return res.status(401).json({ message: "This email is already registered. Please sign in instead." });
    }

    //*If user changes the email after requesting otp remove old
    if(token)
    {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if(email !== decoded.email){
            await removeOtp( decoded.email);
        }
    }
    const PasswordHash = await hashPassword(password);
    const otp = getOtp();
    await insertOtp(email, PasswordHash, otp);
    sendOtp(email, otp);
    try{
        const token = jwt.sign({email},process.env.SECRET_KEY);
        res.cookie("temp-token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict"
        })
        // console.log("Temp Cookie set");
        return res.sendStatus(201);
    }catch(e){
        // console.log("Error ", e);
        return res.status(500).json({ message: "Internal server error." });
    }
}

exports.loginpost = async (req, res)=>{                                                         //^LOGIN
    const {email, password} = req.body;
    const availableUser = await findUserByEmail(email);
    if(availableUser.length === 0){
        // console.log("No user")
        return res.status(401).json({ message: "No account found for this email. Please sign up first." });
    }
    const user = availableUser[0];
    // console.log(user);
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if(!isMatch){
        // console.log("Password mismatch");
        return res.status(401).json({ message: "Incorrect password. Please try again." });
    }

    try{
        const token = jwt.sign({id: user.id, email: user.email},process.env.SECRET_KEY);
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict"
        })
        // console.log("Cookie set");
        return res.status(200).json({
            message: "Login successful.",
            redirectUrl: "/user/dashboard"
        });
    }catch(e){
        // console.log("Error ", e);
        return res.status(500).json({ message: "Internal server error." });
    }
}

exports.logoutUser = (req, res)=>{
    // console.log("User logged out");
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
    // console.log("In verify ", otp);

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const userEmail = decoded.email;
    console.log(userEmail);

    const storedOtp = await getOtpOfUser(userEmail);
    if(!storedOtp)
        return res.status(401).json({
            message: "OTP has expired"   //*OTP Expired
        })

    if(storedOtp !== Number(otp))
        return res.status(401).json({
            message: "OTP doesn't match"   //*OTP don't match
        })

    await refreshCredential(userEmail);
    res.sendStatus(201);
}

exports.resendOtp = async(req, res)=>{
    const token = req.cookies["temp-token"];
    const {resend} = req.body;
    if(!token || !resend)
        return res.status(401).json({ message : "Unauthorized"});
    try{
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const userEmail = decoded.email;
        const newotp = getOtp();
        await updateOtp(userEmail, newotp);
        sendOtp(userEmail, newotp);
        res.json({
            message: "OTP resent"
        })
    }catch(e){
        // console.log("Error while verifying token");
        return res.sendStatus(401);
    }
}
exports.completeProfile = async (req, res)=>{
    try{
        const tempToken = req.cookies["temp-token"];
        const decoded = jwt.verify(tempToken, process.env.SECRET_KEY);
        const userEmail = decoded.email;
        const password_hash = await getPassword(userEmail);
        const {name} = req.body;
        log
        const user = await registerUser(userEmail, password_hash, name);
        res.clearCookie("temp-token");

        const token = jwt.sign({id: user.id, email: user.email},process.env.SECRET_KEY);
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict"
        })
        // console.log("Cookie set in complete profile");
        return res.status(200).json({
            message: "Login successful.",
            redirectUrl: "/user/dashboard"
        });

    }catch(e){
        console.log(e)
        res.status(401).json({
            message: "Failed to complete profile",
            redirectUrl: "/auth/signup"
        })
    } 
}