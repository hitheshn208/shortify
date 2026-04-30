const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { findUserByEmail, registerUser } = require("../model/userModel")

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
    const {email, password} = req.body;
    const availableUser = await findUserByEmail(email);

    if(availableUser.length !== 0){
        console.log("Already registered ",availableUser)
        return res.status(401).json({ message: "This email is already registered. Please sign in instead." });
    }

    const hashedPassword = await hashPassword(password);
    const user = await registerUser(email, hashedPassword);
    try{
        const token = jwt.sign({id: user.id, email: user.email},"secretKey");
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict"
        })
        console.log("Cookie set");
        return res.status(200).json({
            message: "Account created successfully.",
            redirectUrl: "/user/dashboard"
        });
    }catch(e){
        console.log("Error ", e);
        return res.status(500).json({ message: "Internal server error." });
    }
}

exports.loginpost = async (req, res)=>{
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