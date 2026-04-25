const { fetchOriginalUrl } = require("../model/userModel")

exports.redirectPage = async (req, res, next)=>{
    const shortCode = req.params.code;
    if (!/^[A-Za-z]{6}$/.test(shortCode)) 
        return next(); 

    const availableUrls = await fetchOriginalUrl(shortCode);

    if(availableUrls.length === 0)
        return next();
    
    const originalUrl = availableUrls[0].original_url;
    res.redirect(originalUrl);
}