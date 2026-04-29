const { fetchOriginalUrl, updateClick, findUserById,fetchUrlPassword, fetchLinkDetails, updateOriginalUrl, updateSecurity, deleteUrl } = require("../model/userModel");
const bcrypt = require("bcrypt");
const {hashPassword} = require("../utils/hashPassword");

exports.redirectPage = async (req, res, next)=>{
    const shortCode = req.params.code;
    console.log("Came inside ", shortCode)
    if (!/^[A-Za-z]{6}$/.test(shortCode)) 
        return next(); 

    const availableUrls = await fetchOriginalUrl(shortCode);

    if(availableUrls.length === 0)
        return next();
    
    const url = availableUrls[0];
    if(url.is_protected)
        res.redirect(`/${shortCode}/verify`);
    else
    {
        await updateClick(shortCode);
        res.redirect(url.original_url);
    }
}

exports.redirectPassword = async (req, res, next)=>{
    const Shortcode = req.params.code;
    console.log("Came to redirect page ", Shortcode)
    res.render("verifyPassword" , {Shortcode});
}

exports.verifyPassword = async (req, res)=>{
    const shortCode = req.params.code;
    const { password } = req.body;
    console.log("Came to verify ", password);
    const availableUrls = await fetchUrlPassword(shortCode);
    if(!availableUrls.length)
        return res.status(404).json({ message: "Link not found" });

    const url = availableUrls[0];
    if(!url.url_password)
        return res.status(400).json({ message: "Password is not set for this link" });

    const isMatch = await bcrypt.compare(password, url.url_password);
    const wantsJson = req.xhr || (req.headers.accept && req.headers.accept.includes("application/json"));

    if(isMatch)
    {
        await updateClick(shortCode);
        if(wantsJson)
            return res.json({ redirectUrl: url.original_url });

        return res.redirect(url.original_url);
    }
    else
        return res.status(401).json({
            message: "Wrong Password"
        });
}

exports.showLinkDetails = async (req, res, next)=>{
    const shortCode = req.params.code;
    const userId = req.id;
    const availableUrls = await fetchLinkDetails(shortCode);
    const user = await findUserById(userId);
    if(availableUrls.length === 0 || user === 'undefined')
        return next();

    const url = availableUrls[0];
    url.short_url = `http://localhost:3000/${shortCode}`;
    res.render("linkdetails", {url, user});
}

exports.editOriginalUrl = async (req, res)=>{
    const { id , newUrl } = req.body;
    try{
        console.log("Came to edit")
        await updateOriginalUrl(id, newUrl);
        return res.sendStatus(204);
    }catch(e){
        console.log(e);
        return res.sendStatus(400);
    }
}

exports.editSecurity = async(req, res)=>{
    const { id , isProtected, password } = req.body;

    if(!isProtected)
    {
        await updateSecurity(id , isProtected, null);
        return res.sendStatus(204);
    }
    const HashedPassword = await hashPassword(password);
    await updateSecurity(id , isProtected, HashedPassword);
    return res.sendStatus(204);
}

exports.removeUrl = async(req, res)=>{
    const shortCode = req.params.code;
    console.log(shortCode)
    if(!shortCode)
        res.sendStatus(400);
    const row = await deleteUrl(shortCode);
    console.log(row);
    console.log("Success");
    return res.sendStatus(204);
}