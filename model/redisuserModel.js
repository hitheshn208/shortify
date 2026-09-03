const redisClient = require("../config/redis");

exports.insertOtp = async(email, hashed_password, otp)=>{
    try {
        await redisClient.set(`pwd@${email}`, hashed_password, {
            EX: 1800
        })
        await redisClient.set(`otp@${email}`, otp, {
            EX: 300
        });
    } catch (e) {
        console.log("Redis error in insertOtp ", e);
    }
}

exports.removeOtp = async (email)=>{
    try {
        await redisClient.del(`pwd@${email}`);
        await redisClient.del(`otp@${email}`);
    } catch (error) {
        console.log("Redis error in removeOtp ", error);
    }
}

exports.getOtpOfUser = async (email) =>{
    try {
        const otp = await redisClient.get(`otp@${email}`);
        console.log(Number(otp))
        return Number(otp);
    } catch (error) {
        console.log("Redis error in getOtpOfUser ", error);
    }
}

exports.refreshCredential = async (email)=>{
    try {
        await redisClient.expire(`pwd@${email}`, 1800);
    } catch (error) {
        console.log("Redis error in refreshCredential ", error);
    }
}

exports.updateOtp = async(email, otp)=>{
    try {
        await redisClient.expiry(`pwd@${email}`, 1800)
        await redisClient.set(`otp@${email}`, otp, {
            EX: 300
        });
    } catch (e) {
        console.log("Redis error in updateOtp ", e);
    }
}

exports.getPassword = async (email) =>{
    try {
        const password = await redisClient.get(`pwd@${email}`);
        await redisClient.del(`pwd@${email}`);
        await redisClient.del(`otp@${email}`);
        return password;
    } catch (error) {
        console.log("Redis error in getOtpOfUser ", error);
    }
}

exports.getLink = async(code)=>{
    try {
        const cached = await redisClient.get(`url@${code}`);
        return cached;
    } catch (error) {
        console.log("Redis error in getLink ", error);
    }
}

exports.insertLink = async (code, url, isProtected)=>{
    try {
        await redisClient.set(`url@${code}`, 
            JSON.stringify({
                original_url: url,
                is_protected: isProtected
            }),
            {
                EX: 60*60
            }
        )
    } catch (error) {
        console.log("Redis error in insertLink ", error);
    }
}