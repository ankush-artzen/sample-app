console.log("🟢 [INIT] Sample Script Loaded");

document.addEventListener("click", function (e) {
  const btn = e.target.closest(".js-sample-btn");
  if (!btn) return;

  e.preventDefault();

  console.log("🟣 Theme sample button clicked");

  const modal = document.getElementById("sample-modal");
  if (!modal) {
    console.error("❌ Sample modal not found");
    return;
  }

  modal.style.display = "block";

  const customer = getCustomer();

  if (customer) {
    showSampleListing();
  } else {
    document.getElementById("customer_container").style.display = "block";
    document.getElementById("sample_container").style.display = "none";
    document.getElementById("checkout_button").style.display = "none";
  }
});

const SAMPLE_LIMIT = 3;

const APP_BASE =
  "https://merely-sticks-taste-tax.trycloudflare.com";
const API_BASE = `${APP_BASE}/api/sample`;
const CART_KEY = "sample_cart";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function setCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
const SHOP_NAME = window.Shopify?.shop || "";
const CUSTOMER_KEY = "sample_customer";

function getCustomer() {
  try {
    return JSON.parse(sessionStorage.getItem(CUSTOMER_KEY));
  } catch {
    return null;
  }
}

function setCustomer(data) {
  sessionStorage.setItem(CUSTOMER_KEY, JSON.stringify(data));
}

function updateCartAndSync(newCart) {
  setCart(newCart);

  // notify BOTH theme & app
  window.dispatchEvent(
    new CustomEvent("sample:cart-updated", {
      detail: newCart,
    }),
  );
}

function showSampleListing() {
  document.getElementById("customer_container").style.display = "none";
  document.getElementById("sample_container").style.display = "flex";
  document.getElementById("checkout_button").style.display = "flex";

  if (isProductPage()) {
    renderProductSelection();
  } else {
    renderSelectedSamples();
  }
}

let config = null;

/*
cart item shape:
{
  productId,
  variantId,
  title,
  image,
  price
}
*/
let cart = [];

try {
  cart = getCart();
  updateCartAndSync(cart);
} catch {
  cart = [];
}

console.log("🛒 Initial cart:", cart);

["shopify.css", "style.css"].forEach((file) => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `${APP_BASE}/css/${file}`;
  document.head.appendChild(link);
});

async function fetchConfig() {
  try {
    const res = await fetch(`${API_BASE}?action=config`);
    const data = await res.json();

    if (!data?.ok) return null;

    config = data;
    return data;
  } catch (e) {
    console.error("Config fetch failed", e);
    return null;
  }
}

function isProductPage() {
  return window.location.pathname.includes("/products/");
}

const STORE_BASE = window.location.origin;

async function fetchCurrentProduct() {
  const baseUrl = window.location.href.split("?")[0];
  const res = await fetch(`${baseUrl}.js`, { credentials: "same-origin" });
  return res.json();
}
function resolveProductImage(product, variantIndex = 0) {
  if (product.images && product.images.length > 0) {
    return product.images[variantIndex];
  }

  if (product.featured_image?.src) {
    return product.featured_image.src;
  }

  return "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png";
}

function createSampleButton() {
  const btn = document.createElement("button");
  btn.innerText = config.ui?.buttonText || "Get Sample";

  btn.style.position = "fixed";
  btn.style.bottom = "20px";
  btn.style.right = "20px";
  btn.style.zIndex = "9999";
  btn.style.padding = "12px 18px";
  btn.style.background = "#000";
  btn.style.color = "#fff";
  btn.style.borderRadius = "6px";
  btn.style.cursor = "pointer";

  btn.onclick = () => {
    const modal = document.getElementById("sample-modal");
    modal.style.display = "block";

    const customer = getCustomer();

    if (customer) {
      console.log("🟢 Existing customer found, skipping form");
      showSampleListing();
    } else {
      console.log("🔴 No customer found, showing form");
      document.getElementById("customer_container").style.display = "block";
      document.getElementById("sample_container").style.display = "none";
      document.getElementById("checkout_button").style.display = "none";
    }
  };

  document.body.appendChild(btn);
}

/* ---------------- MODAL ---------------- */

