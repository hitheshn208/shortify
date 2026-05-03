const { fetchOriginalUrl, updateClick,fetchUrlPassword,} = require("../model/userModel");
const bcrypt = require("bcrypt");

exports.redirectPage = async (req, res, next)=>{
    const shortCode = req.params.code;
    // console.log("Came inside ", shortCode)
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

exports.verifyPassword = async (req, res)=>{
    const shortCode = req.params.code;
    const { password } = req.body;
    // console.log("Came to verify ", password);
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
