const express = require("express");
const { redirectPage, redirectPassword, verifyPassword, showLinkDetails, editOriginalUrl, editSecurity, removeUrl } = require("../controllers/urlController");

const urlRoutes = express.Router({ mergeParams: true });

urlRoutes.get("/", redirectPage);
urlRoutes.delete("/", removeUrl);
urlRoutes.get("/verify", redirectPassword);
urlRoutes.post("/verify", verifyPassword);
urlRoutes.get("/details", showLinkDetails);
urlRoutes.patch("/edit", editOriginalUrl);
urlRoutes.patch("/security", editSecurity);
module.exports = urlRoutes;