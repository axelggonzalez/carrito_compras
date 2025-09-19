// Array de productos disponibles (se cargará desde JSON)
let productos = [];

// Array del carrito de compras
let carrito = [];

// Referencias a elementos del DOM
const productosContainer = document.getElementById('products-container');
const cartSection = document.getElementById('cart-section');
const cartCount = document.getElementById('cart-count');
const cartItems = document.getElementById('cart-items');
const cartContainer = document.getElementById('cart-container');
const emptyCart = document.getElementById('empty-cart');
const totalAmount = document.getElementById('total-amount');
const checkoutBtn = document.getElementById('checkout-btn');
const clearCartBtn = document.getElementById('clear-cart');
const loginBtn = document.querySelector('.login-btn');

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', async function () {
  await cargarProductos();
  mostrarProductos();
  actualizarCarrito();

  // Conectar event listeners
  checkoutBtn.addEventListener('click', procederPago);
  clearCartBtn.addEventListener('click', mostrarModalVaciarCarrito);
  loginBtn.addEventListener('click', mostrarModalLogin);
});

// Función para cargar productos desde JSON
async function cargarProductos() {
  try {
    const response = await fetch (productos.json)
    productos = await response.json();
  } catch (error) {
    console.error('Error cargando productos:', error);
    // Productos de respaldo en caso de error
    productos = [
      {
        id: 1,
        nombre: 'Laptop',
        precio: 500.0,
        descripcion: 'Error cargando productos desde JSON',
        imagen: '📦'
      }
    ];
  }
}

// Función para mostrar los productos en la página
function mostrarProductos() {
  productosContainer.innerHTML = '';

  productos.forEach((producto) => {
    const productoCard = document.createElement('div');
    productoCard.className = 'product-card';

    productoCard.innerHTML = `
      <div class="product-image">${crearImagenProducto(producto)}</div>
      <div class="product-info">
        <h3 class="product-name">${producto.nombre}</h3>
        <p class="product-description">${producto.descripcion}</p>
        <div class="product-price">$${producto.precio.toFixed(2)}</div>
        <button class="add-to-cart-btn" onclick="agregarAlCarrito(${producto.id})">
          Agregar al Carrito
        </button>
      </div>
    `;

    productosContainer.appendChild(productoCard);
  });
}

