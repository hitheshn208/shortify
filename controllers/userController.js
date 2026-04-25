const path = require("path");
exports.showHomepage = (req, res)=>{
    res.sendFile(path.join(__dirname, "../views/homepage.html"))
}

exports.shortenUrl = (req, res)=>{
    console.log("User Id to shorten ", req.id);
    console.log(req.body);
    const { originalUrl } = req.body;
    const shortUrl = "http://localhost:3000/nnadq"
    res.json({
        originalUrl,
        shortUrl
    })
}