/* script.js — Product data, UI interactions (modal, cart, search, filter) */

const products = [
  {
    id: 1, title: "Oak Bar Stool", category: "Chairs", price: 129.00,
    img: "images/Oak Bar Stool2.jpeg",
    desc: "Solid oak legs, foam padded seat, mid-century style."
  },
  {
    id: 2, title: "Luxe 3-Seater Sofa", category: "Sofas", price: 899.00,
    img: "images/Luxe 3-Seater Sofa.jpeg",
    desc: "Deep cushions and durable linen-blend upholstery."
  },
  {
    id: 3, title: "Copper Pendant Light", category: "Lighting", price: 199.00,
    img: "images/Copper Pendant Light.jpeg",
    desc: "Industrial pendant with warm glow."
  },
  {
    id: 4, title: "Comfort Armchair", category: "Chairs", price: 249.00,
    img: "images/Comfort Armchair.jpeg",
    desc: "Curved back design — perfect for reading corners."
  },
  {
    id: 5, title: "Scandi Nightstand", category: "Sofas", price: 149.00,
    img: "images/product5.jpg",
    desc: "Compact storage with clean lines."
  },
  {
    id: 6, title: "Modern Floor Lamp", category: "Lighting", price: 129.00,
    img: "images/product6.jpg",
    desc: "Slim profile floor lamp with LED bulb."
  }
];

