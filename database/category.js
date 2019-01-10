const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
		name:  String,
		publicFlag: Boolean,
		shareFlag: Boolean,
		children:[{type: Schema.Types.ObjectId, ref: 'Share'}],
		belong:{type: Schema.Types.ObjectId, ref: 'User'},
		date: { type: Date, default: Date.now }
	});

module.exports = mongoose.model('Category', categorySchema);
