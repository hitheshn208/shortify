const { customAlphabet } = require("nanoid");
const { checkCode, registerCode, findUserById, fetchAllUrls, fetchLinkDetails, updateOriginalUrl, updateSecurity, resetClick, deleteUrl } = require("../model/userModel")
const {hashPassword} = require("../utils/hashPassword");

exports.showDashboardpage = async (req, res)=>{
    const user = await findUserById(req.id);
    const urls = await fetchAllUrls(req.id);
    res.set("Cache-Control", "no-store");
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
    // console.log("User Id to shorten ", req.id);
    // console.log(req.body);
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

exports.showLinkDetails = async (req, res, next)=>{
    const shortCode = req.params.code;
    const userId = req.id;
    const availableUrls = await fetchLinkDetails(shortCode, userId);
    const user = await findUserById(userId);
    if(availableUrls.length === 0 || user === 'undefined')
        return next();

    const url = availableUrls[0];
    url.short_url = `shortify.h208.me/${shortCode}`;
    res.render("linkdetails", {url, user});
}

exports.editOriginalUrl = async (req, res)=>{
    const { id , newUrl } = req.body;
    const userId = req.id;
    try{
        // console.log("Came to edit")
        await updateOriginalUrl(id, newUrl, userId);
        return res.sendStatus(204);
    }catch(e){
        // console.log(e);
        return res.sendStatus(400);
    }
}

exports.editSecurity = async(req, res)=>{
    const { id, isProtected, password } = req.body;
    const userId = req.id;
    if(!isProtected)
    {
        await updateSecurity(id, userId, isProtected, null);
        return res.sendStatus(204);
    }
    const HashedPassword = await hashPassword(password);
    await updateSecurity(id, userId, isProtected, HashedPassword);
    return res.sendStatus(204);
}

exports.zeroClick = async(req, res)=>{
    const { id } = req.body;
    const shortCode = req.params.code;
    const userId = req.body;

    if(!await resetClick(id, shortCode, userId))
        return res.status(501).send("Internal server error");

    return res.sendStatus(204);
}

exports.removeUrl = async(req, res)=>{
    const shortCode = req.params.code;
    const userId = req.id;
    // console.log(shortCode)
    if(!shortCode)
        res.sendStatus(400);
    const row = await deleteUrl(shortCode, userId);
    // console.log(row);
    // console.log("Success");
    return res.sendStatus(204);
}