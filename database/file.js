const mongoose = require('./db.js');
const Schema = mongoose.Schema;

const FileSchema = new Schema({
    link: String,
    local: Boolean,
    type: String,
    name: String,
    date: { type: Date, default: Date.now },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    category: { type: Schema.Types.ObjectId, ref: 'Category' }
});

module.exports = mongoose.model('File', FileSchema);
