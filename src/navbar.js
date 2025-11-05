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
        window.location.href = 'login.html';
    } else {
        // Đang ở index.html (thư mục gốc)
        window.location.href = 'pages/login.html';
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