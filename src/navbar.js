// Đọc thông tin người dùng từ localStorage ngay khi load script
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Khi DOM đã sẵn sàng, hiển thị đúng trạng thái đăng nhập
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    updateCartBadge(); // THÊM: Cập nhật badge ngay khi load
});


// ===== SIDEBAR CONTROL =====

const openButton = document.getElementById('open-sidebar-button');
const navbar = document.getElementById('navbar');
const media = window.matchMedia("(width < 700px)");

media.addEventListener('change', (e) => updateNavbar(e));

function updateNavbar(e) {
    const isMobile = e.matches;
    console.log(isMobile);
    if (isMobile) {
        navbar.setAttribute('inert', '');
    } else {
        // desktop device
        navbar.removeAttribute('inert');
    }
}

function openSidebar() {
    navbar.classList.add('show');
    openButton.setAttribute('aria-expanded', 'true');
    navbar.removeAttribute('inert');
}

function closeSidebar() {
    navbar.classList.remove('show');
    openButton.setAttribute('aria-expanded', 'false');
    navbar.setAttribute('inert', '');
}

updateNavbar(media);


// ===== AUTHENTICATION CODE =====

// Kiểm tra trạng thái đăng nhập khi tải trang
function checkLoginStatus() {
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            currentUser = user;
            showAccountDropdown(user);
        } catch (e) {
            console.error('Error parsing user data:', e);
            showLoginButton();
        }
    } else {
        showLoginButton();
    }
}

// Hiển thị nút Login
function showLoginButton() {
    const loginLi = document.getElementById('loginLi');
    const accountLi = document.getElementById('accountLi');
    const cartLi = document.getElementById('cartLi');
    
    if (loginLi) loginLi.style.display = 'block';
    if (accountLi) accountLi.style.display = 'none';
    if (cartLi) cartLi.style.display = 'none';
}

// Hiển thị dropdown Account
function showAccountDropdown(user) {
    const loginLi = document.getElementById('loginLi');
    const accountLi = document.getElementById('accountLi');
    const cartLi = document.getElementById('cartLi');
    
    if (loginLi) loginLi.style.display = 'none';
    if (accountLi) accountLi.style.display = 'block';
    if (cartLi) cartLi.style.display = 'block';
    
    // Cập nhật thông tin user
    const userName = document.getElementById('userName');
    const dropdownUserName = document.getElementById('dropdownUserName');
    const dropdownUserEmail = document.getElementById('dropdownUserEmail');
    
    if (userName) userName.textContent = user.name;
    if (dropdownUserName) dropdownUserName.textContent = user.name;
    if (dropdownUserEmail) dropdownUserEmail.textContent = user.email;
}

// Xử lý khi click nút Login
function handleLogin(event) {
    event.preventDefault();
    
    // Đóng sidebar nếu đang ở mobile
    if (media.matches) {
        closeSidebar();
    }
    
    // KIỂM TRA xem đang ở trang nào
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('/pages/')) {
        // Đang ở trong thư mục pages (about, market, cart)
        window.location.href = 'auth.html';
    } else {
        // Đang ở index.html (thư mục gốc)
        window.location.href = 'pages/auth.html';
    }
}

// Xử lý đăng xuất
function handleLogout(event) {
    event.preventDefault();
    
    // Xóa thông tin user khỏi localStorage
    localStorage.removeItem('currentUser');
    currentUser = null;
    
    // Đóng dropdown nếu đang mở
    const dropdown = document.getElementById('dropdownMenu');
    if (dropdown) dropdown.classList.remove('show');
    
    // Đóng sidebar nếu đang ở mobile
    if (media.matches) {
        closeSidebar();
    }
    
    // Hiển thị lại nút Login
    showLoginButton();
    
    // KIỂM TRA xem đang ở trang nào
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('/pages/')) {
        // Đang ở trong thư mục pages
        window.location.href = '../index.html';
    } else {
        // Đang ở index.html
        window.location.href = 'index.html';
    }
}

