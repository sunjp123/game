const redis = require("redis");
const CONFIG =  require('../config/redisConfig')
const client = redis.createClient(CONFIG.port, CONFIG.host);

exports.set = (key,value,expire,cb)=>{
    // console.log(value)
    client.set(key,value,(...args)=>{
        cb&&cb(...args)
    })
    client.expire(key,expire,(...args)=>{
        console.log('reids expire='+args)
    })
}

exports.get = (key,callback)=>{
    return new Promise((resolve)=>{
        client.get(key,(err,reply)=>{
            const ret = {err,value:reply&&reply.toString()}
            // console.log('reids get='+JSON.stringify(ret))
            resolve(ret)
            callback&&callback(ret)
        })
    })
    
}
exports.update = (key,value)=>{
    return new Promise((resolve)=>{
        client.set(key,value,()=>{
            resolve()
        })
    })
}
exports.publish = (event,msg)=>{
    client.zadd('game-publish-event',Math.random(),()=>{
        console.log(event)
        client.publish(event,typeof msg == 'object'?JSON.stringify(msg):msg)
    })
}
