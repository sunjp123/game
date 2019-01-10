const REDIS_MESSAGE = {
    SHARE_MESSAGE:{
        KEY:'SHARE_MESSAGE_KEY',
        EVENT:'SHARE_MESSAGE_EVENT',
        CONTENT:'%USER% %OPERATE% %CONTENT%'
    }
}

exports.REDIS_MESSAGE = REDIS_MESSAGE

const HAPPY_RECORD = {
    HOST_URL:'http://localhost:3001'
}

exports.HAPPY_RECORD = HAPPY_RECORD


exports.GAME_MESSAGE = {
    GAME_INIT:'GAME_INIT',
    REDIS_READY:'REDIS_READY',
    GAME_SELECT_ROLE:'GAME_SELECT_ROLE',
    GAME_PLAY_CHESS:'GAME_PRESS_CHESS',
    GAME_START:'GAME_START',
    GAME_FINISH:'GAME_FINISH'
}