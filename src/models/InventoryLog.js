const mongoose = require('mongoose');

const InventoryLogSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    type: {
        type: String,
        enum: ['IN', 'OUT', 'ADJUSTMENT'],
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    previousQuantity: Number,
    newQuantity: Number,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('InventoryLog', InventoryLogSchema); 