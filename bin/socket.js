const { client } = require('./redisClient')
const redisClient = require('./redis')
const { GAME_MESSAGE } = require('../config/constConfig')
class piece {
    constructor(){
        this.adjacent = [
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0]
        ]
        this.value = 0
    }
} 
class Game {
    constructor(){
        this.activePlayer = 'playerA';
        this.status = 0;
        this.roles = {
            playerA:'',
            playerB:'',
            audience:[]
        }
        this.chessboard = (()=>{
            let boards = []
            for(let i=0;i<40;i++){
                boards[i] = []
                for(let j=0;j<40;j++){
                    boards[i].push(new piece())
                }
            }
            return boards
        })()
    }
}

function checkOffset(x,y){
    if(x == 0 || y == 0 || x==39 || y==39) return false
    return true
}

function setAndCheckValue(chessboard,poffsetx,poffsety,value){
    poffsetx = parseInt(poffsetx)
    poffsety = parseInt(poffsety)
    let chess = chessboard[poffsetx][poffsety],count = 1,position = [0,1,2,3]
    if(chess.value == 0){
        chess.value = value
        
        for(let i = 0,len = position.length;i<len;i++){
            let preChess,nextChess;
            switch(i){
                case 0:
                preChess = chessboard[poffsetx-1][poffsety-1]
                nextChess = chessboard[poffsetx+1][poffsety+1]
                break
                case 1:
                preChess = chessboard[poffsetx][poffsety-1]
                nextChess = chessboard[poffsetx][poffsety+1]
                break
                case 2:
                preChess = chessboard[poffsetx+1][poffsety-1]
                nextChess = chessboard[poffsetx-1][poffsety+1]
                break
                case 3:
                preChess = chessboard[poffsetx+1][poffsety]
                nextChess = chessboard[poffsetx-1][poffsety]
                break
            }
            if(nextChess.value == value){
                count += nextChess.adjacent[value][i+4] + 1
                chess.adjacent[value][i+4] = nextChess.adjacent[value][i+4] + 1
            }
            if(preChess.value == value){
                count += preChess.adjacent[value][i] + 1
                chess.adjacent[value][i] = preChess.adjacent[value][i] + 1
            }
            preChess.adjacent[value][i+4]++
            nextChess.adjacent[value][i]++
            
            console.log(count)
            if(count >= 5)break
        }
        if(count >=5 ) return true        
    }
    return false
}
module.exports = (socketServer)=>{

    socketServer.on('connect',(socket)=>{

        const redis = client()
        
        redis.on('ready',()=>{
            redis.subscribe(GAME_MESSAGE.GAME_SELECT_ROLE)
            redis.subscribe(GAME_MESSAGE.GAME_FINISH)
            redis.subscribe(GAME_MESSAGE.GAME_PLAY_CHESS)
            console.log('ready')
            socket.emit(GAME_MESSAGE.REDIS_READY,'ready')
        }) 
        //监听订阅成功事件
        redis.on("subscribe", function (channel, count) {
            console.log("client subscribed to " + channel + "," + count + "total subscriptions");
        });

        //收到消息后执行回调，message是redis发布的消息
        redis.on("message", function (channel, message) {
            console.log(message)
            socket.emit(channel,JSON.parse(message))
        });

        //监听取消订阅事件
        redis.on("unsubscribe", function (channel, count) {
            console.log("client unsubscribed from" + channel + ", " + count + " total subscriptions")
        });
        //监听进入游戏初始化
        socket.on(GAME_MESSAGE.GAME_INIT,async ({name,number,uid})=>{
            let key = 'game-'+name+number,game = await redisClient.get(key)

            if(!game.value){
                console.log('init game')
                game.value = new Game()
                redisClient.set(key,JSON.stringify(game.value),30*60)
            }
            socket.emit(GAME_MESSAGE.GAME_INIT,game.value)            
        })

        socket.on(GAME_MESSAGE.GAME_SELECT_ROLE,async ({name,number,uid,role})=>{
            const key = 'game-'+name+number,game = await redisClient.get(key);
            let ret = {status:false,role:''}
            if(game.value){
                let gameObj = JSON.parse(game.value),roles = gameObj.roles
                switch(role){
                    case 'playerA':
                    if(!roles.playerA&&roles.playerB!=uid&&!roles.audience.includes(uid)){
                        roles.playerA = uid
                        gameObj.status = !!roles.playerB
                        await redisClient.update(key,JSON.stringify(gameObj))
                        ret = {status:true,role:'playerA',canStart:!!roles.playerB,uid}
                    }
                    break
                    case 'playerB':
                    if(!roles.playerB&&roles.playerA!=uid&&!roles.audience.includes(uid)){
                        roles.playerB = uid
                        gameObj.status = !!roles.playerA
                        await redisClient.update(key,JSON.stringify(gameObj))
                        ret = {status:true,role:'playerB',canStart:!!roles.playerA,uid}
                    }
                    break
                    case 'audience':
                    
                    if(!roles.audience.includes(uid)&&roles.playerA!=uid&&roles.playerB!=uid){
                        roles.audience.push(uid)
                        await redisClient.update(key,JSON.stringify(gameObj))
                        ret = {status:true,role:'audience',uid}
                    }
                    break
                }
            }
            redisClient.publish(GAME_MESSAGE.GAME_SELECT_ROLE,ret)
        })
        /**
         * 监听落子
         */
        socket.on(GAME_MESSAGE.GAME_PLAY_CHESS,async ({name,number,uid,player,x,y})=>{

            let key = 'game-'+name+number,game = await redisClient.get(key)
            if(game.value){
                let gameObj = JSON.parse(game.value)
                if(gameObj.activePlayer != player||!checkOffset(x,y)) return
                gameObj.activePlayer = 'playerAplayerB'.replace(player,'')
                let value = player=='playerA'?1:2
                finish = setAndCheckValue(gameObj.chessboard,x,y,value)
                gameObj.status = finish?2:1
                await redisClient.update(key,JSON.stringify(gameObj))
                
                redisClient.publish(GAME_MESSAGE.GAME_PLAY_CHESS,{x,y,value,activePlayer:gameObj.activePlayer})
                if(finish){
                    redisClient.publish(GAME_MESSAGE.GAME_FINISH,{msg:player+'赢'})
                }
            }
                       
        })
        socket.on('disconnect',()=>{
            if(redis){
                redis.end(true)
            }
        })
        
        
    })
}