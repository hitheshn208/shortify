const path = require("path")

exports.showLandingPage = (req, res)=>{
    res.sendFile(path.join(__dirname, "../views/landingPage.html"));
}