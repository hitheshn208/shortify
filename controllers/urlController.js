const { getLink, insertLink } = require("../model/redisuserModel");
const { fetchOriginalUrl, updateClick,fetchUrlPassword,} = require("../model/userModel");
const bcrypt = require("bcrypt");

exports.redirectPage = async (req, res, next)=>{
    const shortCode = req.params.code;
    if (!/^[A-Za-z]{6}$/.test(shortCode)) 
        return next(); 

    let url = null;

    const cached = await getLink(shortCode);

    if(cached){
        url = JSON.parse(cached);
    }else{
        const availableUrls = await fetchOriginalUrl(shortCode);
        if(availableUrls.length === 0)
            return next();
        url = availableUrls[0];
        await insertLink(shortCode, url.original_url, url.is_protected, url.url_password);
    }

    if(url.is_protected)
        res.redirect(`/${shortCode}/verify`);
    else
    {
        const clickUpdated = await updateClick(shortCode);
        if(!clickUpdated) {
            // console.log("Warning: Failed to update click count for:", shortCode);
        }
        res.redirect(url.original_url);
    }
}

exports.redirectPassword = async (req, res, next)=>{
    const Shortcode = req.params.code;
    // console.log("Came to redirect page ", Shortcode)
    res.render("verifyPassword" , {Shortcode});
}

exports.verifyPassword = async (req, res, next)=>{
    const shortCode = req.params.code;
    const { password } = req.body;

    let url = JSON.parse(await getLink(shortCode));
    let isMatch = false;
    if(!url){
        const availableUrls = await fetchUrlPassword(shortCode);
        if(!availableUrls.length)
            return next()
        url = availableUrls[0];
    }

    if(!url.url_password)
        return res.status(400).json({ message: "Password is not set for this link" });

    isMatch = await bcrypt.compare(password, url.url_password);
    const wantsJson = req.xhr || (req.headers.accept && req.headers.accept.includes("application/json"));

    if(isMatch)
    {
        const clickUpdated = await updateClick(shortCode);
        if(!clickUpdated) {
            // console.log("Warning: Failed to update click count for:", shortCode);
        }
        if(wantsJson)
            return res.json({ redirectUrl: url.original_url });

        return res.redirect(url.original_url);
    }
    else
        return res.status(401).json({
            message: "Wrong Password"
        });
}