function createModal() {
  const modal = document.createElement("div");
  modal.id = "sample-modal";
  modal.className = "try_sample_modal";

  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>

      <h2 class="smrry-txt">Sample Products</h2>

      <!-- STEP 1: CUSTOMER -->
      <div id="customer_container">
        <label class="required">Name</label>
        <input id="name" class="form-control"/>

        <label class="required">Email</label>
        <input id="email" class="form-control"/>

        <button id="continue-btn" class="btn-primary">
          Continue
        </button>
      </div>

      <!-- STEP 2: PRODUCT SELECTION -->
      <div id="sample_container" style="display:none; flex-wrap:wrap;"></div>

      <div id="checkout_button" style="display:none">
        <button id="checkout-btn" class="btn-primary">
          Checkout
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector(".close").onclick = () => {
    modal.style.display = "none";
  };

  document.getElementById("continue-btn").onclick = validateCustomer;
  document.getElementById("checkout-btn").onclick = checkout;
}

// function validateCustomer() {
//   const name = document.getElementById("name").value.trim();
//   const email = document.getElementById("email").value.trim();

//   if (!name || !email) {
//     alert("Name & Email required");
//     return;
//   }

//   sessionStorage.setItem(
//     CUSTOMER_KEY,
//     JSON.stringify({ name, email })
//   );

//   console.log("🟢 Customer saved in session", { name, email });

//   showSampleListing();
// }
// Enhanced customer validation with better UX
async function validateCustomer() {
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();

  clearErrors();

  if (!name) {
    showError(nameInput, " user name required");
    return;
  }
  if (!email || !isValidEmail(email)) {
    showError(emailInput, "Valid email required");
    return;
  }

  // 🔴 CHECK SAMPLE STATUS FROM DB
  const res = await fetch(
    `${APP_BASE}/api/sample/status?email=${encodeURIComponent(email)}`,
  );
  const status = await res.json();

  if (!status.allowed) {
    alert(
      status.reason === "LIMIT_REACHED"
        ? "Sample limit reached for this email"
        : "You are blocked from ordering samples",
    );
    return;
  }

  setCustomer({ name, email, timestamp: Date.now() });
  showSampleListing();
}

