document.addEventListener('DOMContentLoaded', () => {
    const addForm = document.getElementById('add-form');
    const inventoryBody = document.getElementById('inventory-body');

    // Fetch and display inventory
    const loadInventory = async () => {
        try {
            const response = await fetch('/api/inventory');
            const result = await response.json();
            if (result.success) {
                renderTable(result.data);
            } else {
                console.error('Failed to load inventory:', result.message);
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
        }
    };

    // Render table rows
    const renderTable = (items) => {
        inventoryBody.innerHTML = '';
        items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>
                    <button class="delete-btn" onclick="deleteItem(${item.id})">Delete</button>
                </td>
            `;
            inventoryBody.appendChild(row);
        });
    };

    // Add new item
    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('itemName').value;
        const quantity = document.getElementById('itemQuantity').value;
        const price = document.getElementById('itemPrice').value;

        const payload = { name, quantity, price };

        try {
            const response = await fetch('/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            
            if (result.success) {
                addForm.reset();
                loadInventory(); // Refresh table
            } else {
                alert('Error adding item: ' + result.message);
            }
        } catch (error) {
            console.error('Error adding item:', error);
        }
    });

    // Delete item (exposed to global window object)
    window.deleteItem = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        
        try {
            const response = await fetch(`/api/inventory/${id}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            
            if (result.success) {
                loadInventory(); // Refresh table
            } else {
                alert('Error deleting item: ' + result.message);
            }
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    // Initial load
    loadInventory();
});
