let adminProducts = [];

const form = document.getElementById('product-form');
const listEl = document.getElementById('admin-product-list');
const countEl = document.getElementById('prod-count');
const btnCancel = document.getElementById('btn-cancel');

// Login Logic
document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('adminLogged') === 'true') {
        unlockAdmin();
    }
});

function checkPassword() {
    const pass = document.getElementById('admin-pass').value;
    if (pass === 'oscar1234') { // Contraseña elegida por el usuario
        sessionStorage.setItem('adminLogged', 'true');
        unlockAdmin();
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
}

function unlockAdmin() {
    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('admin-content').style.display = 'block';
    document.getElementById('btn-logout').style.display = 'inline-flex';
    fetchAdminProducts();
}

function logout() {
    sessionStorage.removeItem('adminLogged');
    location.reload();
}

async function fetchAdminProducts() {
    try {
        const localData = localStorage.getItem('misProductos');
        if (localData) {
            adminProducts = JSON.parse(localData);
            renderAdminTable();
        } else {
            const res = await fetch('products.json');
            if (!res.ok) throw new Error('Error al cargar');
            adminProducts = await res.json();
            renderAdminTable();
        }
    } catch (e) {
        alert('Error cargando los productos iniciales.');
        console.error(e);
    }
}

function renderAdminTable() {
    listEl.innerHTML = '';
    countEl.innerText = adminProducts.length;

    adminProducts.forEach(p => {
        let stockDisplay = p.stock !== undefined ? p.stock : 10; // 10 por defecto si no tiene
        let stockStyle = stockDisplay <= 0 ? 'color: var(--primary); font-weight: bold;' : '';
        
        listEl.innerHTML += `
            <tr>
                <td><img src="${p.img}" onerror="this.src='https://via.placeholder.com/50?text=IMG'"></td>
                <td><strong>${p.name}</strong></td>
                <td><span class="badge">${p.subcategory}</span></td>
                <td>$${p.price.toLocaleString('es-AR')}</td>
                <td style="${stockStyle}">${stockDisplay}</td>
                <td class="action-btns">
                    <button class="btn-edit" onclick="editProduct(${p.id})" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="btn-delete" onclick="deleteProduct(${p.id})" title="Eliminar"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const idInput = document.getElementById('prod-id').value;
    const name = document.getElementById('prod-name').value;
    const subcategory = document.getElementById('prod-sub').value;
    const price = parseFloat(document.getElementById('prod-price').value);
    const stock = parseInt(document.getElementById('prod-stock').value) || 0;
    const img = document.getElementById('prod-img').value;

    if(idInput) {
        // Editando existente
        const index = adminProducts.findIndex(p => p.id == idInput);
        if(index !== -1) {
            adminProducts[index] = { ...adminProducts[index], name, subcategory, price, stock, img };
        }
    } else {
        // Creando nuevo
        const newProduct = {
            id: Date.now(),
            name,
            subcategory,
            price,
            stock,
            img
        };
        adminProducts.push(newProduct);
    }

    await saveToServer();
    resetForm();
    renderAdminTable();
});

function editProduct(id) {
    const p = adminProducts.find(x => x.id === id);
    if(!p) return;

    document.getElementById('prod-id').value = p.id;
    document.getElementById('prod-name').value = p.name;
    document.getElementById('prod-sub').value = p.subcategory;
    document.getElementById('prod-price').value = p.price;
    document.getElementById('prod-stock').value = p.stock !== undefined ? p.stock : 10;
    document.getElementById('prod-img').value = p.img;

    btnCancel.style.display = 'inline-block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteProduct(id) {
    if(confirm('¿Seguro que deseas eliminar este producto?')) {
        adminProducts = adminProducts.filter(p => p.id !== id);
        await saveToServer();
        renderAdminTable();
    }
}

function resetForm() {
    form.reset();
    document.getElementById('prod-id').value = '';
    document.getElementById('prod-stock').value = '';
    btnCancel.style.display = 'none';
}

async function saveToServer() {
    try {
        // Guardar en LocalStorage para que funcione sin servidor en Netlify
        localStorage.setItem('misProductos', JSON.stringify(adminProducts));
        
        // Efecto visual de guardado exitoso
        const saveBtn = document.querySelector('.btn-save');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-check"></i> ¡Guardado!';
        saveBtn.style.background = 'var(--success)';
        setTimeout(() => {
            saveBtn.innerHTML = originalText;
            saveBtn.style.background = 'var(--primary)';
        }, 2000);

    } catch (e) {
        alert('Error al guardar localmente');
        console.error(e);
    }
}
