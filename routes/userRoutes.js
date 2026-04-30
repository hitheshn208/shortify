const express = require("express");
const {showDashboardpage, shortenUrl, showLinkDetails, editOriginalUrl, editSecurity, zeroClick, removeUrl} = require("../controllers/userController")

const userRoutes = express.Router();

userRoutes.get("/dashboard", showDashboardpage)
userRoutes.post("/shorten", shortenUrl)

userRoutes.get("/:code/details", showLinkDetails );
userRoutes.patch("/:code/edit", editOriginalUrl);
userRoutes.patch("/:code/security", editSecurity);
userRoutes.patch("/:code/reset-clicks", zeroClick);
userRoutes.delete("/:code", removeUrl);
module.exports = userRoutes;