// ============= MODAL MANAGEMENT =============
const modals = {
    order: document.getElementById('order-modal'),
    quantity: document.getElementById('quantity-modal'),
    cart: document.getElementById('cart-modal')
};

const closeButtons = document.querySelectorAll('.close');

function openModal(modalType) {
    if (modals[modalType]) modals[modalType].style.display = 'block';
}

function closeModal(modalType) {
    if (modals[modalType]) modals[modalType].style.display = 'none';
}

function closeAllModals() {
    Object.values(modals).forEach(modal => {
        if (modal) modal.style.display = 'none';
    });
}

// Close modals via close buttons
closeButtons.forEach(btn => {
    btn.addEventListener('click', closeAllModals);
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    Object.entries(modals).forEach(([key, modal]) => {
        if (e.target === modal) closeModal(key);
    });
});

// Close modals with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
});

// ============= CART SYSTEM =============
let cart = JSON.parse(localStorage.getItem('ohsushiCart')) || [];

function saveCart() {
    localStorage.setItem('ohsushiCart', JSON.stringify(cart));
}

function addToCart(name, price, quantity) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ name, price, quantity });
    }
    
    updateCartUI();
    saveCart();
}

function updateCartUI() {
    const cartCountSpan = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotal = document.getElementById('cart-total');
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountSpan.textContent = totalItems;
    
    // Update cart items display
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        cartTotal.textContent = 0;
        return;
    }
    
    cartItemsContainer.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p class="cart-item-price">₱${item.price} x ${item.quantity}</p>
                <p class="cart-item-subtotal">Subtotal: ₱${item.price * item.quantity}</p>
            </div>
            <div class="cart-item-controls">
                <button class="cart-qty-btn" data-index="${index}" data-action="decrease">-</button>
                <span class="cart-qty-display">${item.quantity}</span>
                <button class="cart-qty-btn" data-index="${index}" data-action="increase">+</button>
                <button class="remove-item-btn" data-index="${index}">Remove</button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to quantity controls
    document.querySelectorAll('.cart-qty-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const action = this.getAttribute('data-action');
            
            if (action === 'increase') {
                cart[index].quantity += 1;
            } else if (action === 'decrease' && cart[index].quantity > 1) {
                cart[index].quantity -= 1;
            }
            
            updateCartUI();
            saveCart();
        });
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            cart.splice(index, 1);
            updateCartUI();
            saveCart();
        });
    });
    
    // Update total price
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total;
}

// ============= ADD TO CART FUNCTIONALITY =============
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const quantityInput = document.getElementById('quantity-input');
const increaseQtyBtn = document.getElementById('increase-qty');
const decreaseQtyBtn = document.getElementById('decrease-qty');
const confirmAddBtn = document.getElementById('confirm-add');

let currentProduct = null;

addToCartButtons.forEach(button => {
    button.addEventListener('click', function() {
        const menuItem = this.closest('.menu-item');
        const productName = menuItem.getAttribute('data-name');
        const productPrice = menuItem.getAttribute('data-price');
        
        currentProduct = { name: productName, price: parseInt(productPrice) };
        
        document.getElementById('modal-title').textContent = `Select Quantity - ${productName}`;
        document.getElementById('modal-price').textContent = `Price: ₱${productPrice} per item`;
        quantityInput.value = 1;
        
        openModal('quantity');
    });
});

// Quantity controls
increaseQtyBtn.addEventListener('click', () => {
    quantityInput.value = parseInt(quantityInput.value) + 1;
});

decreaseQtyBtn.addEventListener('click', () => {
    if (parseInt(quantityInput.value) > 1) {
        quantityInput.value = parseInt(quantityInput.value) - 1;
    }
});

quantityInput.addEventListener('change', function() {
    const value = parseInt(this.value);
    this.value = (value < 1 || !Number.isInteger(value)) ? 1 : value;
});

confirmAddBtn.addEventListener('click', function() {
    const quantity = parseInt(quantityInput.value);
    addToCart(currentProduct.name, currentProduct.price, quantity);
    closeModal('quantity');
});

// ============= CART ICON AND BUTTONS =============
const cartIcon = document.getElementById('cart-icon');
const clearCartBtn = document.getElementById('clear-cart-btn');
const checkoutBtn = document.getElementById('checkout-btn');

cartIcon.addEventListener('click', (e) => {
    e.preventDefault();
    openModal('cart');
});

clearCartBtn.addEventListener('click', () => {
    cart = [];
    updateCartUI();
    saveCart();
});

