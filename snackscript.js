

   // i forgot to add # to the id, thus gave null at first -- use same for all querySelector in code
const currentYear = document.querySelector('#current_year');
currentYear.textContent = new Date().getFullYear();


      // used raw.github and also directly from image path --- 2 diff ways to load images for testing purposes
      // also redo with node.js later -- for now this helps with CORS bypass
const productOnHomepage = [
    { id: 1, name: "Classic Chinchin", price: 1000, description: "Crunchy bite of pure delight.", image: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=500&auto=format&fit=crop&q=60" },
    { id: 2, name: "Brown Latte Chinchin", price: 2500, description: "Latte style and flavour in all aspects.", image: "images/lattechin.png" },
    { id: 3, name: "Traditional Naija Rev Chinchin", price: 750, description: "Traditional light cocoa red cake topped with a decadent, smooth reverse.", image: "https://raw.githubusercontent.com/Wincc88/lolachinchin/main/images/butterchin.png?raw=true" },
    { id: 4, name: "Western Sunburst Chinchin", price: 2000, description: "Brings out the sunny side.", image: "images/containerchin.jpg" },
    { id: 5, name: "Coconut burst", price: 900, description: "Caramel core chinchin topped with a coconut drizzle.", image: "images/pouchchin.jpg" },
    { id: 6, name: "Na our own oo", price: 1100, description: "Our own unique creation without any compromise.", image: "images/crunchychin.png" }
];

// --- Mock Cloud Storage Storage Handler Engine ---
const CloudStorageMock = { 
     
         // make all object methods here i.e inside cloudstoragemock obj literal {}

      // default onload products -- ALWAYS the 6 on productOnHomepage

              /*getProducts: function() {  
                   use getProducts() is cleaner
              */
         
    getProducts() {
        const products = localStorage.getItem('cloud_products');

        if (!products) {
            localStorage.setItem('cloud_products', JSON.stringify(productOnHomepage));
               //console.log('cloud_products', JSON.stringify(productOnHomepage));
            return productOnHomepage;
        }
           //console.log("☁️ Data successfully retrieved from Mock Cloud DB logs:", JSON.parse(products)); 
        return JSON.parse(products);
    },

       // Retrieve cart contents from localStorage or initialize empty cart -- null if no previous session exists, otherwise returns previously saved cart contents
         // getCart: function() {
    getCart() {
        let cart = localStorage.getItem('cloud_cart');
          // console.log("☁️ Data successfully retrieved from Mock Cloud DB logs:", JSON.parse(cart)); 
        if (cart) {
            return JSON.parse(cart);
        } else {
            return [];
        }
    },

        //saveCart: function(cartData) {
    saveCart(cartData) {
        localStorage.setItem('cloud_cart', JSON.stringify(cartData));
        // console.log("☁️ Data successfully captured on Mock Cloud DB logs:", cartData);
    },

    saveOrder(orderPayload) {
        const currentOrders = localStorage.getItem('cloud_orders');
        const orderList = currentOrders ? JSON.parse(currentOrders) : [];
        orderList.push(orderPayload);
        localStorage.setItem('cloud_orders', JSON.stringify(orderList));

        // when order is placed thank you meassage shows with order id info and form cleared
        // console.log("☁️ Data successfully captured on Mock Cloud DB logs :", orderPayload);
    },

    resetDatabase() {
        localStorage.removeItem('cloud_products');
        localStorage.removeItem('cloud_cart');
        localStorage.removeItem('cloud_orders');
        location.reload();  // window.location.reload is redundant
    }
};

// --- App State Configuration Variables ---
let cachedProducts = [];
let cart = [];
let currentCartTotal = 0;

// --- Elements Map ---
const productContainer = document.querySelector('#product_container');
const cartToggleBtn = document.querySelector('#cartToggleBtn');
const cartCloseBtn = document.querySelector('#cart_close_btn');
const dbResetBtn = document.querySelector('#db_reset_btn');
const cartOverlay = document.querySelector('#cart_overlay');
const cartItemsContainer = document.querySelector('#cart_items_container');
const emptyCartMsg = document.querySelector('#empty_cart_msg');
const cartCount = document.querySelector('#cart_count');
const cartTotal = document.querySelector('#cart_total');
const checkoutBtn = document.querySelector('#checkout_btn');

// Modal Elements
const orderModalOverlay = document.querySelector('#order_modal_overlay');
const modalCloseBtn = document.querySelector('#modal_close_btn');
const orderForm = document.querySelector('#order_form');
const modalTotalText = document.querySelector('#modal_total');

// Form Input Mapping Targets
const inputName = document.querySelector('#cust_name');
const inputPhone = document.querySelector('#cust_phone');
const inputEmail = document.querySelector('#cust_email');

// --- Initialization Entry Point ---
document.addEventListener('DOMContentLoaded', () => {
    cachedProducts = CloudStorageMock.getProducts();
    cart = CloudStorageMock.getCart();

    renderProducts();
    setupEventListeners();
    updateCartUI();
     // lucide.createIcons();
});

// --- Dynamic Catalog UI Generation ---
function renderProducts() {
    productContainer.replaceChildren();

    cachedProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product_card';

            const image = document.createElement('img');
            image.className = 'product_img';
            image.src = product.image;
            image.alt = product.name;

            const info = document.createElement('div');
            info.className = 'product_info';

                const header = document.createElement('div');
                header.className = 'product_header';

                    const title = document.createElement('h4');
                    title.className = 'product_title';
                    title.textContent = product.name;

                    const price = document.createElement('span');
                    price.className = 'product_price';
                    price.textContent = `₦${product.price.toFixed(0)}`;

                const description = document.createElement('p');
                description.className = 'product_desc';
                description.textContent = product.description;

                const addButton = document.createElement('button');
                addButton.className = 'add_to_cart_btn';
                addButton.type = 'button';
                addButton.addEventListener('click', () => addToCart(product.id));
           
           // for lucide
        const icon = document.createElement('i');
        icon.dataset.lucide = 'plus-circle';
        addButton.append(icon, document.createTextNode(' Add to Cart'));

        header.append(title, price);
        info.append(header, description, addButton);
        card.append(image, info);
        productContainer.appendChild(card);
    });

    lucide.createIcons();
}

    //  cart mutation logic actions 
    // assign function values to window(a global) object    --- no need, changed to const
    // window.addToCart = function(productId) {
    // export/import const addtocart is cleaner though private to file 