// Toggle dropdown menu
function toggleDropdown(event) {
    event.preventDefault();
    const dropdown = document.getElementById('dropdownMenu');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Đóng dropdown khi click bên ngoài (chỉ trên desktop)
window.addEventListener('click', function(e) {
    const accountLink = document.querySelector('.account-link');
    const dropdown = document.getElementById('dropdownMenu');
    
    if (!media.matches && accountLink && dropdown) {
        if (!accountLink.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    }
});

// Đóng sidebar khi click vào link trong dropdown (mobile)
const dropdownLinks = document.querySelectorAll('.dropdown-menu a');
dropdownLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        if (!link.classList.contains('account-link') && !link.classList.contains('logout-link')) {
            if (media.matches) {
                closeSidebar();
            }
        }
    });
});


// ===== CART BADGE - CHẠY Ở TẤT CẢ TRANG =====

// Cập nhật số lượng badge giỏ hàng
function updateCartBadge() {
    const cartBadge = document.getElementById('cartBadge');
    if (cartBadge) {
        // Lấy số lượng từ localStorage
        const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
        const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
        
        // Cập nhật text
        cartBadge.textContent = totalItems;
        
        // Thêm/xóa class 'empty'
        if (totalItems === 0) {
            cartBadge.classList.add('empty');
        } else {
            cartBadge.classList.remove('empty');
        }
    }
}

// Lắng nghe thay đổi giỏ hàng từ các tab khác
window.addEventListener('storage', function(e) {
    if (e.key === 'cart') {
        updateCartBadge();
    }
});

// Export để cart.js và các file khác có thể gọi
window.updateCartBadge = updateCartBadge;


/* ================================== */
/* === THÊM MỚI: LOGIC GIỎ HÀNG POPUP === */
/* ================================== */

// 1. TẠO HTML CHO POPUP KHI TẢI TRANG
function createCartPopupHTML() {
    const popupHTML = `
    <div class="cart-popup-overlay" id="cartPopupOverlay">
        <div class="cart-popup-content">
            <div class="cart-popup-header">
                <h2>Giỏ hàng</h2>
                <button class="cart-popup-close" id="cartPopupClose" aria-label="Đóng giỏ hàng">&times;</button>
            </div>
            <div class="cart-popup-items" id="cartPopupItems">
                </div>
            <div class="cart-popup-footer">
                <div class="cart-popup-total">
                    <span>Tổng cộng:</span>
                    <span id="cartPopupTotal">$0.00</span>
                </div>
                <button class="cart-popup-checkout" id="cartPopupCheckout">Thanh toán</button>
            </div>
        </div>
    </div>
    <div class="toast-notification" id="cartToast"></div>
    `;
    document.body.insertAdjacentHTML('beforeend', popupHTML);
}

// 2. CÁC HÀM XỬ LÝ POPUP
// Mở popup
window.showCartPopup = function() {
    renderCartPopup(); // Cập nhật nội dung trước khi hiển thị
    document.getElementById('cartPopupOverlay').classList.add('visible');
}

// Đóng popup
window.hideCartPopup = function() {
    document.getElementById('cartPopupOverlay').classList.remove('visible');
}

// 3. CÁC HÀM XỬ LÝ DỮ LIỆU GIỎ HÀNG (LocalStorage)
function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    window.updateCartBadge(); // Gọi hàm update badge đã có sẵn
}

