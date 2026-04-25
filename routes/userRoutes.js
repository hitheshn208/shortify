const express = require("express");
const {showDashboardpage, shortenUrl} = require("../controllers/userController")

const userRoutes = express.Router();

userRoutes.get("/dashboard", showDashboardpage)
userRoutes.post("/shorten", shortenUrl)

module.exports = userRoutes;