const addToCart = function(productId) {
    const product = cachedProducts.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    CloudStorageMock.saveCart(cart);
    updateCartUI();
    openCart();
};

   // window.removeFromCart = function(productId) {
const removeFromCart = function(productId) {

    cart = cart.filter(item => item.id !== productId);
    CloudStorageMock.saveCart(cart);
    updateCartUI();
};

   // window.changeQuantity = function(productId, delta) {
const changeQuantity = function(productId, delta) {

    const item = cart.find(item => item.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        CloudStorageMock.saveCart(cart);
        updateCartUI();
    }
};

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (totalItems > 0) {
        cartCount.textContent = totalItems;
        cartCount.classList.remove('hidden');
        emptyCartMsg.classList.add('hidden');
        checkoutBtn.removeAttribute('disabled');
    } else {
        cartCount.classList.add('hidden');
        emptyCartMsg.classList.remove('hidden');
        checkoutBtn.setAttribute('disabled', 'true');
    }

    currentCartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `₦${currentCartTotal.toFixed(0)}`;
    modalTotalText.textContent = currentCartTotal.toFixed(0);

    cartItemsContainer.replaceChildren();

    if (cart.length === 0) {
        cartItemsContainer.appendChild(emptyCartMsg);
    } else {
        cart.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'cart_item';

                const meta = document.createElement('div');
                meta.className = 'cart_item_meta';

                        const image = document.createElement('img');
                        image.className = 'cart_item_img';
                        image.src = item.image;
                        image.alt = item.name;

                        const details = document.createElement('div');

                                const title = document.createElement('h5');
                                title.className = 'cart_item_title';
                                title.textContent = item.name;

                                const price = document.createElement('p');
                                price.className = 'cart_item_price';
                                price.textContent = `₦${item.price.toFixed(0)}`;

                const controls = document.createElement('div');
                controls.className = 'cart_item_controls';

                        const selector = document.createElement('div');
                        selector.className = 'quantity_selector';

                                const minusBtn = document.createElement('button');
                                minusBtn.className = 'qty_btn';
                                minusBtn.type = 'button';
                                minusBtn.textContent = '-';
                                minusBtn.addEventListener('click', () => changeQuantity(item.id, -1));

                                const quantity = document.createElement('span');
                                quantity.className = 'qty_val';
                                quantity.textContent = item.quantity;

                                const plusBtn = document.createElement('button');
                                plusBtn.className = 'qty_btn';
                                plusBtn.type = 'button';
                                plusBtn.textContent = '+';
                                plusBtn.addEventListener('click', () => changeQuantity(item.id, 1));

                        const deleteBtn = document.createElement('button');
                        deleteBtn.className = 'delete_item_btn';
                        deleteBtn.type = 'button';
                        deleteBtn.addEventListener('click', () => removeFromCart(item.id));
                            
                                // lucide
                                const deleteIcon = document.createElement('i');
                                deleteIcon.dataset.lucide = 'trash-2';

            selector.append(minusBtn, quantity, plusBtn);
            deleteBtn.appendChild(deleteIcon);
            controls.append(selector, deleteBtn);
            details.append(title, price);
            meta.append(image, details);
            itemEl.append(meta, controls);
            cartItemsContainer.appendChild(itemEl);
        });
        lucide.createIcons();
    }
}