// 4. HÀM TOÀN CỤC ĐỂ THÊM SẢN PHẨM (marketController.js sẽ gọi hàm này)
window.addToCart = function(itemData) {
    let cart = getCart();
    
    // Chuẩn hóa giá (vì admin.js lưu là "$45" còn market.js lưu là "45")
    const priceString = String(itemData.price || '0');
    const price = parseFloat(priceString.replace('$', ''));

    if (isNaN(price)) {
        console.error("Lỗi giá sản phẩm:", itemData.price);
        return;
    }

    const existingItem = cart.find(item => String(item.id) === String(itemData.id));
    const maxStock = itemData.maxQuantity || 0;

    if (existingItem) {
        // Đã có, tăng số lượng
        if (existingItem.quantity < maxStock) {
            existingItem.quantity++;
            showToast('Cập nhật số lượng trong giỏ!');
        } else {
            showToast('Đã đạt số lượng tồn kho tối đa!', true);
            return;
        }
    } else {
        // Chưa có, thêm mới
        if (maxStock > 0) {
            cart.push({
                id: itemData.id,
                name: itemData.name,
                price: price,
                image: itemData.image,
                quantity: 1,
                maxQuantity: maxStock
            });
            showToast('Đã thêm vào giỏ hàng!');
        } else {
            showToast('Sản phẩm đã hết hàng!', true);
            return;
        }
    }
    
    saveCart(cart);
}

// 5. HIỂN THỊ DỮ LIỆU LÊN POPUP
function renderCartPopup() {
    const cart = getCart();
    const itemsContainer = document.getElementById('cartPopupItems');
    const totalEl = document.getElementById('cartPopupTotal');
    let subtotal = 0;

    if (cart.length === 0) {
        itemsContainer.innerHTML = '<p class="cart-popup-empty">Giỏ hàng của bạn đang trống.</p>';
        totalEl.textContent = '$0.00';
        return;
    }

    itemsContainer.innerHTML = ''; // Xóa nội dung cũ
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        // Sửa đường dẫn ảnh (giống logic của cart.js)
        const imageUrl = item.image.startsWith('http') 
            ? item.image 
            : item.image.startsWith('../') 
                ? item.image 
                : '../' + item.image; // Giả sử đang ở thư mục pages/

        const itemEl = document.createElement('div');
        itemEl.classList.add('cart-popup-item');
        itemEl.innerHTML = `
            <img src="${imageUrl}" alt="${item.name}">
            <div class="cart-popup-item-details">
                <h3>${item.name}</h3>
                <p class="cart-popup-item-price">$${item.price.toFixed(2)}</p>
            </div>
            <div class="cart-popup-item-actions">
                <input type="number" class="cart-popup-quantity" value="${item.quantity}" min="1" max="${item.maxQuantity}" data-id="${item.id}">
                <button class="cart-popup-remove" data-id="${item.id}" aria-label="Xóa">&times;</button>
            </div>
        `;
        itemsContainer.appendChild(itemEl);
    });

    totalEl.textContent = `$${subtotal.toFixed(2)}`;
}

// 6. HÀM THANH TOÁN (LIÊN KẾT VỚI ADMIN)
function handleCheckout() {
    const cart = getCart();
    // Lấy user hiện tại (đã có trong file navbar.js)
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    
    if (!currentUser) {
        alert("Vui lòng đăng nhập để thanh toán!");
        // Gọi hàm login đã có sẵn
        handleLogin(new Event('click')); // Tạo một event giả
        return;
    }
    
    if (cart.length === 0) {
        alert("Giỏ hàng của bạn đang trống!");
        return;
    }
    
    // ĐỌC DANH SÁCH ĐƠN HÀNG TỪ LOCALSTORAGE (MÀ admin.js SỬ DỤNG)
    let customerOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');

    // Tính tổng tiền
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Chuẩn bị sản phẩm cho đơn hàng
    const orderProducts = cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: `$${item.price.toFixed(2)}` // Lưu giá tại thời điểm mua
    }));
    
    // Tạo đơn hàng mới
    const newOrder = {
        id: "DH-" + Date.now(),
        orderDate: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
        customerName: currentUser.username, // Lấy username từ user đăng nhập
        totalAmount: `$${totalAmount.toFixed(2)}`,
        status: "pending", // Trạng thái mặc định
        products: orderProducts
    };

    // THÊM ĐƠN HÀNG MỚI VÀO DANH SÁCH
    customerOrders.push(newOrder);
    
    // LƯU LẠI DANH SÁCH ĐƠN HÀNG VÀO LOCALSTORAGE
    localStorage.setItem('customerOrders', JSON.stringify(customerOrders));
    
    // Xóa giỏ hàng sau khi thanh toán
    saveCart([]); // Lưu giỏ hàng rỗng
    
    // Thông báo và đóng popup
    alert("Đặt hàng thành công! Đơn hàng của bạn đã được gửi đến quản trị viên.");
    renderCartPopup(); // Cập nhật lại popup (sẽ rỗng)
    hideCartPopup();
}