let cart = [];

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const productsGrid = document.getElementById("productsGrid");
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const loadMore = document.getElementById("loadMore");
  const productModal = document.getElementById("productModal");
  const modalClose = document.getElementById("modalClose");
  const modalImage = document.getElementById("modalImage");
  const modalTitle = document.getElementById("modalTitle");
  const modalCategory = document.getElementById("modalCategory");
  const modalPrice = document.getElementById("modalPrice");
  const modalDescription = document.getElementById("modalDescription");
  const modalQty = document.getElementById("modalQty");
  const addToCartBtn = document.getElementById("addToCartBtn");
  const cartBtn = document.getElementById("cartBtn");
  const cartDrawer = document.getElementById("cartDrawer");
  const closeCart = document.getElementById("closeCart");
  const cartItems = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");
  const cartTotal = document.getElementById("cartTotal");
  const yearSpan = document.getElementById("year");

  yearSpan.textContent = new Date().getFullYear();

  // Render initial products
  let visibleProducts = 4;
  const renderProducts = (list) => {
    productsGrid.innerHTML = "";
    const slice = list.slice(0, visibleProducts);
    slice.forEach(p => {
      const card = document.createElement("article");
      card.className = "product";
      card.innerHTML = `
        <div class="thumb"><img src="${p.img}" alt="${escapeHtml(p.title)}" onerror="this.src='images/placeholder.png'"/></div>
        <h4>${escapeHtml(p.title)}</h4>
        <div class="muted">${escapeHtml(p.category)}</div>
        <div class="price">$${p.price.toFixed(2)}</div>
        <div class="card-actions">
          <button class="btn ghost" data-id="${p.id}" aria-label="View ${escapeHtml(p.title)}">View</button>
          <button class="btn primary" data-add="${p.id}">Add</button>
        </div>
      `;
      productsGrid.appendChild(card);
    });
  };

  // Initial call
  renderProducts(products);

  // Search & filter
  function filterAndRender() {
    const q = searchInput.value.trim().toLowerCase();
    const cat = categoryFilter.value;
    const filtered = products.filter(p => {
      const matchesQ = p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
      const matchesCat = !cat || p.category === cat;
      return matchesQ && matchesCat;
    });
    visibleProducts = Math.max(4, visibleProducts);
    renderProducts(filtered);
  }

  searchInput.addEventListener("input", () => {
    visibleProducts = 8;
    filterAndRender();
  });
  categoryFilter.addEventListener("change", () => {
    visibleProducts = 8;
    filterAndRender();
  });

  // Load more
  loadMore.addEventListener("click", () => {
    visibleProducts += 4;
    filterAndRender();
  });

  // Delegate product card clicks
  productsGrid.addEventListener("click", (e) => {
    const viewBtn = e.target.closest("[data-id]");
    const addBtn = e.target.closest("[data-add]");
    if (viewBtn) {
      const id = Number(viewBtn.getAttribute("data-id"));
      openModal(id);
    } else if (addBtn) {
      const id = Number(addBtn.getAttribute("data-add"));
      addToCartById(id, 1);
    }
  });

  // Modal open
  function openModal(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    modalImage.src = p.img;
    modalImage.onerror = () => modalImage.src = "images/placeholder.png";
    modalTitle.textContent = p.title;
    modalCategory.textContent = p.category;
    modalPrice.textContent = `$${p.price.toFixed(2)}`;
    modalDescription.textContent = p.desc;
    modalQty.value = 1;
    productModal.classList.add("show");
    productModal.setAttribute("aria-hidden", "false");
    addToCartBtn.dataset.id = id;
  }

  modalClose.addEventListener("click", closeModal);
  productModal.addEventListener("click", (e) => {
    if (e.target === productModal) closeModal();
  });
  function closeModal() {
    productModal.classList.remove("show");
    productModal.setAttribute("aria-hidden", "true");
  }

  // Add to cart from modal
  addToCartBtn.addEventListener("click", () => {
    const id = Number(addToCartBtn.dataset.id);
    const qty = Number(modalQty.value) || 1;
    addToCartById(id, qty);
    closeModal();
    openCart();
  });

  // Cart functions
  function addToCartById(id, qty = 1) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    const existing = cart.find(i => i.id === id);
    if (existing) existing.qty += qty;
    else cart.push({ ...p, qty });
    updateCartUI();
  }

  function updateCartUI() {
    if (cart.length === 0) {
      cartItems.innerHTML = "<p class='muted'>Your cart is empty.</p>";
    } else {
      cartItems.innerHTML = "";
      cart.forEach(item => {
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
          <img src="${item.img}" alt="${escapeHtml(item.title)}" onerror="this.src='images/placeholder.png'"/>
          <div style="flex:1">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <strong>${escapeHtml(item.title)}</strong>
              <span>$${(item.price * item.qty).toFixed(2)}</span>
            </div>
            <div class="muted">${escapeHtml(item.category)}</div>
            <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
              <input type="number" min="1" value="${item.qty}" data-update="${item.id}" style="width:66px;padding:6px;border-radius:8px;border:1px solid #e6eef0"/>
              <button class="btn ghost" data-remove="${item.id}">Remove</button>
            </div>
          </div>
        `;
        cartItems.appendChild(div);
      });
    }
    const total = cart.reduce((s, it) => s + it.price * it.qty, 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;
    cartCount.textContent = cart.reduce((s, it) => s + it.qty, 0);
  }

  // Cart drawer open/close
  cartBtn.addEventListener("click", openCart);
  closeCart.addEventListener("click", closeCartDrawer);

  function openCart() {
    cartDrawer.classList.add("open");
    cartDrawer.setAttribute("aria-hidden", "false");
  }
  function closeCartDrawer() {
    cartDrawer.classList.remove("open");
    cartDrawer.setAttribute("aria-hidden", "true");
  }

  // Delegate cart item changes
  cartItems.addEventListener("click", (e) => {
    const rem = e.target.closest("[data-remove]");
    if (rem) {
      const id = Number(rem.getAttribute("data-remove"));
      cart = cart.filter(i => i.id !== id);
      updateCartUI();
    }
  });
  cartItems.addEventListener("change", (e) => {
    const input = e.target.closest("input[data-update]");
    if (input) {
      const id = Number(input.getAttribute("data-update"));
      const qty = Math.max(1, Number(input.value) || 1);
      const it = cart.find(i => i.id === id);
      if (it) it.qty = qty;
      updateCartUI();
    }
  });

  // Close cart if clicked outside (optional)
  document.addEventListener("click", (e) => {
    if (!cartDrawer.classList.contains("open")) return;
    const inside = cartDrawer.contains(e.target) || cartBtn.contains(e.target);
    if (!inside) closeCartDrawer();
  });

  // Utility: escapeHtml to avoid XSS for this demo
  function escapeHtml(str){ return String(str).replace(/[&<>"']/g, (m)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[m])); }

  // Keyboard accessibility for modal/cart
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      closeCartDrawer();
    }
  });

  // Initialize small UI
  updateCartUI();

  // Mobile burger
  const burger = document.getElementById("burger");
  burger && burger.addEventListener("click", () => {
    const nav = document.getElementById("mainNav");
    if (!nav) return;
    nav.style.display = nav.style.display === "block" ? "" : "block";
  });

});
