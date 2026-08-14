// ---------------- Shared product data ----------------
const PRODUCTS = [
  { name: "Organic Tomato", price: 80, rating: 4.8, img: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80" },
  { name: "Cucumber",       price: 60, rating: 4.6, img: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=300&q=80" },
  { name: "Potato",         price: 40, rating: 4.7, img: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=300&q=80" },
  { name: "Carrot",         price: 70, rating: 4.6, img: "https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=300&q=80" },
];

function heartIcon() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5 5 0 0 0-7.1 0L12 6.3l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 20.3l8.8-8.6a5 5 0 0 0 0-7.1Z"/></svg>`;
}
function cartIcon() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L22 7H6"/></svg>`;
}

function renderProductGrid(containerId, items) {
  const grid = document.getElementById(containerId);
  if (!grid) return;
  grid.innerHTML = items.map(p => `
    <div class="product-card">
      <div class="thumb">
        <img src="${p.img}" alt="${p.name}">
        <span class="fav">${heartIcon()}</span>
      </div>
      <div class="info">
        <p class="name">${p.name}</p>
        <div class="row">
          <span class="price">Rs. ${p.price} / kg</span>
          <span class="rating">★ ${p.rating}</span>
        </div>
        <button class="btn btn-primary btn-full add-cart-btn">${cartIcon()} Add to Cart</button>
      </div>
    </div>
  `).join("");
}

// ---------------- Cart counter (shared across product grids) ----------------
function wireCartButtons() {
  document.body.addEventListener("click", (e) => {
    if (e.target.closest(".add-cart-btn") || e.target.id === "addToCartBtn") {
      const badge = document.getElementById("cartCount") || document.querySelector(".badge");
      if (badge) badge.textContent = (parseInt(badge.textContent || "0", 10) + 1).toString();
      const btn = e.target.closest("button");
      if (btn) {
        const original = btn.innerHTML;
        btn.textContent = "Added ✓";
        setTimeout(() => (btn.innerHTML = original), 1000);
      }
    }
  });
}

// ---------------- Login page ----------------
function wireLoginPage() {
  const form = document.getElementById("loginForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    window.location.href = "dashboard.html";
  });
  const toggle = document.getElementById("togglePw");
  const pw = document.getElementById("password");
  if (toggle && pw) {
    toggle.addEventListener("click", () => {
      pw.type = pw.type === "password" ? "text" : "password";
    });
  }
}

// ---------------- Product detail page ----------------
function wireProductPage() {
  const qtyVal = document.getElementById("qtyVal");
  if (!qtyVal) return;
  let qty = 1;
  document.getElementById("qtyPlus").addEventListener("click", () => {
    qty++;
    qtyVal.textContent = `${qty} kg`;
  });
  document.getElementById("qtyMinus").addEventListener("click", () => {
    qty = Math.max(1, qty - 1);
    qtyVal.textContent = `${qty} kg`;
  });

  const mainImg = document.getElementById("mainImg");
  document.querySelectorAll("#thumbRow img").forEach(t => {
    t.addEventListener("click", () => {
      mainImg.src = t.src;
      document.querySelectorAll("#thumbRow img").forEach(i => i.classList.remove("active"));
      t.classList.add("active");
    });
  });

  renderProductGrid("relatedGrid", PRODUCTS);
}

// ---------------- Init ----------------
document.addEventListener("DOMContentLoaded", () => {
  wireCartButtons();
  wireLoginPage();
  wireProductPage();
  renderProductGrid("productGrid", PRODUCTS);
});
