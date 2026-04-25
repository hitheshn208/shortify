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
        return res.redirect("/auth/login");
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
        res.redirect("/");
    }catch(e){
        console.log("Error ", e);
        res.send("Internal server Error ");
    }
}

exports.loginpost = async (req, res)=>{
    console.log("Came to login post")
    const {email, password} = req.body;

    const availableUser = await findUserByEmail(email);
    if(availableUser.length === 0){
        console.log("No user")
        return res.redirect("/auth/signup");
    }
    const user = availableUser[0];
    console.log(user);
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if(!isMatch){
        console.log("Password mismatch");
        return res.redirect("/auth/login");
    }

    try{
        const token = jwt.sign({id: user.id, email: user.email},"secretKey");
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict"
        })
        console.log("Cookie set");
        res.redirect("/");
    }catch(e){
        console.log("Error ", e);
        res.send("Internal server Error ");
    }
}

exports.logoutUser = (req, res)=>{
    console.log("User logged out");
    res.clearCookie("token")
    return res.redirect("/auth/login");
}