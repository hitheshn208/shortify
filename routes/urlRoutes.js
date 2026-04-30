const express = require("express");
const { redirectPage, redirectPassword, verifyPassword, removeUrl } = require("../controllers/urlController");
const urlRoutes = express.Router({ mergeParams: true });

urlRoutes.get("/", redirectPage);
urlRoutes.get("/verify", redirectPassword);
urlRoutes.post("/verify", verifyPassword);
module.exports = urlRoutes;