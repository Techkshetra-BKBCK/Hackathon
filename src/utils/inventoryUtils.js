const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    // Configure your email service here
});

const checkLowStock = async (product) => {
    if (product.currentQuantity <= product.minThreshold) {
        await sendLowStockAlert(product);
    } else if (product.currentQuantity >= product.maxThreshold) {
        await sendOverstockAlert(product);
    }
};

const sendLowStockAlert = async (product) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: process.env.ALERT_EMAIL,
            subject: `Low Stock Alert: ${product.name}`,
            text: `Product ${product.name} (SKU: ${product.sku}) is running low on stock. Current quantity: ${product.currentQuantity}`
        });
    } catch (error) {
        console.error('Error sending low stock alert:', error);
    }
};

const sendOverstockAlert = async (product) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: process.env.ALERT_EMAIL,
            subject: `Overstock Alert: ${product.name}`,
            text: `Product ${product.name} (SKU: ${product.sku}) is overstocked. Current quantity: ${product.currentQuantity}`
        });
    } catch (error) {
        console.error('Error sending overstock alert:', error);
    }
};

module.exports = {
    checkLowStock
}; 