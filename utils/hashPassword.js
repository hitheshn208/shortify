const bcrypt = require("bcrypt");
exports.hashPassword= async (password)=>{
    console.log("Hashed Password")
    const saltRound = 5;
    const hashedPassword = await bcrypt.hash(password, saltRound);
    return hashedPassword;
}