checkoutBtn.addEventListener('click', function() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemList = cart.map(item => `${item.name} (x${item.quantity})`).join('\n');
    
    alert(`Order Summary:\n\n${itemList}\n\nTotal: ₱${total}\n\nPlease contact us to complete your order!`);
});

// ============= BANNER SLIDER =============
const slides = document.querySelectorAll(".banner-slide");
const dots = document.querySelectorAll(".dot");
const nextBtn = document.querySelector(".right-arrow");
const prevBtn = document.querySelector(".left-arrow");

if (slides.length > 0) {
    let currentIndex = 0;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove("active"));
        dots.forEach(dot => dot.classList.remove("active"));
        slides[index].classList.add("active");
        dots[index].classList.add("active");
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        showSlide(currentIndex);
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        showSlide(currentIndex);
    }

    if (nextBtn) nextBtn.addEventListener("click", nextSlide);
    if (prevBtn) prevBtn.addEventListener("click", prevSlide);

    setInterval(nextSlide, 4000);

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            currentIndex = index;
            showSlide(currentIndex);
        });
    });
}

// ============= ORDER MODAL SYSTEM (Legacy) =============
const orderButtons = document.querySelectorAll('.item-button');
const orderModal = modals.order;
const orderSummary = document.getElementById('order-summary');
const orderSummaryBtn = document.querySelector('.order-cta');

let orderItems = [];

function addToOrder(itemName, itemPrice) {
    const existingItem = orderItems.find(item => item.name === itemName);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        orderItems.push({ name: itemName, price: itemPrice, quantity: 1 });
    }
    updateOrderSummary();
}

function updateOrderSummary() {
    if (!orderSummary) return;

    if (orderItems.length === 0) {
        orderSummary.innerHTML = '<p>No items added yet.</p>';
        return;
    }

    let total = 0;
    let summaryHTML = '<ul>';

    orderItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        summaryHTML += `
            <li>
                ${item.name} x ${item.quantity}
                <span>₱${itemTotal.toLocaleString()}</span>
            </li>
        `;
    });

    summaryHTML += `</ul><div class="order-total"><strong>Total: ₱${total.toLocaleString()}</strong></div>`;
    orderSummary.innerHTML = summaryHTML;
}

orderButtons.forEach(button => {
    button.addEventListener('click', function () {
        const card = this.closest('.menu-item');
        if (!card) return;

        const itemName = card.querySelector('.item-name').textContent;
        const priceText = card.querySelector('.item-price').textContent.replace('₱', '').replace(',', '');
        const itemPrice = parseFloat(priceText);

        addToOrder(itemName, itemPrice);
        openModal('order');

        this.textContent = '✓ Added!';
        this.classList.add('added');
        setTimeout(() => {
            this.textContent = 'Add to Order';
            this.classList.remove('added');
        }, 2000);
    });
});

if (orderSummaryBtn) {
    orderSummaryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('order');
    });
}

const orderCheckoutBtn = document.getElementById('checkout-btn');
if (orderCheckoutBtn && orderButtons.length > 0) {
    orderCheckoutBtn.addEventListener('click', function () {
        if (orderItems.length === 0) {
            alert('Please add items to your order first!');
            return;
        }

        let orderText = "Hi Oh Sushi! Here's my order:\n\n";
        let total = 0;

        orderItems.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            orderText += `${item.name} x ${item.quantity} - ₱${itemTotal.toLocaleString()}\n`;
        });

        orderText += `\nTotal: ₱${total.toLocaleString()}`;

        navigator.clipboard.writeText(orderText)
            .then(() => {
                alert('Order copied! Please paste and send it via Facebook or SMS.');
                closeModal('order');
                orderItems = [];
                updateOrderSummary();
            })
            .catch(() => {
                alert('Copy failed. Please manually send:\n\n' + orderText);
            });
    });
}

// ============= SMOOTH SCROLL =============
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        if (this.classList.contains('order-cta')) return;

        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;

        window.scrollTo({
            top: target.offsetTop - 80,
            behavior: 'smooth'
        });
    });
});

// ============= IMAGE HOVER EFFECT =============
document.querySelectorAll('.image-placeholder').forEach(img => {
    img.addEventListener('mouseenter', () => img.style.transform = 'scale(1.03)');
    img.addEventListener('mouseleave', () => img.style.transform = 'scale(1)');
});

// ============= INITIALIZATION =============
document.addEventListener('DOMContentLoaded', function() {
    updateCartUI();
});