function showError(input, message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;
  errorDiv.style.color = "#dc3545";
  errorDiv.style.fontSize = "0.875rem";
  errorDiv.style.marginTop = "-8px";
  errorDiv.style.marginBottom = "12px";

  input.style.borderColor = "#dc3545";
  input.parentNode.insertBefore(errorDiv, input.nextSibling);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function clearErrors() {
  document.querySelectorAll(".error-message").forEach((el) => el.remove());
  document.querySelectorAll(".form-control").forEach((input) => {
    input.style.borderColor = "";
  });
}
function renderSelectedSamples() {
  const container = document.getElementById("sample_container");
  const checkoutWrapper = document.getElementById("checkout_button");

  container.innerHTML = "";

  // ❌ No samples
  if (!cart.length) {
    container.innerHTML = `
      <div class="smry-dta empty-card">
        <div class="image-smry">
          <span style="font-size:48px;">📦</span>
        </div>
        <p class="item-title">No samples selected</p>
        <p class="per_col-size">Choose a sample to continue</p>
         <a 
        href="${STORE_BASE}/collections/all"; 
        class="btn-primary" 
        style="margin-top:12px; display:inline-block; text-decoration:none;"
      >
        Browse Products
      </a>
      </div>
    `;
    checkoutWrapper.style.display = "none";
    return;
  }

  // ✅ Samples exist
  checkoutWrapper.style.display = "flex";

  cart.forEach((item) => {
    const card = document.createElement("div");
    card.className = "smry-dta";

    card.innerHTML = `
      <div class="image-smry">
        <img src="${item.image}" />
      </div>
      <p class="item-title">${item.title}</p>
      <button class="btn-primary remove-btn">Remove</button>
    `;
    // <p class="price-iteam">${item.price}</p>

    card.querySelector(".remove-btn").onclick = () => {
      const updatedCart = cart.filter((c) => c.variantId !== item.variantId);
      updateCartAndSync(updatedCart);
    };

    container.appendChild(card);
  });
}

// async function renderProductSelection() {
//   const container = document.getElementById("sample_container");
//   container.innerHTML = "";

//   const product = await fetchCurrentProduct();

//   product.variants.forEach((variant) => {
//     const isSelected = cart.some(
//       (item) => item.variantId === variant.id
//     );

//     const card = document.createElement("div");
//     card.className = "smry-dta";

//     card.innerHTML = `
//       <div class="image-smry">
//         <img src="${product.featured_image}" />
//       </div>
//       <p class="item-title">${product.title}</p>
//       <p class="per_col-size">${variant.title}</p>
//       <p class="price-iteam">₹${config.store.amount}</p>
//       <button class="btn-primary">
//         ${isSelected ? "Remove" : "Add Sample"}
//       </button>
//     `;

//     card.querySelector("button").onclick = () =>
//       toggleSampleVariant(product, variant);

//     container.appendChild(card);
//   });
// }
async function renderProductSelection() {
  const container = document.getElementById("sample_container");
  container.innerHTML = "";

  const product = await fetchCurrentProduct();

  /* ===============================
     🔹 SELECTED SAMPLES (GLOBAL)
  =============================== */
  if (cart.length) {
    const selectedHeading = document.createElement("h4");
    selectedHeading.innerText = "Selected Samples";
    selectedHeading.style.width = "100%";
    container.appendChild(selectedHeading);

    cart.forEach((item) => {
      const card = document.createElement("div");
      card.className = "smry-dta";

      card.innerHTML = `
        <div class="image-smry">
          <img src="${item.image}" />
        </div>
        <p class="item-title">${item.title}</p>
        <p class="price-iteam">₹${item.price}</p>
        <button class="btn-primary remove-btn">Remove</button>
      `;

      card.querySelector(".remove-btn").onclick = () => {
        cart = cart.filter((c) => c.variantId !== item.variantId);
        updateCartAndSync(cart);
      };

      container.appendChild(card);
    });
  }

  /* ===============================
     🔹 AVAILABLE SAMPLES
     (ONLY if current product NOT selected)
  =============================== */
  const productAlreadySelected = cart.some(
    (item) => item.productId === product.id,
  );

  if (productAlreadySelected) {
    return;
  }

  const availableVariants = product.variants.filter(
    (variant) => !cart.some((item) => item.variantId === variant.id),
  );

  if (availableVariants.length) {
    const availableHeading = document.createElement("h4");
    availableHeading.innerText = "Available Samples";
    availableHeading.style.width = "100%";
    availableHeading.style.marginTop = "16px";
    container.appendChild(availableHeading);

    availableVariants.forEach((variant) => {
      container.appendChild(createSampleCard(product, variant));
    });
  }
}

function createSampleCard(product, variant) {
  const card = document.createElement("div");
  card.className = "smry-dta";

  card.innerHTML = `
    <div class="image-smry">
      <img src="${product.featured_image}" />
    </div>
    <p class="item-title">${product.title}</p>
    <p class="per_col-size">${variant.title}</p>
    <p class="price-iteam">₹${config.store.amount}</p>
    <button class="btn-primary">Add Sample</button>
  `;

  card.querySelector("button").onclick = () =>
    toggleSampleVariant(product, variant);

  return card;
}

/* ---------------- TOGGLE SAMPLE VARIANT  */

// function toggleSampleVariant(product, variant) {
//   let cart = getCart();

//   const index = cart.findIndex(
//     item => item.variantId === variant.id
//   );

//   if (index > -1) {
//     cart.splice(index, 1);
//   } else {
//     if (cart.length >= SAMPLE_LIMIT) {
//       alert("Sample limit reached");
//       return;
//     }

//     cart.push({
//       productId: product.id,
//       variantId: variant.id,
//       title: `${product.title} - ${variant.title}`,
//       image: product.featured_image,
//       price: "free"
//     });
//   }

//   updateCartAndSync(cart);
// }
// function toggleSampleVariant(product, variant) {
//   let cart = getCart();

//   // ❗ Check if this product already has a sample selected
//   const existingProductIndex = cart.findIndex(
//     item => item.productId === product.id
//   );

//   // If SAME variant clicked → remove (toggle off)
//   const sameVariantIndex = cart.findIndex(
//     item => item.variantId === variant.id
//   );

//   if (sameVariantIndex > -1) {
//     cart.splice(sameVariantIndex, 1);
//     updateCartAndSync(cart);
//     return;
//   }

//   // If another variant of SAME product exists → block
//   if (existingProductIndex > -1) {
//     alert("You can select only one sample per product");
//     return;
//   }

//   // Global sample limit check
//   if (cart.length >= SAMPLE_LIMIT) {
//     alert("Sample limit reached");
//     return;
//   }

//   // Add new sample
//   cart.push({
//     productId: product.id,
//     variantId: variant.id,
//     title: `${product.title} - ${variant.title}`,
//     image: product.featured_image,
//     price: "free"
//   });

//   updateCartAndSync(cart);
// }
function toggleSampleVariant(product, variant) {
  const sameVariantIndex = cart.findIndex(
    (item) => item.variantId === variant.id,
  );

  if (sameVariantIndex > -1) {
    cart.splice(sameVariantIndex, 1);
    updateCartAndSync(cart);
    return;
  }

  // If another variant of SAME product exists → block
  const existingProductIndex = cart.findIndex(
    (item) => item.productId === product.id,
  );

  if (existingProductIndex > -1) {
    alert("You can select only one sample per product");
    return;
  }

  // Global sample limit check
  if (cart.length >= SAMPLE_LIMIT) {
    alert("Sample limit reached");
    return;
  }

  // Add new sample
  cart.push({
    productId: product.id,
    variantId: variant.id,
    title: `${product.title} - ${variant.title}`,
    image: product.featured_image,
    price: "90% Discount",
  });

  updateCartAndSync(cart);
}
window.addEventListener("sample:cart-updated", (e) => {
  cart = e.detail;
  if (isProductPage()) {
    renderProductSelection();
  } else {
    renderSelectedSamples();
  }
});

/* ---------------- CHECKOUT ---------------- */

// async function checkout() {
//   if (!cart.length) {
//     alert("Please select at least one sample");
//     return;
//   }

//   try {
//     const res = await fetch(`${APP_BASE}/api/products/checkout`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         variantIds: cart.map(item => item.variantId),
//       }),
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       throw new Error(data.error || "Checkout failed");
//     }

//     window.location.href = data.checkoutUrl;
//   } catch (e) {
//     console.error("Checkout failed", e);
//     alert("Checkout failed. Please try again.");
//   }
// }
// async function checkout() {
//   if (!cart.length) {
//     alert("Please select at least one sample");
//     return;
//   }

//   const checkoutBtn = document.getElementById("checkout-btn");
//   const originalText = checkoutBtn.textContent;

//   try {
//     checkoutBtn.textContent = "Processing...";
//     checkoutBtn.disabled = true;

//     const res = await fetch(`${APP_BASE}/api/products/checkout`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         variantIds: cart.map(item => item.variantId),
//         customerEmail,
//       }),
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       throw new Error(data.error || "Checkout failed");
//     }

//     // Clear cart on successful checkout
//     sessionStorage.removeItem(CART_KEY);
//     window.location.href = data.checkoutUrl;

//   } catch (e) {
//     console.error("Checkout failed", e);
//     alert("Checkout failed. Please try again.");
//   } finally {
//     checkoutBtn.textContent = originalText;
//     checkoutBtn.disabled = false;
//   }
// }
async function checkout() {
  if (!cart.length) {
    alert("Please select at least one sample");
    return;
  }

  const customer = getCustomer(); // ✅ get stored customer
  const customerEmail = customer?.email;

  if (!customerEmail) {
    alert("Customer email missing. Please re-enter details.");
    return;
  }

  const checkoutBtn = document.getElementById("checkout-btn");
  checkoutBtn.disabled = true;
  checkoutBtn.textContent = "Processing...";

  try {
    const res = await fetch(`${APP_BASE}/api/products/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        variantIds: cart.map((item) => item.variantId),
        customerEmail,
      }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Checkout failed");

    window.location.href = data.checkoutUrl;
  } catch (err) {
    console.error(err);
    alert("Checkout failed");
  } finally {
    checkoutBtn.disabled = false;
    checkoutBtn.textContent = "Checkout";
  }
}

/* ---------------- INIT ---------------- */

(async function init() {
  const cfg = await fetchConfig();
  if (!cfg) return;

  createSampleButton();
  createModal();
})();
