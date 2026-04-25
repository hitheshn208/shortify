const express = require("express");
const { showLandingPage } = require("../controllers/publicController");

const publicRouter = express.Router();

publicRouter.get("/", showLandingPage);

module.exports = publicRouter;