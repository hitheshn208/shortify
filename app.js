const express = require('express');
const db = require('./config/database');
const path = require("path");
const cookieParser = require("cookie-parser");
const {authMiddleware} = require("./middleware/auth")

const authRouter = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
exports.app = app;
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
app.use(express.static("public"));

app.use("/auth", authRouter);
app.use("/",authMiddleware, userRoutes);

app.use((req, res)=>{
    res.send("<h1>Pagr not Found</h1>");
})

const PORT = 3000;
app.listen(PORT, (e)=>{
    if(e)
        console.log("Error while starting the server.\n Error : ", e);
    else
        console.log(`Server is online: http://localhost:${PORT}`);
})