// 7. HÀM HIỂN THỊ THÔNG BÁO "TOAST"
function showToast(message, isError = false) {
    const toast = document.getElementById('cartToast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.style.backgroundColor = isError ? '#dc3545' : '#4CAF50';
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000); // Ẩn sau 2 giây
}

// 8. LẮNG NGHE SỰ KIỆN KHI TẢI TRANG
document.addEventListener('DOMContentLoaded', () => {
    // Tạo HTML
    createCartPopupHTML();

    // Gắn sự kiện cho các nút trong popup
    const cartPopupOverlay = document.getElementById('cartPopupOverlay');
    
    cartPopupOverlay.addEventListener('click', (e) => {
        // Đóng khi click nút close
        if (e.target.id === 'cartPopupClose') {
            hideCartPopup();
        }
        
        // Đóng khi click ra ngoài (vào overlay)
        if (e.target.id === 'cartPopupOverlay') {
            hideCartPopup();
        }

        // Click nút Xóa
        if (e.target.classList.contains('cart-popup-remove')) {
            const id = e.target.dataset.id;
            let cart = getCart();
            cart = cart.filter(item => String(item.id) !== String(id));
            saveCart(cart);
            renderCartPopup(); // Cập nhật lại
        }
        
        // Click nút Thanh toán
        if (e.target.id === 'cartPopupCheckout') {
            handleCheckout();
        }
    });

    // Cập nhật số lượng
    const itemsContainer = document.getElementById('cartPopupItems');
    itemsContainer.addEventListener('change', (e) => {
        if (e.target.classList.contains('cart-popup-quantity')) {
            const id = e.target.dataset.id;
            let newQuantity = parseInt(e.target.value);
            const max = parseInt(e.target.max);

            if (newQuantity > max) {
                newQuantity = max;
                e.target.value = max;
                showToast('Vượt quá số lượng tồn kho!', true);
            } else if (newQuantity < 1) {
                newQuantity = 1;
                e.target.value = 1;
            }
            
            let cart = getCart();
            const item = cart.find(i => String(i.id) === String(id));
            if (item) {
                item.quantity = newQuantity;
                saveCart(cart);
                renderCartPopup(); // Cập nhật lại
            }
        }
    });

    // Lắng nghe click vào link "Giỏ hàng" trên navbar
    const cartNavLink = document.querySelector('#cartLi a.cart-link');
    if (cartNavLink) {
        cartNavLink.addEventListener('click', (e) => {
            e.preventDefault(); // Ngăn chuyển trang
            window.showCartPopup();
        });
    }
});

/* ================================== */
/* === THÊM MỚI: LOGIC LỊCH SỬ MUA HÀNG === */
/* ================================== */

