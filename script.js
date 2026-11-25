const TAX_RATE = 0.05; 

const menu = [
  { id: 1, name: "Veg Sandwich",      price: 40,  category: "Breakfast", image: "images/veg_sandwich.jpeg",      inStock: true,  veg: true  },
  { id: 2, name: "Paneer Paratha",    price: 50,  category: "Breakfast", image: "images/paneer_paratha.jpeg",    inStock: true,  veg: true  },
  { id: 3, name: "Chicken Rice Bowl", price: 180, category: "Lunch",     image: "images/chicken_rice_bowl.jpeg", inStock: true,  veg: false },
  { id: 4, name: "Veg Noodles",       price: 80,  category: "Lunch",     image: "images/veg_noodles.jpeg",       inStock: true,  veg: true  },
  { id: 5, name: "Masala Omelette",   price: 60,  category: "Breakfast", image: "images/omelette.jpeg",   inStock: true,  veg: false },
  { id: 6, name: "Idli Sambar",       price: 70,  category: "Breakfast", image: "images/idli_sambar.jpeg",       inStock: true,  veg: true  },
  { id: 7, name: "French Fries",      price: 50,  category: "Snacks",    image: "images/french_fries.jpeg",      inStock: true,  veg: true  },
  { id: 8, name: "Cold Coffee",       price: 80,  category: "Beverages", image: "images/cold_coffee.jpeg",       inStock: true,  veg: true  }
];
const categories = ["All", "Breakfast", "Lunch", "Snacks", "Beverages"];

const timeSlots = ["10:30 – 10:45 AM", "12:30 – 12:45 PM", "2:00 – 2:15 PM", "3:30 – 3:45 PM"];
let cart = [];              
let activeCategory = "All";
let selectedSlot = null;

function money(amount) {
  return "₹" + amount.toFixed(2).replace(".00", "");
}

function findFood(id) {
  return menu.find(function (item) { return item.id === id; });
}

function showPage(pageId) {
  ["menuPage", "pickupPage", "confirmPage"].forEach(function (id) {
    document.getElementById(id).classList.add("hidden");
  });
  document.getElementById(pageId).classList.remove("hidden");
  window.scrollTo(0, 0);
}

function renderFilters() {
  let html = "";
  categories.forEach(function (cat) {
    const activeClass = cat === activeCategory ? "active" : "";
    html += `<button class="${activeClass}" onclick="setCategory('${cat}')">${cat}</button>`;
  });
  document.getElementById("filters").innerHTML = html;
}

function setCategory(cat) {
  activeCategory = cat;
  renderFilters();
  renderMenu();
}

function renderMenu() {
  let html = "";
  menu.forEach(function (food) {
    if (activeCategory !== "All" && food.category !== activeCategory) return;

    const tag = food.inStock
      ? '<span class="tag in">In Stock</span>'
      : '<span class="tag out">Sold Out</span>';
    const button = food.inStock
      ? `<button class="btn small" onclick="addToCart(${food.id})">Add to Cart</button>`
      : '<button class="btn small" disabled>Unavailable</button>';

    const vegBadge = food.veg
      ? '<span class="veg-badge veg"> Veg</span>'
      : '<span class="veg-badge nonveg"> Non-Veg</span>';

    html += `
      <div class="card">
        <div class="pic"><img src="${food.image}" alt="${food.name}"></div>
        <h4>${food.name}</h4>
        ${vegBadge}
        <p class="price">${money(food.price)}</p>
        ${tag}
        ${button}
      </div>`;
  });
  document.getElementById("menuGrid").innerHTML = html;
}

function addToCart(id) {
  const existing = cart.find(function (item) { return item.id === id; });
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id: id, qty: 1 });
  }
  renderCart();
}

function changeQty(id, change) {
  const item = cart.find(function (i) { return i.id === id; });
  item.qty += change;
  if (item.qty <= 0) removeItem(id);
  else renderCart();
}

function removeItem(id) {
  cart = cart.filter(function (item) { return item.id !== id; });
  renderCart();
}

