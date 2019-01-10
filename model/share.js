const Sharedb = require('../database/share');

module.exports = class Share {
	static async save({ category, title, link, author, privite, target, description, icon }) {
		let share = new Sharedb({
			category, title, link, author, privite, target, description, icon
		})
		return await share.save()
	}
	static async find(condition = {}, opts = {}) {
		return await Sharedb.find(condition, opts).populate('author', { select: '-password -email -phone' }).exec()
	}
	static async findById(_id){
		return await Sharedb.findById(_id)
	}
	static async findByIdAndRemove(_id) {
		return await Sharedb.findByIdAndRemove(_id)
	}
}
