const { createClient } = require('redis');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

redisClient.on("error", (err)=>{
    console.error("Redis error: ", err);
})

// async function redisTest() {
//     try{
//         await redisClient.connect();
//         console.log("Redis is connected");
//     }catch(e){
//         console.error("Failed to connect Redis:", e);
//     }
// }

// redisTest();

module.exports = redisClient;