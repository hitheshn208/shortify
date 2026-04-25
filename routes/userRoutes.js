const express = require("express");
const {showHomepage, shortenUrl} = require("../controllers/userController")

const userRoutes = express.Router();

userRoutes.get("/", showHomepage)
userRoutes.post("/shorten", shortenUrl)

module.exports = userRoutes;