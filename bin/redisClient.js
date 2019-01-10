const redis = require("redis");
const CONFIG =  require('../config/redisConfig')
const client = redis.createClient(CONFIG.port, CONFIG.host);
exports.client  = _ => redis.createClient(CONFIG.port, CONFIG.host);

exports.publish = (key,event)=>{
    return (content)=>{
        client.zadd(key,Math.random(),()=>{
            client.publish(event,typeof content == 'object'?JSON.stringify(content):content)
        })
    }
}