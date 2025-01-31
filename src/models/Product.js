const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    sku: {
        type: String,
        required: true,
        unique: true
    },
    currentQuantity: {
        type: Number,
        required: true,
        default: 0
    },
    minThreshold: {
        type: Number,
        required: true
    },
    maxThreshold: {
        type: Number,
        required: true
    },
    category: String,
    location: String,
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', ProductSchema); 