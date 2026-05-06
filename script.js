let allProducts = [];
let cart = JSON.parse(localStorage.getItem('userCart')) || [];

// Elementos del DOM
const grid = document.getElementById("products-grid");
const loader = document.getElementById("loader");
const sidebar = document.getElementById('cartSidebar');
const overlay = document.getElementById('overlay');
const cartList = document.getElementById("cart-items-list");
const totalEl = document.getElementById("cart-total-price");
const countEl = document.getElementById("header-cart-count");

// Cargar productos al iniciar
document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
    updateCartUI();
});

async function fetchProducts() {
    try {
        // Intentar leer de LocalStorage primero
        const localData = localStorage.getItem('misProductos');
        if (localData) {
            allProducts = JSON.parse(localData);
            loader.style.display = 'none';
            renderProducts(allProducts);
            return;
        }

        // Si no hay datos locales, cargar el archivo base de productos
        const res = await fetch('products.json');
        if (!res.ok) throw new Error('Error en red');
        allProducts = await res.json();
        
        // Guardarlos en LocalStorage para el futuro
        localStorage.setItem('misProductos', JSON.stringify(allProducts));
        
        loader.style.display = 'none';
        renderProducts(allProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
        loader.innerHTML = '<p style="color:var(--primary);">Error al cargar los productos.</p>';
    }
}

function renderProducts(list) {
    grid.innerHTML = "";
    if (list.length === 0) {
        grid.innerHTML = "<p>No se encontraron productos en esta categoría.</p>";
        return;
    }

    list.forEach(p => {
        grid.innerHTML += `
            <article class="product-card">
                <div class="img-container">
                    <img src="${p.img}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/300/ffffff/000000?text=Sin+Imagen'">
                </div>
                <div class="product-info">
                    <span class="subcategory">${p.subcategory || 'General'}</span>
                    <h3>${p.name}</h3>
                    <div class="price-row">
                        <div class="price">$${p.price.toLocaleString('es-AR')}</div>
                        <button class="btn-add" onclick="addToCart(${p.id})">
                            <i class="fas fa-plus"></i> Añadir
                        </button>
                    </div>
                </div>
            </article>`;
    });
}

// Filtros
function filterCategory(cat) { 
    if(cat === 'todos') renderProducts(allProducts); 
}

function filterBySub(sub) { 
    renderProducts(allProducts.filter(p => p.subcategory === sub)); 
}

// Lógica de Carrito
function toggleCart() {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

function addToCart(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;
    
    cart.push({...product, cartId: Date.now()});
    saveCart();
    updateCartUI();
    
    // Abrir carrito automáticamente al agregar
    if(!sidebar.classList.contains('active')) {
        toggleCart();
    }
}

function removeItem(cartId) {
    cart = cart.filter(i => i.cartId !== cartId);
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('userCart', JSON.stringify(cart));
}

function updateCartUI() {
    cartList.innerHTML = "";
    let sum = 0;

    if (cart.length === 0) {
        cartList.innerHTML = "<p style='color:var(--text-muted); text-align:center;'>Tu carrito está vacío</p>";
    } else {
        cart.forEach(item => {
            sum += item.price;
            cartList.innerHTML += `
                <li class="cart-item">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <span class="item-price">$${item.price.toLocaleString('es-AR')}</span>
                    </div>
                    <button class="btn-del" onclick="removeItem(${item.cartId})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </li>`;
        });
    }

    totalEl.innerText = `$${sum.toLocaleString('es-AR')}`;
    countEl.innerText = cart.length;
}

function enviarWhatsApp() {
    if(cart.length === 0) return alert("Tu carrito está vacío. Añade productos primero.");
    const tel = "5493804858788";
    let text = "*Pedido de Control Remoto Lr*%0A%0A";
    
    cart.forEach(i => {
        text += `- ${i.name} ($${i.price.toLocaleString('es-AR')})%0A`;
    });
    
    const totalFormateado = document.getElementById("cart-total-price").innerText;
    text += `%0A*Total: ${totalFormateado}*`;
    window.open(`https://wa.me/${tel}?text=${text}`, '_blank');
}