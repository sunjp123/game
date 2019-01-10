const mongoose = require('./db.js');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    type: String,
    body: String,
    date: { type: Date, default: Date.now },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    link:String
});

module.exports = mongoose.model('Message', MessageSchema);
