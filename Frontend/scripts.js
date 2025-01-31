// frontend/script.js
const socket = io();

const ctx = document.getElementById('inventory-chart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Inventory Levels',
            data: [],
            backgroundColor: 'rgba(75, 192, 192, 0.6)'
        }]
    }
});

document.getElementById('upload-button').addEventListener('click', () => {
    const fileInput = document.getElementById('image-upload');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            socket.emit('image', e.target.result);
        };
        reader.readAsDataURL(file);
    }
});

socket.on('inventory_update', (data) => {
    console.log('Received inventory update:', data);
    socket.emit('get_inventory');
});

socket.on('inventory_data', (data) => {
    updateChart(data);
});

function updateChart(inventoryData) {
    chart.data.labels = inventoryData.map(item => `Item ${item.item_id}`);
    chart.data.datasets[0].data = inventoryData.map(item => item.quantity);
    chart.update();
}

// Initial inventory data load
socket.emit('get_inventory');