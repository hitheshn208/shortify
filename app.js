const express = require('express');
const cookieParser = require("cookie-parser");
const {authMiddleware, checkAuth} = require("./middleware/auth")
const { redirectPage } = require("./controllers/urlController")

const app = express();
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const publicRouter = require("./routes/publicRoutes")
const urlRouter = require("./routes/urlRoutes")

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static("public"));

app.use((req, res, next)=>{
    console.log("Request came to ", req.path, req.method);
    next();
})

app.get("/favicon.ico", (req, res, next)=>{
    res.status(204);
})

app.use("/auth", authRouter);
app.use("/user",authMiddleware, userRouter);
app.use("/:code", urlRouter);
app.use("/", checkAuth, publicRouter);


app.use((req, res)=>{
    res.send("<h1>Page not Found</h1>");
});

const PORT = 3000;
app.listen(PORT, (e)=>{
    if(e)
        console.log("Error while starting the server.\n Error : ", e);
    else
        console.log(`Server is online: http://localhost:${PORT}`);
})