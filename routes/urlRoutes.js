const express = require("express");
const { redirectPage, redirectPassword, verifyPassword, showLinkDetails } = require("../controllers/urlController");

const urlRoutes = express.Router({ mergeParams: true });

urlRoutes.get("/", redirectPage);
urlRoutes.get("/verify", redirectPassword);
urlRoutes.post("/verify", verifyPassword);
urlRoutes.get("/details", showLinkDetails);

module.exports = urlRoutes;