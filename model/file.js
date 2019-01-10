const Filedb = require('../database/file');

module.exports = class File {
    static async save({ link, user, local, type, name, category }) {
        let file = new Filedb({
            link, user, local, type, name, category
        })
        return await file.save()
    }
    static async findById(_id) {
        return await Filedb.findById(_id)
    }
}
