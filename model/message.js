const Messagedb = require('../database/message');

module.exports = class Message {
    static async save({ link,body,type,user}) {
        let message = new Messagedb({
            link,body,type,user
        })
        return await message.save()
    }
    static async find(condition) {
        return await Messagedb.find(condition).sort({date:-1}).limit(5)
    }
}
