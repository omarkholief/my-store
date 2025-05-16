// الوضع الليلي
const toggleBtn = document.getElementById("toggleMode");
const toggleBtnMobile = document.getElementById("toggleModeMobile");
const scrollBtn = document.getElementById("scrollTopBtn");

function updateIcon(isDark) {
  const icon = isDark ? "☀" : "🌙";
  toggleBtn.textContent = icon;
  toggleBtnMobile.textContent = icon;
}

function toggleDarkMode() {
  document.documentElement.classList.toggle("dark");
  const isDark = document.documentElement.classList.contains("dark");
  updateIcon(isDark);
}

toggleBtn.addEventListener("click", toggleDarkMode);
toggleBtnMobile.addEventListener("click", toggleDarkMode);
updateIcon(document.documentElement.classList.contains("dark"));

window.addEventListener("scroll", () => {
  scrollBtn.classList.toggle("hidden", window.scrollY <= 300);
});

scrollBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// نظام السلة
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  const cartCount = document.getElementById("cartCount");
  let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
}

function addProductToCart(product) {
  const existingProduct = cart.find((item) => item.id === product.id);
  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart();
  updateCartCount();
}

// عرض محتويات السلة
function renderCartItems() {
  const cartItemsContainer = document.getElementById("cartItems");
  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {
    cartItemsContainer.innerHTML =
      '<p class="text-center text-gray-600 dark:text-gray-300">السلة فارغة</p>';
    document.getElementById("cartTotal").textContent = "الإجمالي: 0 $";
    return;
  }

  let totalPrice = 0;

  cart.forEach((item) => {
    totalPrice += item.price * item.quantity;

    const itemDiv = document.createElement("div");
    itemDiv.className =
      "flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded p-3";

    itemDiv.innerHTML = `
                    <div class="flex flex-col">
                        <span class="font-semibold">${item.title}</span>
                        <span class="text-sm text-gray-600 dark:text-gray-300">${item.price} $ لكل وحدة</span>
                    </div>
                    <div class="flex items-center space-x-2 space-x-reverse">
                        <button class="bg-red-600 text-white rounded px-2 py-1 hover:bg-red-700 transition" title="حذف">✖</button>
                        <input type="number" min="1" value="${item.quantity}" class="w-16 text-center rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">
                    </div>
                `;

    // حذف المنتج من السلة
    itemDiv.querySelector("button").addEventListener("click", () => {
      cart = cart.filter((cartItem) => cartItem.id !== item.id);
      saveCart();
      updateCartCount();
      renderCartItems();
    });

    // تغيير الكمية
    const qtyInput = itemDiv.querySelector("input");
    qtyInput.addEventListener("change", (e) => {
      let newQty = parseInt(e.target.value);
      if (isNaN(newQty) || newQty < 1) {
        newQty = 1;
        e.target.value = 1;
      }
      item.quantity = newQty;
      saveCart();
      updateCartCount();
      renderCartItems();
    });

    cartItemsContainer.appendChild(itemDiv);
  });

  document.getElementById(
    "cartTotal"
  ).textContent = ` الإجمالي : ${totalPrice.toFixed(2)} $`;
}

// تحميل المنتجات وعرضها
async function fetchProducts() {
  const res = await fetch("https://fakestoreapi.com/products?limit=20");
  const products = await res.json();

  const container = document.getElementById("productsGrid");
  container.innerHTML = ""; // نفضي المحتوى الأولي

  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = `
                bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 flex flex-col
                transform transition duration-300 hover:scale-105 hover:shadow-xl
                `;

    productCard.innerHTML = `
                <img src="${product.image}" alt="${product.title}" class="h-48 object-contain mb-4" />
                <h3 class="text-lg font-semibold mb-2 line-clamp-2">${product.title}</h3>
                <p class="text-blue-600 font-bold mb-2">${product.price} $</p>
                <p class="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">${product.description}</p>
                <button class="mt-auto bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">أضف للسلة</button>
                <button class="buy-now bg-green-600 text-white m-2 py-2 rounded hover:bg-green-700 transition">شراء الآن</button>
                `;

    // حدث زر "أضف للسلة"
    const addToCartBtn = productCard.querySelector("button");
    addToCartBtn.addEventListener("click", () => {
      addProductToCart(product);
    });
    const buyNowBtn = productCard.querySelector(".buy-now");
    setupBuyNowButton(product, buyNowBtn);

    container.appendChild(productCard);
  });

  updateCartCount();
}

fetchProducts();

// فتح وإغلاق نافذة السلة
const cartButton = document.getElementById("cartButton");
const cartModal = document.getElementById("cartModal");
const closeCartBtn = document.getElementById("closeCartBtn");

cartButton.addEventListener("click", () => {
  renderCartItems();
  cartModal.classList.remove("hidden");
  cartModal.classList.add("flex");
});

closeCartBtn.addEventListener("click", () => {
  cartModal.classList.add("hidden");
  cartModal.classList.remove("flex");
});

const buyNowModal = document.getElementById("buyNowModal");
const closeBuyModal = document.getElementById("closeBuyModal");
const buyProductDetails = document.getElementById("buyProductDetails");
const purchaseForm = document.getElementById("purchaseForm");

// زر إلغاء الشراء
closeBuyModal.addEventListener("click", () => {
  buyNowModal.classList.add("hidden");
  buyNowModal.classList.remove("flex");
});

// عند تأكيد الطلب
purchaseForm.addEventListener("submit", (e) => {
  e.preventDefault();
  alert("تم إرسال طلبك بنجاح! ✅");
  buyNowModal.classList.add("hidden");
  buyNowModal.classList.remove("flex");
  purchaseForm.reset();
});

// حدث الشراء الآن
function setupBuyNowButton(product, btn) {
  btn.addEventListener("click", () => {
    buyProductDetails.innerHTML = `
            <p><strong>المنتج:</strong> ${product.title}</p>
            <p><strong>السعر:</strong> ${product.price} $</p>
        `;
    buyNowModal.classList.remove("hidden");
    buyNowModal.classList.add("flex");
  });
}

// إظهار السنة تلقائيًا
document.getElementById("year").textContent = new Date().getFullYear();

// دالة لتطبيق الوضع بناءً على القيمة المخزنة
function applyDarkMode(isDark) {
  if (isDark) {
    document.documentElement.classList.add("dark"); // لو تستخدم tailwind مع darkMode: 'class' الأفضل تستخدم html وليس body
  } else {
    document.documentElement.classList.remove("dark");
  }
}

// تحميل الحالة عند بداية الصفحة
window.addEventListener("DOMContentLoaded", () => {
  const darkModeStored = localStorage.getItem("darkMode") === "true";
  applyDarkMode(darkModeStored);
});

// التبديل عند الضغط على أي زر من أزرار الوضع الداكن
function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem("darkMode", isDark);
}

// ربط الأزرار بالحدث
document.getElementById("toggleMode").addEventListener("click", toggleDarkMode);
document
  .getElementById("toggleModeMobile")
  .addEventListener("click", toggleDarkMode);
