let cart = JSON.parse(localStorage.getItem('cart')) || [];
let cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);


function updateCartCount() {
    document.getElementById('cart-count').textContent = cartCount;
}


function updateCartContent() {
    const cartContainer = document.getElementById('cart-container');
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
        return;
    }

    let total = 0;
    let cartHTML = '<div class="cart-items">';
    
    cart.forEach(item => {
        cartHTML += `
            <div class="cart-item d-flex align-items-center mb-3">
                <img src="${item.img}" alt="${item.name}" style="width: 50px; height: 50px; border-radius: 5px; margin-right: 10px;">
                <div class="ms-3 flex-grow-1">
                    <h6 class="mb-0">${item.name}</h6>
                    <p class="mb-0">$${item.price} x ${item.quantity}</p>
                </div>
                <button class="btn btn-danger btn-sm ms-2" onclick="removeFromCart(${item.id})">X</button>
            </div>
        `;
        total += item.price * item.quantity;
    });

    cartHTML += `
        <div class="total-section mt-3 pt-3 border-top">
            <h5>Total: $${total.toFixed(2)}</h5>
        </div>
    `;
    cartHTML += '</div>';
    
    cartContainer.innerHTML = cartHTML;
}

// localstorage
function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}


function addToCart(button) {
    const id = parseInt(button.dataset.id);
    const name = button.dataset.name;
    const price = parseFloat(button.dataset.price);
    const img = button.dataset.img;

    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id, name, price, img, quantity: 1 });
    }

    cartCount++;
    saveCartToStorage();
    updateCartCount();
    updateCartContent();

    button.classList.add('btn-success');
    button.textContent = '¡Agregado!';
    setTimeout(() => {
        button.classList.remove('btn-success');
        button.textContent = 'Agregar al Carrito';
    }, 1000);
}


function removeFromCart(id) {
    const itemIndex = cart.findIndex(item => item.id === id);
    if (itemIndex > -1) {
        cartCount -= cart[itemIndex].quantity;
        cart.splice(itemIndex, 1);
        saveCartToStorage(); 
        updateCartCount();
        updateCartContent();
    }
}

// Función de pdf
function generateReceipt() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('ClassicRecords', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Ticket de Compra', 105, 30, { align: 'center' });

    const fecha = new Date().toLocaleDateString();
    const hora = new Date().toLocaleTimeString();
    doc.text(`Fecha: ${fecha}`, 20, 40);
    doc.text(`Hora: ${hora}`, 20, 47);

    doc.line(20, 55, 190, 55);
    doc.text('Producto', 20, 62);
    doc.text('Cant.', 130, 62);
    doc.text('Precio', 150, 62);
    doc.text('Total', 170, 62);
    doc.line(20, 65, 190, 65);

    let yPos = 72;
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        doc.text(item.name, 20, yPos);
        doc.text(item.quantity.toString(), 130, yPos);
        doc.text(`$${item.price.toFixed(2)}`, 150, yPos);
        doc.text(`$${itemTotal.toFixed(2)}`, 170, yPos);
        
        yPos += 7;
    });

    doc.line(20, yPos, 190, yPos);
    yPos += 7;
    doc.setFontSize(14);
    doc.text(`Total: $${total.toFixed(2)}`, 170, yPos, { align: 'right' });

    doc.setFontSize(12);
    yPos += 20;
    doc.text('¡Gracias por tu compra!', 105, yPos, { align: 'center' });

    doc.save('ticket-compra.pdf');

    // Limpiar carrito después de la compra
    cart = [];
    cartCount = 0;
    saveCartToStorage();
    updateCartCount();
    updateCartContent();

    const modal = document.getElementById('cartModal');
    const bootstrapModal = bootstrap.Modal.getInstance(modal);
    bootstrapModal.hide();
}


document.addEventListener('DOMContentLoaded', function () {
    updateCartCount();
    updateCartContent();

    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => addToCart(button));
    });

    const checkoutButton = document.getElementById('checkout');
    checkoutButton.addEventListener('click', generateReceipt);
});