// 1. TẠO HTML CHO POPUP LỊCH SỬ
function createHistoryPopupHTML() {
    const popupHTML = `
    <div class="history-popup-overlay" id="historyPopupOverlay">
        <div class="history-popup-content">
            <div class="history-popup-header">
                <h2>Lịch sử mua hàng</h2>
                <button class="history-popup-close" id="historyPopupClose" aria-label="Đóng lịch sử">&times;</button>
            </div>
            <div class="history-popup-items" id="historyPopupItems">
                </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', popupHTML);
}

// 2. CÁC HÀM XỬ LÝ POPUP
function showHistoryPopup() {
    renderHistoryPopup(); // Cập nhật nội dung trước khi hiển thị
    document.getElementById('historyPopupOverlay').classList.add('visible');
}

function hideHistoryPopup() {
    document.getElementById('historyPopupOverlay').classList.remove('visible');
}

// 3. HÀM LẤY VÀ HIỂN THỊ LỊCH SỬ ĐƠN HÀNG
function renderHistoryPopup() {
    const itemsContainer = document.getElementById('historyPopupItems');
    
    // Lấy user hiện tại (biến 'currentUser' đã có ở đầu file navbar.js)
    if (!currentUser) {
        itemsContainer.innerHTML = '<p class="history-popup-empty">Vui lòng đăng nhập để xem lịch sử.</p>';
        return;
    }
    
    // Đọc danh sách đơn hàng từ localStorage (nơi admin.js cũng đọc)
    const allOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    
    // Lọc ra các đơn hàng của user này
    const myOrders = allOrders.filter(order => order.customerName === currentUser.username);
    
    if (myOrders.length === 0) {
        itemsContainer.innerHTML = '<p class="history-popup-empty">Bạn chưa có đơn hàng nào.</p>';
        return;
    }

    // Đảo ngược mảng để đơn hàng mới nhất lên trên
    myOrders.reverse();
    
    itemsContainer.innerHTML = ''; // Xóa nội dung cũ
    
    myOrders.forEach(order => {
        // Lấy text trạng thái
        let statusText = "Chờ xử lý";
        switch (order.status) {
            case "processing": statusText = "Đang giao"; break;
            case "completed": statusText = "Hoàn thành"; break;
            case "cancelled": statusText = "Đã hủy"; break;
        }

        // Tạo HTML cho danh sách sản phẩm
        const productsHTML = order.products.map(p => `
            <div class="history-product-item">
                <span class="history-product-name">${p.name}</span>
                <span class="history-product-qty">x${p.quantity}</span>
                <span class="history-product-price">${p.price}</span>
            </div>
        `).join('');

        // Tạo HTML cho toàn bộ đơn hàng
        const orderEl = document.createElement('div');
        orderEl.classList.add('history-order-item');
        orderEl.innerHTML = `
            <div class="history-order-header">
                <div>
                    <strong>Mã đơn: ${order.id}</strong>
                    <span>(${order.orderDate})</span>
                </div>
                <span class="history-order-status" data-status="${order.status}">
                    ${statusText}
                </span>
            </div>
            <div class="history-order-body">
                ${productsHTML}
                <hr style="border-color: #555; margin: 10px 0;">
                <div class="history-product-item" style="font-weight: bold; font-size: 1.1em; color: white;">
                    <span>Tổng cộng:</span>
                    <span></span>
                    <span style="text-align: right;">${order.totalAmount}</span>
                </div>
            </div>
        `;
        itemsContainer.appendChild(orderEl);
    });
}


// 4. LẮNG NGHE SỰ KIỆN KHI TẢI TRANG (NỐI TIẾP)
// Sửa sự kiện DOMContentLoaded đã có
document.addEventListener('DOMContentLoaded', () => {
    // (Các code cũ của giỏ hàng...)

    // === PHẦN THÊM MỚI BẮT ĐẦU TỪ ĐÂY ===
    
    // Tạo HTML cho popup lịch sử
    createHistoryPopupHTML();

    // Gắn sự kiện cho nút đóng popup lịch sử
    const historyPopupOverlay = document.getElementById('historyPopupOverlay');
    historyPopupOverlay.addEventListener('click', (e) => {
        if (e.target.id === 'historyPopupClose' || e.target.id === 'historyPopupOverlay') {
            hideHistoryPopup();
        }
    });

    // Lắng nghe click vào link "Lịch sử mua hàng" trên navbar
    const historyLink = document.querySelector('a[href="#purchase-history"]');
    if (historyLink) {
        historyLink.addEventListener('click', (e) => {
            e.preventDefault(); // Ngăn hành vi mặc định
            
            // Đóng dropdown tài khoản
            const dropdown = document.getElementById('dropdownMenu');
            if (dropdown) dropdown.classList.remove('show');
            
            // Mở popup lịch sử
            showHistoryPopup();
        });
    }
});