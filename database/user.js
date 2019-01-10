const mongoose = require('./db.js');
const Schema = mongoose.Schema;

const ShareSchema = new Schema({
		  name:  String,
		  password: String,
	      nickname: String,
	      avator:   String,
		  email: String,
		  phone: String,
		  date:{ type: Date, default: Date.now },
		  messages:[{type:Schema.Types.ObjectId,ref:'Message'}]
	    });

module.exports =  mongoose.model('User', ShareSchema);
