// Khởi tạo biến cart ở phạm vi toàn cục
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Hàm định dạng giá tiền
function formatPrice(price) {
    if (typeof price === 'string') {
        price = parseInt(price.replace(/[^\d]/g, ''), 10);
    }
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

// Hàm cập nhật badge số lượng giỏ hàng trên navbar
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.textContent = cartCount;
    }
}

// Hàm cập nhật hiển thị giỏ hàng
function updateCartDisplay() {
    const cartContainer = document.querySelector('.cart-items');
    const totalAmount = document.getElementById('total-amount');
    if (!cartContainer || !totalAmount) return;

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <span>Giỏ hàng của bạn đang trống</span>
            </div>`;
        totalAmount.textContent = formatPrice(0);
        updateCartBadge();
        return;
    }

    cartContainer.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const itemPrice = parseInt(item.price.replace(/[^\d]/g, ''), 10);
        total += itemPrice * item.quantity;

        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='../assets/images/placeholder.png'">
            </div>
            <div class="item-details">
                <h3 class="item-name">${item.name}</h3>
                <p class="item-description">${item.description || 'Không có mô tả'}</p>
                <div class="item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn decrease-btn" data-action="decrease" data-index="${index}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn increase-btn" data-action="increase" data-index="${index}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="price">${formatPrice(itemPrice)}</div>
                    <button class="remove-btn" data-index="${index}">
                        <i class="fas fa-trash"></i> Xóa
                    </button>
                </div>
            </div>
        `;
        cartContainer.appendChild(itemElement);
    });

    totalAmount.textContent = formatPrice(total);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
}

// Xử lý các nút trong giỏ hàng (tăng/giảm/xóa)
function handleCartAction(e) {
    const button = e.target.closest('button');
    if (!button) return;

    const index = parseInt(button.dataset.index);
    if (isNaN(index)) return;

    const item = cart[index];
    if (!item) return;

    const marketItems = JSON.parse(localStorage.getItem('marketItems')) || {};
    let maxQuantity = 0;

    for (const category of Object.values(marketItems)) {
        if (category.items) {
            const product = category.items.find(p => p.id === item.id);
            if (product) {
                maxQuantity = product.quantity;
                break;
            }
        }
    }

    if (button.dataset.action === 'increase') {
        if (item.quantity < maxQuantity) {
            item.quantity++;
            updateCartDisplay();
        } else {
            alert(`Chỉ còn ${maxQuantity} sản phẩm trong kho!`);
        }
    } 
    else if (button.dataset.action === 'decrease') {
        if (item.quantity > 1) {
            item.quantity--;
            updateCartDisplay();
        }
    }
    else if (button.classList.contains('remove-btn')) {
        if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
            cart.splice(index, 1);
            updateCartDisplay();
        }
    }
}

// Hàm thanh toán
function checkout() {
    if (cart.length === 0) {
        alert('Giỏ hàng của bạn đang trống!');
        return;
    }

    const marketItems = JSON.parse(localStorage.getItem('marketItems')) || {};
    let canCheckout = true;

    cart.forEach(item => {
        let found = false;
        for (const category of Object.values(marketItems)) {
            if (category.items) {
                const product = category.items.find(p => p.id === item.id);
                if (product) {
                    found = true;
                    if (product.quantity < item.quantity) {
                        alert(`Sản phẩm "${item.name}" chỉ còn ${product.quantity} trong kho!`);
                        canCheckout = false;
                    }
                }
            }
        }
        if (!found) {
            alert(`Không tìm thấy sản phẩm "${item.name}" trong kho!`);
            canCheckout = false;
        }
    });

    if (!canCheckout) return;

    // Cập nhật số lượng trong kho
    cart.forEach(item => {
        for (const category of Object.values(marketItems)) {
            if (category.items) {
                const product = category.items.find(p => p.id === item.id);
                if (product) {
                    product.quantity -= item.quantity;
                }
            }
        }
    });

    localStorage.setItem('marketItems', JSON.stringify(marketItems));
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    updateCartBadge();
    alert('Cảm ơn bạn đã mua hàng!');
}

// Thêm sản phẩm vào giỏ hàng từ trang chi tiết
function addToCart() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        if (!productId) {
            alert('Không tìm thấy thông tin sản phẩm!');
            return;
        }

        const marketItems = JSON.parse(localStorage.getItem('marketItems')) || {};
        let product = null;

        for (const category of Object.values(marketItems)) {
            if (category.items) {
                product = category.items.find(item => item.id === productId);
                if (product) break;
            }
        }

        if (!product) {
            alert('Không tìm thấy thông tin sản phẩm!');
            return;
        }

        const quantityInput = document.getElementById('quantity');
        const quantity = parseInt(quantityInput?.value) || 1;

        if (quantity <= 0) {
            alert('Số lượng phải lớn hơn 0!');
            return;
        }

        if (quantity > product.quantity) {
            alert(`Chỉ còn ${product.quantity} sản phẩm trong kho!`);
            return;
        }

        const existingItemIndex = cart.findIndex(item => item.id === productId);
        if (existingItemIndex >= 0) {
            const newQuantity = cart[existingItemIndex].quantity + quantity;
            if (newQuantity > product.quantity) {
                alert(`Tổng số lượng trong giỏ hàng không thể vượt quá ${product.quantity}!`);
                return;
            }
            cart[existingItemIndex].quantity = newQuantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity,
                description: product.description
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
        alert('Đã thêm sản phẩm vào giỏ hàng!');
        window.location.href = 'cart.html';
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Có lỗi xảy ra khi thêm vào giỏ hàng. Vui lòng thử lại!');
    }
}

// Khởi tạo trang
function initializePage() {
    const cartItems = document.querySelector('.cart-items');
    if (cartItems) {
        cartItems.addEventListener('click', handleCartAction);
        updateCartDisplay();
    }

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkout);
    }

    updateCartBadge();
}

document.addEventListener('DOMContentLoaded', initializePage);

// Xuất ra global scope
window.addToCart = addToCart;
window.checkout = checkout;
window.handleCartAction = handleCartAction;
window.updateCartDisplay = updateCartDisplay;
window.updateCartBadge = updateCartBadge;
