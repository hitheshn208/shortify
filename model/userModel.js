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