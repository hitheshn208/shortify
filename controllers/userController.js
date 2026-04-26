const path = require("path");
const { customAlphabet } = require("nanoid");
const { checkCode, registerCode, findUserById, fetchAllUrls, fetchOriginalUrl } = require("../model/userModel")

exports.showDashboardpage = async (req, res)=>{
    const user = await findUserById(req.id);
    const urls = await fetchAllUrls(req.id);
    res.render("dashboard", {
        user,
        urls
    })
}

const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 6);
const getUniqueCode = async ()=>{
    let shortCode;
    do{
        shortCode = nanoid();
    }while(await checkCode(shortCode));
    return shortCode;
}

exports.shortenUrl = async (req, res)=>{
    console.log("User Id to shorten ", req.id);
    console.log(req.body);
    const { originalUrl } = req.body;
    const shortCode = await getUniqueCode();
    const url = await registerCode(req.id, originalUrl, shortCode);
    // const shortUrl = `http://localhost:3000/${shortCode}`;
    res.json({
        original_url: url.original_url,
        short_code : url.short_code,
        visit_count : url.visit_count
    })
}