const bcrypt = require('bcrypt');
const { customAlphabet } = require("nanoid");
const { checkCode, registerCode, findUserById, fetchAllUrls } = require("../model/userModel")

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
    const { originalUrl, passwordProtected, password } = req.body;
    let HashedPassword;
    if(passwordProtected)
        HashedPassword = await hashPassword(password);
    else
        HashedPassword = null;

    const shortCode = await getUniqueCode();
    const url = await registerCode(req.id, originalUrl, shortCode, passwordProtected, HashedPassword);
    res.json({
        original_url: url.original_url,
        short_code : url.short_code,
        visit_count : url.visit_count,
        is_protected : url.is_protected
    })
}

async function hashPassword(password){
    console.log("Hashed Password")
    const saltRound = 5;
    const hashedPassword = await bcrypt.hash(password, saltRound);
    return hashedPassword;
}