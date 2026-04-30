const db = require("../config/database");

exports.findUserByEmail = async (email)=>{
    try{
        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        return result.rows;
    }catch(e){
        console.log("Error while querying in findUserByEmail ", e);
        return;
    }
}

exports.registerUser = async (email, hashedPassword)=>{
    try{
        const result = await db.query("INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *", [email, hashedPassword]);
        return result.rows[0]
    }catch(e){
        console.log("Error while querying in findUserByEmail ", e);
        return;
    }
}

exports.findUserById = async (id)=>{
    try{
        const result = await db.query("SELECT name, email FROM users WHERE id = $1", [id]);
        return result.rows[0];
    }catch(e){
        console.log("Error while querying in findUserById", e);
        return {email: "error"};
    }
}

exports.fetchAllUrls = async (id)=>{
    try{
        const result = await db.query("SELECT original_url, short_code, visit_count, is_protected FROM urls WHERE user_id = $1", [id]);
        return result.rows;
    }catch(e){
        console.log("Error while querying in fetchAllUrls", e);
        return [];
    }
}

exports.checkCode = async (shortCode)=>{
    try{
        const result = await db.query("SELECT * FROM urls WHERE short_code = $1", [shortCode]);
        console.log("Hit db");
        if(result.rows.length === 0)
            return false;
        else
            return true;
    }catch(e){
        console.log("Error while querying in checkCode ", e);
        return;
    }
}

exports.registerCode = async (userId, orginalUrl, shortCode, passwordProtected, HashedPassword) =>{
    try{

        const result = await db.query("INSERT INTO urls (user_id, original_url, short_code, is_protected, url_password) VALUES ($1, $2, $3, $4, $5) RETURNING *", [userId, orginalUrl, shortCode, passwordProtected, HashedPassword]);
        return result.rows[0];
    }catch(e){
        console.log("Error while querying in registerCode ", e);
        return;
    }
}

exports.fetchOriginalUrl = async (shortCode)=>{
    try{
        const result = await db.query("SELECT original_url, is_protected FROM urls WHERE short_code = $1", [shortCode]);
        return result.rows;
    }catch(e){
        console.log("Error while querying in fetchOriginalUrl ", e);
        return;
    }
}

exports.updateClick = async (shortCode)=>{
    try{
        const result = await db.query("UPDATE urls SET visit_count = visit_count + 1 WHERE short_code = $1", [shortCode])
    }catch(e){
        console.log("Error while querying in updateClick ", e);
        return;
    }
}

exports.fetchLinkDetails = async (shortCode, userId)=>{
    try{
        const result = await db.query("SELECT id, original_url, short_code, is_protected, visit_count, created_at FROM urls WHERE short_code = $1 AND user_id = $2", [shortCode, userId]);
        return result.rows;
    }catch(e){
        console.log("Error while querying in fetchOriginalUrl ", e);
        return;
    }
}

exports.fetchUrlPassword = async (shortCode)=> {
    try{
        const result = await db.query("SELECT original_url, url_password FROM urls WHERE short_code = $1", [shortCode]);
        return result.rows;
    }catch(e){
        console.log("Error while querying in fetchUrlPassword ", e);
        return;
    }
}

exports.updateOriginalUrl = async (id, newUrl, userId)=>{
    try{
        const result = await db.query("UPDATE urls SET original_url = $1 WHERE id = $2 AND user_id = $3", [newUrl, id, userId]);
        console.log("UPDATED ", id, " User ", userId);
        return;
    }catch(e){
        console.log("Error while querying in updateOriginalUrl ", e);
        return;
    }
}

exports.updateSecurity = async (id, userId, isProtected, password)=>{
    try{
        await db.query("UPDATE urls SET is_protected = $1, url_password = $2 WHERE id = $3 AND user_id = $4 ", [isProtected, password, id, userId]);
    }catch(e){
        console.log("Error while querying in updateSecurity ", e);
        return;
    }
}

exports.deleteUrl = async (short_code, userId)=>{
    try{
        const result = await db.query("DELETE FROM urls WHERE short_code = $1 AND user_id = $2", [short_code, userId]);
        return result.rows
    }catch(e){
        console.log("Error while querying in deleteUrl ", e);
        return;
    }
}

exports.resetClick = async (id, userId)=>{
    try{
        await db.query("UPDATE urls SET visit_count = 0 WHERE id = $1 AND user_id = $2", [id, userId]);
        return true;
    }catch(e){
        console.log("Error while querying in resetClick ", e);
        return false;
    }
}