// ===== Datos de productos =====
const productos = [
  { id: 1, nombre: "Audífonos inalámbricos",    categoria: "audio",      precio: 189900, imagen: "audifonos.svg",  alt: "Audífonos inalámbricos morados" },
  { id: 2, nombre: "Teclado mecánico",           categoria: "periferico", precio: 249000, imagen: "teclado.svg",    alt: "Teclado mecánico con retroiluminación" },
  { id: 3, nombre: "Mouse ergonómico",           categoria: "periferico", precio: 99900,  imagen: "mouse.svg",      alt: "Mouse ergonómico inalámbrico" },
  { id: 4, nombre: "Smartwatch deportivo",       categoria: "accesorio",  precio: 159900, imagen: "smartwatch.svg", alt: "Reloj inteligente deportivo" },
  { id: 5, nombre: "Lámpara LED de escritorio",  categoria: "accesorio",  precio: 79900,  imagen: "lampara.svg",    alt: "Lámpara LED de escritorio" },
  { id: 6, nombre: "Morral para portátil",       categoria: "accesorio",  precio: 129000, imagen: "morral.svg",     alt: "Morral para portátil de 15 pulgadas" }
];

const nombreCategoria = { audio: "Audio", periferico: "Periférico", accesorio: "Accesorio" };
const formatoPrecio = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

// ===== Estado =====
let carrito = [];              // [{ id, cantidad }]
let filtroActual = "todos";

// ===== Elementos del DOM =====
const listaProductos = document.getElementById("lista-productos");
const sinResultados  = document.getElementById("sin-resultados");
const buscar         = document.getElementById("buscar");
const cartItems      = document.getElementById("cart-items");
const cartVacio      = document.getElementById("cart-vacio");
const cartTotal      = document.getElementById("cart-total");
const cartCount      = document.getElementById("cart-count");
const btnVaciar      = document.getElementById("vaciar");
const menuToggle     = document.querySelector(".menu-toggle");
const menu           = document.getElementById("menu");
const form           = document.getElementById("form-contacto");

// ===== Catálogo: búsqueda y filtros =====
function renderProductos() {
  const texto = buscar.value.trim().toLowerCase();

  const filtrados = productos.filter(p =>
    (filtroActual === "todos" || p.categoria === filtroActual) &&
    p.nombre.toLowerCase().includes(texto)
  );

  listaProductos.innerHTML = filtrados.map(p => `
    <article class="card product">
      <img src="img/${p.imagen}" alt="${p.alt}" width="400" height="300" loading="lazy">
      <h3>${p.nombre}</h3>
      <p class="categoria">${nombreCategoria[p.categoria]}</p>
      <p class="price">${formatoPrecio.format(p.precio)}</p>
      <button class="btn btn-primary" type="button" data-add="${p.id}">Agregar al carrito</button>
    </article>
  `).join("");

  sinResultados.hidden = filtrados.length > 0;
}

buscar.addEventListener("input", renderProductos);

document.querySelector(".filters").addEventListener("click", e => {
  const boton = e.target.closest(".filter-btn");
  if (!boton) return;

  filtroActual = boton.dataset.filter;
  document.querySelectorAll(".filter-btn").forEach(b => {
    const activo = b === boton;
    b.classList.toggle("active", activo);
    b.setAttribute("aria-pressed", activo);
  });
  renderProductos();
});

// ===== Carrito =====
function agregarAlCarrito(id) {
  const item = carrito.find(i => i.id === id);
  if (item) item.cantidad++;
  else carrito.push({ id, cantidad: 1 });
  renderCarrito();
}

function cambiarCantidad(id, delta) {
  const item = carrito.find(i => i.id === id);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) carrito = carrito.filter(i => i.id !== id);
  renderCarrito();
}

function eliminarDelCarrito(id) {
  carrito = carrito.filter(i => i.id !== id);
  renderCarrito();
}

