
const Router = require('koa-router')

const Game = require('../model/Game')
const { publish } = require('../bin/redisClient')
const { REDIS_MESSAGE } = require('../config/constConfig')
const sharePublish = publish(REDIS_MESSAGE.SHARE_MESSAGE.KEY,REDIS_MESSAGE.SHARE_MESSAGE.EVENT)
let game = new Router()


game.all('/rooms',async (ctx,next)=>{
    
})

game.all('/room/:id',async (ctx,next)=>{
    
})

module.exports = game