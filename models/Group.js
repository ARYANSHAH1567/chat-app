const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true, unique:true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [{
        content: { type: String, required: true },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        createdAt: { type: Date, default: Date.now },
    }],
});

module.exports = mongoose.model('Group', groupSchema);
