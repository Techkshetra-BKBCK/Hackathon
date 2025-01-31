const router = require('express').Router();
const InventoryLog = require('../models/InventoryLog');
const Product = require('../models/Product');

// Get inventory movement history
router.get('/movement/:productId', async (req, res) => {
    try {
        const logs = await InventoryLog.find({ productId: req.params.productId })
            .sort({ timestamp: -1 })
            .limit(100);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get low stock items
router.get('/low-stock', async (req, res) => {
    try {
        const lowStockProducts = await Product.find({
            $expr: {
                $lte: ['$currentQuantity', '$minThreshold']
            }
        });
        res.json(lowStockProducts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 