function renderCarrito() {
  cartItems.innerHTML = carrito.map(({ id, cantidad }) => {
    const p = productos.find(prod => prod.id === id);
    return `
      <li>
        <span><strong>${p.nombre}</strong><br>${formatoPrecio.format(p.precio)} c/u</span>
        <div class="qty">
          <button type="button" data-action="restar" data-id="${id}" aria-label="Quitar uno de ${p.nombre}">−</button>
          <span aria-live="polite">${cantidad}</span>
          <button type="button" data-action="sumar" data-id="${id}" aria-label="Agregar uno de ${p.nombre}">+</button>
        </div>
        <button type="button" class="remove" data-action="eliminar" data-id="${id}">Eliminar</button>
      </li>`;
  }).join("");

  const total = carrito.reduce((sum, { id, cantidad }) => {
    const p = productos.find(prod => prod.id === id);
    return sum + p.precio * cantidad;
  }, 0);

  const unidades = carrito.reduce((sum, i) => sum + i.cantidad, 0);

  cartTotal.textContent = formatoPrecio.format(total);
  cartCount.textContent = unidades;
  cartVacio.hidden = carrito.length > 0;
  btnVaciar.disabled = carrito.length === 0;
}

// Delegación de eventos: agregar desde el catálogo
listaProductos.addEventListener("click", e => {
  const boton = e.target.closest("[data-add]");
  if (boton) agregarAlCarrito(Number(boton.dataset.add));
});

// Delegación de eventos: controles dentro del carrito
cartItems.addEventListener("click", e => {
  const boton = e.target.closest("[data-action]");
  if (!boton) return;
  const id = Number(boton.dataset.id);
  const accion = boton.dataset.action;

  if (accion === "sumar")    cambiarCantidad(id, 1);
  if (accion === "restar")   cambiarCantidad(id, -1);
  if (accion === "eliminar") eliminarDelCarrito(id);
});

btnVaciar.addEventListener("click", () => {
  carrito = [];
  renderCarrito();
});

// ===== Menú móvil =====
menuToggle.addEventListener("click", () => {
  const abierto = menu.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", abierto);
  menuToggle.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
});

// Cierra el menú móvil al elegir una sección
menu.addEventListener("click", e => {
  if (e.target.tagName === "A") {
    menu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});

// ===== Validación del formulario de contacto =====
const reglas = {
  nombre: {
    valida: v => v.trim().length >= 3,
    mensaje: "El nombre debe tener al menos 3 caracteres."
  },
  email: {
    valida: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
    mensaje: "Ingresa un correo electrónico válido."
  },
  mensaje: {
    valida: v => v.trim().length >= 10,
    mensaje: "El mensaje debe tener al menos 10 caracteres."
  }
};

function validarCampo(nombre) {
  const input = form.elements[nombre];
  const error = document.getElementById(`error-${nombre}`);
  const { valida, mensaje } = reglas[nombre];
  const ok = valida(input.value);

  input.classList.toggle("invalid", !ok);
  input.setAttribute("aria-invalid", !ok);
  error.textContent = ok ? "" : mensaje;
  return ok;
}

// Valida al salir del campo para dar retroalimentación inmediata
Object.keys(reglas).forEach(nombre => {
  form.elements[nombre].addEventListener("blur", () => validarCampo(nombre));
});

form.addEventListener("submit", e => {
  e.preventDefault();
  const nombres = Object.keys(reglas);
  const resultados = nombres.map(validarCampo);
  const msg = document.getElementById("form-msg");

  if (!resultados.every(Boolean)) {
    const primero = nombres[resultados.indexOf(false)];
    msg.textContent = "Revisa los campos marcados en rojo.";
    msg.style.color = "var(--color-error)";
    form.elements[primero].focus();
    return;
  }

  msg.style.color = "";
  msg.textContent = `¡Gracias, ${form.elements.nombre.value.trim()}! Te responderemos en menos de 24 horas.`;
  form.reset();
});

// ===== Inicio =====
renderProductos();
renderCarrito();