// Agregar un producto al carrito
function agregarAlCarrito(productoId) {
  const producto = productos.find((p) => p.id === productoId);
  if (!producto) return;

  const itemEnCarrito = carrito.find((item) => item.id === productoId);
  if (itemEnCarrito) {
    itemEnCarrito.cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  mostrarMensaje(`${producto.nombre} agregado al carrito`);
  actualizarCarrito();
}

// Actualizar visualización del carrito
function actualizarCarrito() {
  // contador
  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  cartCount.textContent = totalItems;

  // calcular total
  actualizarTotal();

  // limpiar
  cartItems.innerHTML = '';

  if (carrito.length === 0) {
    emptyCart.style.display = 'block';
    cartContainer.style.display = 'none';
    return;
  } else {
    emptyCart.style.display = 'none';
    cartContainer.style.display = 'block';
  }

  carrito.forEach((item) => {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';

    cartItem.innerHTML = `
      <div class="cart-item-header">
        <div class="cart-item-image">${crearImagenCarrito(item)}</div>
        <div class="cart-item-info">
          <h4>${item.nombre}</h4>
          <div class="cart-item-price">$${item.precio.toFixed(2)}</div>
        </div>
      </div>
      <div class="quantity-controls">
        <button class="quantity-btn" onclick="cambiarCantidad(${item.id}, -1)">-</button>
        <input type="number" class="quantity-input" value="${item.cantidad}" 
          onchange="actualizarCantidad(${item.id}, this.value)" min="1">
        <button class="quantity-btn" onclick="cambiarCantidad(${item.id}, 1)">+</button>
        <button class="remove-btn" onclick="eliminarDelCarrito(${item.id})">Eliminar</button>
      </div>
      <div class="item-total">
        Total: $${(item.precio * item.cantidad).toFixed(2)}
      </div>
    `;
    cartItems.appendChild(cartItem);
  });
}

// Cambiar cantidad (+/-)
function cambiarCantidad(productoId, cambio) {
  const item = carrito.find((i) => i.id === productoId);
  if (!item) return;

  item.cantidad += cambio;
  if (item.cantidad <= 0) {
    carrito = carrito.filter((i) => i.id !== productoId);
  }
  actualizarCarrito();
}

// Actualizar cantidad desde input
function actualizarCantidad(productoId, nuevaCantidad) {
  const cantidad = parseInt(nuevaCantidad);
  const item = carrito.find((i) => i.id === productoId);
  if (!item) return;

  if (cantidad <= 0 || isNaN(cantidad)) {
    carrito = carrito.filter((i) => i.id !== productoId);
  } else {
    item.cantidad = cantidad;
  }
  actualizarCarrito();
}

// Eliminar del carrito
function eliminarDelCarrito(productoId) {
  carrito = carrito.filter((i) => i.id !== productoId);
  actualizarCarrito();
}

// Total del carrito
function actualizarTotal() {
  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  totalAmount.textContent = total.toFixed(2);
}

// Proceder pago
function procederPago() {
  if (carrito.length === 0) {
    mostrarMensaje('Tu carrito está vacío');
    return;
  }

  mostrarModal({
    icono: '💳',
    titulo: 'Confirmar compra',
    mensaje: `¿Confirmas la compra de ${carrito.length} producto(s) por $${totalAmount.textContent}?`,
    textoConfirmar: 'Sí, comprar',
    textoCancel: 'Cancelar',
    onConfirmar: () => {
      carrito = [];
      actualizarCarrito();
      mostrarMensaje('¡Compra realizada con éxito!');
    }
  });
}

// Vaciar carrito
function vaciarCarrito() {
  carrito = [];
  actualizarCarrito();
  mostrarMensaje('Carrito vaciado');
}

// Funciones auxiliares para manejo de imágenes
function crearImagenProducto(producto) {
  if (producto.imagen && producto.imagen.startsWith('./public/images/')) {
    return `<img src="${producto.imagen}" alt="${producto.nombre}" onerror="mostrarFallbackProducto(this, '${producto.imagenFallback || '📦'}')">`;
  }
  return `<div class="product-image-fallback">${producto.imagenFallback || producto.imagen || '📦'}</div>`;
}

function crearImagenCarrito(item) {
  if (item.imagen && item.imagen.startsWith('./public/images/')) {
    return `<img src="${item.imagen}" alt="${item.nombre}" onerror="mostrarFallbackCarrito(this, '${item.imagenFallback || '📦'}')">`;
  }
  return `<div class="cart-item-image-fallback">${item.imagenFallback || item.imagen || '📦'}</div>`;
}

function mostrarFallbackProducto(imgElement, fallback) {
  imgElement.parentElement.innerHTML = `<div class="product-image-fallback">${fallback}</div>`;
}

function mostrarFallbackCarrito(imgElement, fallback) {
  imgElement.parentElement.innerHTML = `<div class="cart-item-image-fallback">${fallback}</div>`;
}

// Modal genérico
function mostrarModal({ icono, titulo, mensaje, textoConfirmar, textoCancel, onConfirmar }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal';

  const botones = textoCancel
    ? `<button class="modal-btn modal-btn-cancel">${textoCancel}</button>
       <button class="modal-btn modal-btn-confirm">${textoConfirmar}</button>`
    : `<button class="modal-btn modal-btn-confirm" style="flex: none; margin: 0 auto;">${textoConfirmar}</button>`;

  modal.innerHTML = `
    <div class="modal-header">
      <div class="modal-icon">${icono}</div>
      <h3>${titulo}</h3>
      <p style="white-space: pre-line;">${mensaje}</p>
    </div>
    <div class="modal-actions">${botones}</div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const btnCancel = modal.querySelector('.modal-btn-cancel');
  const btnConfirm = modal.querySelector('.modal-btn-confirm');

  if (btnCancel) btnCancel.addEventListener('click', () => cerrarModal(overlay));
  btnConfirm.addEventListener('click', () => {
    if (onConfirmar) onConfirmar();
    cerrarModal(overlay);
  });

  if (textoCancel) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cerrarModal(overlay);
    });
  }

  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      cerrarModal(overlay);
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

function cerrarModal(overlay) {
  overlay.style.animation = 'fadeOut 0.3s ease forwards';
  setTimeout(() => {
    if (overlay.parentNode) overlay.remove();
  }, 300);
}

function mostrarMensaje(mensaje) {
  const mensajeDiv = document.createElement('div');
  mensajeDiv.textContent = mensaje;
  mensajeDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(45deg, #27ae60, #2ecc71);
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    font-weight: bold;
    animation: slideIn 0.3s ease;
  `;

  if (!document.querySelector('#message-styles')) {
    const style = document.createElement('style');
    style.id = 'message-styles';
    style.textContent = `
      @keyframes slideIn {
        from {transform: translateX(100%);opacity: 0;}
        to {transform: translateX(0);opacity: 1;}
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(mensajeDiv);

  setTimeout(() => {
    if (mensajeDiv.parentNode) mensajeDiv.remove();
  }, 3000);
}

function mostrarModalVaciarCarrito() {
  if (carrito.length === 0) {
    mostrarMensaje('El carrito ya está vacío');
    return;
  }

  mostrarModal({
    icono: '🗑️',
    titulo: '¿Vaciar carrito?',
    mensaje: 'Esta acción eliminará todos los productos del carrito. No se puede deshacer.',
    textoConfirmar: 'Sí, vaciar',
    textoCancel: 'Cancelar',
    onConfirmar: vaciarCarrito
  });
}

function mostrarModalLogin() {
    mostrarModal({
        icono: '👤',
        titulo: 'Iniciar Sesión',
        mensaje: `
        <form id="login-form">
            <p>Usuario:</p><input type="text" placeholder= "Usuario">
            <p>Contraseña: </p> <input type= "password" placeholder= "Contraseña">
        </form>,`,
        textoConfirmar: 'Entendido',
        textoCancel: '',
        onConfirmar: () => {
            const form = document.getElementById("login-form");
            const email = form.elements[0].value;
            const password = form.elements[1].value;
            loginUsuario({email, password});
        }

    });
}
async function loginUsuario({email, password}) {
    const response = await fetch('https://xp8qpg8w-3000.brs.devtunnels.ms/auth/login', {
        method: 'POST',
        headers: {
           'Content-Type': 'application/json'
        },
        body: JSON.stringify({email, password})
     });
     const data = await response.json();
     console.log(data);
     localStorage.setItem("usuarioLogueado", JSON.stringify(data));
    }