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
        const result = await db.query("SELECT email FROM users WHERE id = $1", [id]);
        return result.rows[0];
    }catch(e){
        console.log("Error while querying in findUserById", e);
        return {email: "error"};
    }
}

exports.fetchAllUrls = async (id)=>{
    try{
        const result = await db.query("SELECT original_url, short_code, visit_count FROM urls WHERE user_id = $1", [id]);
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

exports.registerCode = async (userId, orginalUrl, shortCode) =>{
    try{
        const result = await db.query("INSERT INTO urls (user_id, original_url, short_code) VALUES ($1, $2, $3) RETURNING *", [userId, orginalUrl, shortCode]);
        return result.rows[0];
    }catch(e){
        console.log("Error while querying in registerCode ", e);
        return;
    }
}

exports.fetchOriginalUrl = async (shortCode)=>{
    try{
        const result = await db.query("UPDATE urls SET visit_count = visit_count + 1  WHERE short_code = $1 RETURNING original_url", [shortCode]);
        console.log(result.rows);
        return result.rows;
    }catch(e){
        console.log("Error while querying in fetchOriginalUrl ", e);
        return;
    }
}