// --- Toggle View States Helper Subroutines ---
function openCart() { cartOverlay.classList.add('active'); }
function closeCart() { cartOverlay.classList.remove('active'); }
function openModal() { orderModalOverlay.classList.add('active'); }
function closeModal() { 
    orderModalOverlay.classList.remove('active');
    orderForm.reset();
    clearValidationStyles();
}

function clearValidationStyles() {
    [inputName, inputPhone, inputEmail].forEach(input => input.classList.remove('invalid'));
}

// --- Validation Core Functions ---
function validateForm() {
    let isValid = true;

    // 1. Validate Name (Not Empty)
    if (inputName.value.trim() === "") {
        inputName.classList.add('invalid');
        isValid = false;
    } else {
        inputName.classList.remove('invalid');
    }

    // 2. Validate WhatsApp/Phone Number 
    // Supports matching formats: +60123456789, 60123456789, 0123456789, etc. Min 7, Max 15 standard digits
    const phoneRegex = /^\+?[0-9\s\-]{7,15}$/;
    if (!phoneRegex.test(inputPhone.value.replace(/\s+/g, ''))) {
        inputPhone.classList.add('invalid');
        isValid = false;
    } else {
        inputPhone.classList.remove('invalid');
    }

    // 3. Validate Email Format Standard Rules
    const emailRegex = /^[a-zA-Z0-9._%+-+]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(inputEmail.value.trim())) {
        inputEmail.classList.add('invalid');
        isValid = false;
    } else {
        inputEmail.classList.remove('invalid');
    }

    return isValid;
}

// now all together
function setupEventListeners() {
    cartToggleBtn.addEventListener('click', openCart);
    cartCloseBtn.addEventListener('click', closeCart);
    
    dbResetBtn.addEventListener('click', () => {
        if(confirm("Clear local database variables and storage tables?")) {
            CloudStorageMock.resetDatabase();
        }
    });

    cartOverlay.addEventListener('click', (e) => {
        if (e.target === cartOverlay) closeCart();
    });

    // Handle checkout button press -> Open delivery info modal
    checkoutBtn.addEventListener('click', () => {
        closeCart();
        openModal();
    });

    modalCloseBtn.addEventListener('click', closeModal);
      // Close modal when clicking outside the modal content area or use cancel button
    document.querySelector('.cancel_order_btn').addEventListener('click', closeModal);
    orderModalOverlay.addEventListener('click', (e) => {
        if (e.target === orderModalOverlay) closeModal();
    });

    // Real-time error removal on input focus
    [inputName, inputPhone, inputEmail].forEach(element => {
        element.addEventListener('input', () => {
            if(element.classList.contains('invalid') && element.value.trim() !== "") {
                element.classList.remove('invalid');
            }
        });
    });

    // Intercept checkout submit form sequence
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Stop default browser reloading actions
        
        if (validateForm()) {
            // Package active cart values and custom demographic input parameters together
            const finalOrderPayload = {
                orderId: "ST-" + Math.floor(100000 + Math.random() * 900000),
                timestamp: new Date().toISOString(),
                customer: {
                    name: inputName.value.trim(),
                    phone: inputPhone.value.replace(/\s+/g, ''),
                    email: inputEmail.value.trim().toLowerCase()
                },
                items: cart,
                totalPaid: currentCartTotal
            };

            // Call mock cloud persistence layer
            CloudStorageMock.saveOrder(finalOrderPayload);

            // Clean working cache parameters
            alert(`🧁 Thank you, ${finalOrderPayload.customer.name}!\nYour order reference code is: ${finalOrderPayload.orderId}.\nWe've sent details to ${finalOrderPayload.customer.email} and WhatsApp verification to ${finalOrderPayload.customer.phone}!`);
            
            cart = [];
            CloudStorageMock.saveCart(cart);
            updateCartUI();
            closeModal();
        }
    });
}