const mongoose = require('mongoose');

module.exports = mongoose.model('Signature',new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    roll: {
        type: Number,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    signBuffer: {
        type: String,
        required: true
    }
}, {timestamps: true}));