function clearCart() {
  cart = [];
  renderCart();
}

function calculateTotals() {
  let subtotal = 0;
  cart.forEach(function (item) {
    subtotal += findFood(item.id).price * item.qty;
  });
  const tax = subtotal * TAX_RATE;
  return { subtotal: subtotal, tax: tax, total: subtotal + tax };
}

function renderCart() {
  let html = "";
  let count = 0;

  if (cart.length === 0) {
    html = '<p class="empty">Your cart is empty. Add something tasty!</p>';
  }

  cart.forEach(function (item) {
    const food = findFood(item.id);
    count += item.qty;
    html += `
      <div class="cart-item">
        <img class="cart-img" src="${food.image}" alt="${food.name}">
        <div>
          <b>${food.name}</b><br>
          <small>${money(food.price)} × ${item.qty}</small>
          <div class="qty">
            <button onclick="changeQty(${food.id}, -1)">−</button>
            <span>${item.qty}</span>
            <button onclick="changeQty(${food.id}, 1)">+</button>
          </div>
        </div>
        <div>
          <b>${money(food.price * item.qty)}</b><br>
          <button class="icon-btn" onclick="removeItem(${food.id})" title="Remove">🗑</button>
        </div>
      </div>`;
  });

  const t = calculateTotals();
  document.getElementById("cartItems").innerHTML = html;
  document.getElementById("subtotal").textContent = money(t.subtotal);
  document.getElementById("tax").textContent = money(t.tax);
  document.getElementById("total").textContent = money(t.total);
  document.getElementById("cartCount").textContent = count;
  document.getElementById("cartTitleCount").textContent = count;
}

function goToPickup() {
  if (cart.length === 0) {
    document.getElementById("cartMsg").textContent = "Your cart is empty. Add at least one item first.";
    return;
  }
  document.getElementById("cartMsg").textContent = "Select a pickup time to place your order.";
  selectedSlot = null;
  document.getElementById("pickupError").textContent = "";
  renderSlots();
  document.getElementById("pickupSummary").innerHTML = summaryHTML();
  showPage("pickupPage");
}

function renderSlots() {
  let html = "";
  timeSlots.forEach(function (slot) {
    const selectedClass = slot === selectedSlot ? "selected" : "";
    html += `<button class="slot ${selectedClass}" onclick="selectSlot('${slot}')">
               ${slot}<small>(Available)</small></button>`;
  });
  document.getElementById("slotsBox").innerHTML = html;
}

function selectSlot(slot) {
  selectedSlot = slot;
  document.getElementById("pickupError").textContent = "";
  renderSlots();
}

function itemLinesHTML() {
  let html = "";
  cart.forEach(function (item) {
    const food = findFood(item.id);
    html += `<div class="line"><span><img class="mini-img" src="${food.image}" alt=""> ${food.name} × ${item.qty}</span>
             <span>${money(food.price * item.qty)}</span></div>`;
  });
  return html;
}

function summaryHTML() {
  const t = calculateTotals();
  let html = itemLinesHTML();
  html += `<div class="line"><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
           <div class="line"><span>Tax (5%)</span><span>${money(t.tax)}</span></div>
           <p class="grand"><span>Total</span><span>${money(t.total)}</span></p>`;
  return html;
}

function confirmOrder() {
  if (selectedSlot === null) {
    document.getElementById("pickupError").textContent = "Please select a pickup time before confirming.";
    return;
  }

  const orderNumber = Math.floor(100000 + Math.random() * 900000); // random 6-digit number
  document.getElementById("orderId").textContent = orderNumber;
  document.getElementById("orderTime").textContent = selectedSlot;
  document.getElementById("confirmItems").innerHTML = itemLinesHTML();
  document.getElementById("orderTotal").textContent = money(calculateTotals().total);

  showPage("confirmPage");
}

function startNewOrder() {
  cart = [];
  selectedSlot = null;
  renderCart();
  showPage("menuPage");
}

renderFilters();
renderMenu();
renderCart();
