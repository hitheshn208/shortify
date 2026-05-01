const jwt = require("jsonwebtoken");

exports.authMiddleware = (req, res, next)=>{
    const token = req.cookies.token;

    if(!token){
        console.log("Not valid");
        return res.redirect("/auth/login");
    }

    try{
        const decoded = jwt.verify(token, "secretKey");
        req.email = decoded.email;
        req.id =decoded.id;
        console.log(req.email, req.id, decoded, "successful")
        next();
    }catch(err){
        console.log("Cannot validate");
        res.clearCookie("token");
        return res.redirect("/auth/login");
    }

}

exports.checkAuth = (req, res, next)=>{
    // if(req.path !== "/") return next();
    console.log("Came to check auth");
    const token = req.cookies.token

    if(token)
    {
        console.log("Redirecting to the dashboard")
        return res.redirect("/user/dashboard");
    }
    next();
}
