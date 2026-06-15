const { createClient } = require('redis');

const redisClient = createClient({
    url: "redis://localhost:6379"
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