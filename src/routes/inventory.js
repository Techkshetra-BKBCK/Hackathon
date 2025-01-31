const router = require('express').Router();
const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const { checkLowStock } = require('../utils/inventoryUtils');

// Get all products
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add new product
router.post('/products', async (req, res) => {
    try {
        const product = new Product(req.body);
        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update inventory quantity
router.put('/products/:id/quantity', async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, type } = req.body;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const previousQuantity = product.currentQuantity;
        let newQuantity;

        switch (type) {
            case 'IN':
                newQuantity = previousQuantity + quantity;
                break;
            case 'OUT':
                newQuantity = previousQuantity - quantity;
                if (newQuantity < 0) {
                    return res.status(400).json({ message: 'Insufficient stock' });
                }
                break;
            default:
                newQuantity = quantity;
        }

        // Update product quantity
        product.currentQuantity = newQuantity;
        product.lastUpdated = new Date();
        await product.save();

        // Log the transaction
        const log = new InventoryLog({
            productId: id,
            type,
            quantity,
            previousQuantity,
            newQuantity
        });
        await log.save();

        // Check stock levels and send alerts if necessary
        await checkLowStock(product);

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 