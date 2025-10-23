import { supabase } from "./supabase-config.js";

// ===================== Mostrar secciones =====================
function mostrarSeccion(seccion) {
  document.getElementById("home").style.display = "none";
  document.getElementById("categorias-page").style.display = "none";
  document.getElementById("eventos-page").style.display = "none";
  document.getElementById("detalle-producto").style.display = "none";
  document.getElementById("comunidad-page").style.display = "none"; 
  document.getElementById(seccion).style.display = "block";
}

// ===================== HEADER =====================
document.getElementById("link-inicio").addEventListener("click", () => mostrarSeccion("home"));
document.getElementById("link-eventos").addEventListener("click", () => {
  mostrarSeccion("eventos-page");
  cargarEventosEnSeccion();
});

// ===================== COMUNIDAD (Botón del menú) =====================
document.getElementById("link-comunidad").addEventListener("click", () => {
  mostrarSeccion("comunidad-page");
  cargarComunidad();
});


// ===================== CATEGORÍAS =====================
const categoriaBtns = document.querySelectorAll(".dropdown-content button[data-categoria]");
categoriaBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    mostrarSeccion("categorias-page");
    cargarProductosEnCategoria(btn.dataset.categoria);
  });
});

// ===================== CARGAR PRODUCTOS =====================
async function cargarProductosEnCategoria(tcG) {
  let query = supabase.from("productos").select("*");

  if (tcG === "Preventas") {
    // Solo productos en preventa
    query = query.eq("preventa", true);
  } else {
    // Excluir productos en preventa (solo aquellos con preventa marcada como true)
    query = query.or('preventa.eq.false,preventa.is.null');

    if (tcG === "Otros") {
      query = query.neq("tipo_producto", "Carta");
    } else {
      query = query.eq("TCG", tcG);
    }
  }

  const { data: productos, error } = await query;

  const contenedor = document.getElementById("productos-categoria");
  contenedor.innerHTML = "";

  if (error || !productos || productos.length === 0) {
    contenedor.innerHTML = "<p>No hay productos disponibles.</p>";
    return;
  }

  productos.forEach(p => {
    const card = document.createElement("div");
    card.classList.add("producto-card");
    card.style.position = "relative"; // para el badge

    // Badge "SIN STOCK"
    if (!p.disponible) {
      card.style.filter = "grayscale(100%) opacity(0.5)";
      const badgeStock = document.createElement("div");
      badgeStock.textContent = "SIN STOCK";
      badgeStock.style.position = "absolute";
      badgeStock.style.top = "10px";
      badgeStock.style.right = "10px";
      badgeStock.style.backgroundColor = "rgba(217, 83, 79, 0.9)";
      badgeStock.style.color = "white";
      badgeStock.style.padding = "5px 10px";
      badgeStock.style.fontWeight = "bold";
      badgeStock.style.borderRadius = "5px";
      badgeStock.style.fontSize = "0.9em";
      card.appendChild(badgeStock);
    }

    // Badge "OFERTA" si existe descuento
    if (p.oferta && p.cantidad_oferta) {
      const badgeOferta = document.createElement("div");
      badgeOferta.textContent = `${p.cantidad_oferta}% OFF`;
      badgeOferta.style.position = "absolute";
      badgeOferta.style.top = "10px";
      badgeOferta.style.left = "10px";
      badgeOferta.style.backgroundColor = "rgba(255, 165, 0, 0.9)";
      badgeOferta.style.color = "white";
      badgeOferta.style.padding = "5px 10px";
      badgeOferta.style.fontWeight = "bold";
      badgeOferta.style.borderRadius = "5px";
      badgeOferta.style.fontSize = "0.9em";
      card.appendChild(badgeOferta);
    }

    // Calcular precio con descuento
    let precioHTML = `<strong class="precio">$${p.precio.toLocaleString()}</strong>`;
    if (p.oferta && p.cantidad_oferta) {
      const precioConDescuento = Math.round(p.precio * (1 - p.cantidad_oferta / 100));
      precioHTML = `
        <strong class="precio-normal" style="text-decoration: line-through; color: gray;">
          $${p.precio.toLocaleString()}
        </strong>
        <strong class="precio-oferta" style="color:#d9534f; display:block; margin-top:5px;">
          $${precioConDescuento.toLocaleString()}
        </strong>
      `;
    }

    card.innerHTML += `
      <img src="${p.imagen}" alt="${p.nombre}">
      <div class="info">
        <h3 title="${p.nombre}">${p.nombre}</h3>
        <p>${p.descripcion}</p>
        ${precioHTML}
      </div>
    `;

    card.addEventListener("click", () => {
      mostrarSeccion("detalle-producto");
      mostrarDetalleProducto(p.id);
    });

    contenedor.appendChild(card);
  });

}

// ===================== BUSCADOR DE CATEGORÍAS =====================
document.getElementById("buscador-categorias").addEventListener("input", e => {
  const filtro = e.target.value.toLowerCase();
  const productos = document.querySelectorAll("#productos-categoria .producto-card");
  productos.forEach(p => {
    const nombre = p.querySelector("h3").textContent.toLowerCase();
    p.style.display = nombre.includes(filtro) ? "block" : "none";
  });
});

// ===================== CAMBIAR VISTA GRID/LIST =====================
document.getElementById("grid-view").addEventListener("click", () => {
  document.getElementById("productos-categoria").classList.add("productos-grid");
  document.getElementById("productos-categoria").classList.remove("productos-list");
});

document.getElementById("list-view").addEventListener("click", () => {
  document.getElementById("productos-categoria").classList.remove("productos-grid");
  document.getElementById("productos-categoria").classList.add("productos-list");
});

// ===================== CORRECCIÓN DE FECHAS UTC =====================
function ajustarFechaUTC(fechaStr) {
  const fecha = new Date(fechaStr);
  fecha.setDate(fecha.getDate() + 1); // Corrige el desfase UTC-3
  return fecha;
}

// ===================== CARGAR EVENTOS EN COLUMNAS =====================
async function cargarEventosEnSeccion() {
  const { data: eventos, error } = await supabase
    .from("eventos")
    .select("*")
    .order("fecha", { ascending: true });

  const contenedor = document.getElementById("eventos-container");
  contenedor.innerHTML = "";

  if (error || !eventos || eventos.length === 0) {
    contenedor.innerHTML = "<p>No hay eventos disponibles actualmente.</p>";
    return;
  }

  // Crear estructura base: columnas para los días de la semana
  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const columnas = {};

  diasSemana.forEach(dia => {
    const col = document.createElement("div");
    col.classList.add("dia-columna");
    col.innerHTML = `<h2 class="dia-titulo">${dia}</h2>`;
    contenedor.appendChild(col);
    columnas[dia] = col;
  });

  // Función auxiliar: convertir fecha a día de la semana (en español)
  const getDiaSemana = fechaStr => {
    const fecha = ajustarFechaUTC(fechaStr);
    const opciones = { weekday: "long" };
    const nombre = fecha.toLocaleDateString("es-CL", opciones);
    return nombre.charAt(0).toUpperCase() + nombre.slice(1);
  };

  // Insertar cada evento en su columna correspondiente
  eventos.forEach(e => {
    const dia = getDiaSemana(e.fecha);
    if (!columnas[dia]) return; // Si no coincide, se ignora

    const mini = document.createElement("div");
    mini.classList.add("evento-mini");
    mini.innerHTML = `
      <img src="${e.imagen}" alt="${e.titulo}">
      <h3>${e.titulo}</h3>
    `;
    mini.addEventListener("click", () => mostrarEventoModal(e));
    columnas[dia].appendChild(mini);
  });
}

// ===================== MOSTRAR EVENTO EN MODAL =====================
function mostrarEventoModal(evento) {
  const modal = document.getElementById("evento-modal");
  document.getElementById("modal-img").src = evento.imagen;
  document.getElementById("modal-titulo").textContent = evento.titulo;
  document.getElementById("modal-descripcion").textContent =
    evento.descripcion || "Sin descripción";

  const fechaCorr = ajustarFechaUTC(evento.fecha);
  document.getElementById("modal-fecha").textContent =
    "📅 " + fechaCorr.toLocaleDateString("es-CL");

  modal.style.display = "flex";
}

// ===================== CERRAR MODAL =====================
document.querySelector(".close-btn").addEventListener("click", () => {
  document.getElementById("evento-modal").style.display = "none";
});

// Cerrar modal al hacer clic fuera del contenido
window.addEventListener("click", e => {
  const modal = document.getElementById("evento-modal");
  if (e.target === modal) modal.style.display = "none";
});


// ===================== COMUNIDAD =====================
async function cargarComunidad() {
  const contenedor = document.getElementById("comunidad-container");
  contenedor.innerHTML = "<p class='cargando'>Cargando comunidad...</p>";

  const { data: comunidad, error } = await supabase
    .from("contenido_publico")
    .select("*")
    .eq("tipo", "comunidad");

  if (error || !comunidad || comunidad.length === 0) {
    contenedor.innerHTML = "<p>No hay contenido de comunidad disponible.</p>";
    return;
  }

  contenedor.innerHTML = "";

  comunidad.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("comunidad-item");
    div.innerHTML = `
      <img src="${item.imagen}" alt="Imagen de comunidad">
      ${item.descripcion ? `<p>${item.descripcion}</p>` : ""}
    `;
    contenedor.appendChild(div);
  });

  activarModalComunidad();
}

// ===================== COMUNIDAD - MODAL DE IMÁGENES =====================
const modal = document.getElementById("comunidad-modal");
const modalImg = document.getElementById("imagen-ampliada");
const closeBtn = document.querySelector(".close");

function activarModalComunidad() {
  const imagenes = document.querySelectorAll("#comunidad-container img");
  imagenes.forEach(img => {
    img.addEventListener("click", () => {
      modal.style.display = "flex";
      modalImg.src = img.src;
    });
  });
}

closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});


// ===================== DETALLE DE PRODUCTO =====================
async function mostrarDetalleProducto(id) {
  document.getElementById("categorias-page").style.display = "none";
  document.getElementById("detalle-producto").style.display = "block";

  const detalleContenedor = document.getElementById("detalle-contenido");
  const relacionadosContenedor = document.getElementById("productos-relacionados");

  detalleContenedor.innerHTML = "<p class='cargando'>Cargando...</p>";
  relacionadosContenedor.innerHTML = "";

  const { data: producto, error } = await supabase
    .from("productos")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !producto) {
    detalleContenedor.innerHTML = "<p class='error-texto'>No se pudo cargar el producto.</p>";
    return;
  }

  detalleContenedor.innerHTML = `
    <div class="detalle-producto-card">
      <div class="detalle-superior">
        <div class="detalle-imagen">
          <img src="${producto.imagen}" alt="${producto.nombre}">
        </div>
        <div class="detalle-info">
          <h1 class="detalle-nombre">${producto.nombre}</h1>
          <!-- Mostrar precio con o sin oferta -->
          ${
            producto.oferta && producto.cantidad_oferta
              ? `
                  <p class="detalle-precio">
                    <span style="text-decoration: line-through; color: gray;">
                      $${producto.precio.toLocaleString()}
                    </span><br>
                    <span style="color:#d9534f; font-weight:bold; font-size:1.2em;">
                      $${Math.round(producto.precio * (1 - producto.cantidad_oferta / 100)).toLocaleString()}
                    </span>
                    <span style="background-color:#ffa500; color:white; font-weight:bold; padding:3px 8px; border-radius:5px; margin-left:8px;">
                      ${producto.cantidad_oferta}% OFF
                    </span>
                  </p>
                `
              : `<p class="detalle-precio">$${producto.precio.toLocaleString()}</p>`
          }
          <p class="detalle-stock" style="color:${producto.disponible ? '#28a745' : '#d9534f'};">
            ${producto.disponible ? '✔ En Stock' : '✖ Sin Stock'}
          </p>
        </div>
      </div>
      <div class="detalle-descripcion">
        ${producto.descripcion || "Sin descripción disponible."}
      </div>
    </div>
  `;


  let relacionadosQuery = supabase.from("productos").select("*").neq("id", id).limit(3);
  if (producto.TCG) {
    relacionadosQuery = relacionadosQuery.eq("TCG", producto.TCG);
  } else if (producto.tipo_producto) {
    relacionadosQuery = relacionadosQuery.eq("tipo_producto", producto.tipo_producto);
  }

  const { data: relacionados, error: errorRelacionados } = await relacionadosQuery;
  if (errorRelacionados || relacionados.length === 0) {
    relacionadosContenedor.innerHTML = "<p class='sin-relacionados'>No hay productos relacionados.</p>";
    return;
  }

  relacionados.forEach(r => {
    const card = document.createElement("div");
    card.classList.add("producto-card");
    card.innerHTML = `
      <img src="${r.imagen}" alt="${r.nombre}">
      <div class="info">
        <h3>${r.nombre}</h3>
        <strong class="precio">$${r.precio.toLocaleString()}</strong>
      </div>
    `;
    card.addEventListener("click", () => {
      mostrarSeccion("detalle-producto");
      mostrarDetalleProducto(r.id);
    });
    relacionadosContenedor.appendChild(card);
  });
}

document.getElementById("volver-categorias").addEventListener("click", () => {
  document.getElementById("detalle-producto").style.display = "none";
  document.getElementById("categorias-page").style.display = "block";
});

// ===================== HOME (CARRUSEL + LOGO + EFECTO) =====================
const slidesContainer = document.getElementById("carousel-container");
const prev = document.querySelector(".prev");
const next = document.querySelector(".next");
let slides = [];
let current = 0;

function showSlide(index) {
  slides.forEach((s, i) => s.classList.toggle("active", i === index));
}

next.addEventListener("click", () => {
  if (!slides.length) return;
  current = (current + 1) % slides.length;
  showSlide(current);
});

prev.addEventListener("click", () => {
  if (!slides.length) return;
  current = (current - 1 + slides.length) % slides.length;
  showSlide(current);
});

setInterval(() => {
  if (!slides.length) return;
  current = (current + 1) % slides.length;
  showSlide(current);
}, 5000);

// ===================== CARGAR CARRUSEL =====================
async function cargarCarrusel() {
  const { data, error } = await supabase
    .from("contenido_publico")
    .select("*")
    .eq("tipo", "carrousel");

  if (error) {
    console.error("Error cargando carrusel:", error);
    return;
  }

  slidesContainer.innerHTML = "";
  data.forEach((item, index) => {
    const slide = document.createElement("div");
    slide.classList.add("slide");
    if (index === 0) slide.classList.add("active");
    slide.style.backgroundImage = `url('${item.imagen}')`;

    const content = document.createElement("div");
    content.classList.add("slide-content");
    content.innerHTML = `
      <h2>${item.TCG} TCG</h2>
      <button class="buy-btn" data-categoria="${item.TCG}">Comprar Ahora</button>
    `;
    slide.appendChild(content);
    slidesContainer.appendChild(slide);
  });

  slides = Array.from(document.querySelectorAll(".slide"));
  asignarEventosCompra();
}

function asignarEventosCompra() {
  const buyBtns = document.querySelectorAll(".buy-btn");
  buyBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const tcG = btn.dataset.categoria;
      document.getElementById("link-inicio").click();
      document.querySelector(`.dropdown-content button[data-categoria="${tcG}"]`)?.click();
    });
  });
}

// ===================== PRODUCTOS EN PREVENTA =====================
async function cargarProductosPreventa() {
  const contenedor = document.getElementById("productos-preventa");
  contenedor.innerHTML = "<p class='cargando'>Cargando productos en preventa...</p>";

  const { data: productos, error } = await supabase
    .from("productos")
    .select("*")
    .eq("preventa", true);

  if (error || !productos || productos.length === 0) {
    contenedor.innerHTML = "<p>No hay productos en preventa en este momento.</p>";
    return;
  }

  contenedor.innerHTML = "";
  contenedor.classList.add("productos-grid");

  productos.forEach(p => {
    const card = document.createElement("div");
    card.classList.add("producto-card");
    card.style.position = "relative"; // para el badge

    // Aplicar filtro si no está disponible
    if (!p.disponible) {
      card.style.filter = "grayscale(100%) opacity(0.5)";

      // Badge "SIN STOCK"
      const badge = document.createElement("div");
      badge.textContent = "SIN STOCK";
      badge.style.position = "absolute";
      badge.style.top = "10px";
      badge.style.right = "10px";
      badge.style.backgroundColor = "rgba(217, 83, 79, 0.9)";
      badge.style.color = "white";
      badge.style.padding = "5px 10px";
      badge.style.fontWeight = "bold";
      badge.style.borderRadius = "5px";
      badge.style.fontSize = "0.9em";
      card.appendChild(badge);
    }

    // Badge "OFERTA" si existe descuento
    if (p.oferta && p.cantidad_oferta) {
      const badgeOferta = document.createElement("div");
      badgeOferta.textContent = `${p.cantidad_oferta}% OFF`;
      badgeOferta.style.position = "absolute";
      badgeOferta.style.top = "10px";
      badgeOferta.style.left = "10px";
      badgeOferta.style.backgroundColor = "rgba(255, 165, 0, 0.9)";
      badgeOferta.style.color = "white";
      badgeOferta.style.padding = "5px 10px";
      badgeOferta.style.fontWeight = "bold";
      badgeOferta.style.borderRadius = "5px";
      badgeOferta.style.fontSize = "0.9em";
      card.appendChild(badgeOferta);
    }

    // Calcular precio con descuento
    let precioHTML = `<strong class="precio">$${p.precio.toLocaleString()}</strong>`;
    if (p.oferta && p.cantidad_oferta) {
      const precioConDescuento = Math.round(p.precio * (1 - p.cantidad_oferta / 100));
      precioHTML = `
        <strong class="precio-normal" style="text-decoration: line-through; color: gray;">
          $${p.precio.toLocaleString()}
        </strong>
        <strong class="precio-oferta" style="color:#d9534f; display:block; margin-top:5px;">
          $${precioConDescuento.toLocaleString()}
        </strong>
      `;
    }


    card.innerHTML += `
      <img src="${p.imagen}" alt="${p.nombre}">
      <div class="info">
        <h3 title="${p.nombre}">${p.nombre}</h3>
        <p>${p.descripcion}</p>
        <strong class="precio">$${p.precio.toLocaleString()}</strong>
      </div>
    `;

    card.addEventListener("click", () => {
      mostrarSeccion("detalle-producto");
      mostrarDetalleProducto(p.id);
    });

    contenedor.appendChild(card);
  });
}

// ===================== PRODUCTOS DESTACADOS =====================
async function cargarProductosDestacados() {
  const contenedor = document.getElementById("productos-destacados");
  contenedor.innerHTML = "<p class='cargando'>Cargando productos destacados...</p>";

  const { data: productos, error } = await supabase
    .from("productos")
    .select("*")
    .eq("destacado", true);;

  if (error || !productos || productos.length === 0) {
    contenedor.innerHTML = "<p>No hay productos destacados en este momento.</p>";
    return;
  }

  const destacados = productos;

  contenedor.innerHTML = "";
  contenedor.classList.add("productos-grid");

  destacados.forEach(p => {
    const card = document.createElement("div");
    card.classList.add("producto-card");
    card.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}">
      <div class="info">
        <h3 title="${p.nombre}">${p.nombre}</h3>
        <p>${p.descripcion}</p>
        <strong class="precio">$${p.precio.toLocaleString()}</strong>
      </div>
    `;
    card.addEventListener("click", () => {
      mostrarSeccion("detalle-producto");
      mostrarDetalleProducto(p.id);
    });
    contenedor.appendChild(card);
  });
}

// ===================== CARGAR LOGO =====================
async function cargarLogo() {
  const { data, error } = await supabase
    .from("contenido_publico")
    .select("imagen")
    .eq("tipo", "logo_arriba")
    .single();

  if (error || !data) {
    console.warn("No se encontró logo, usando texto por defecto.");
    return;
  }

  const logoImg = document.getElementById("logo-img");
  const logoText = document.getElementById("logo-text");

  logoImg.src = data.imagen;
  logoImg.style.display = "block";
  logoText.style.display = "none";
}

// ===================== LOGO INTERACTIVO (Easter Egg) =====================
document.addEventListener("DOMContentLoaded", () => {
  const logo = document.querySelector(".logo");
  let glowLevel = 0;
  let fadeTimeout = null;
  let fadeInterval = null;

  if (logo) {
    logo.addEventListener("click", () => {
      glowLevel = (glowLevel % 5) + 1;
      logo.className = `logo glow-${glowLevel}`;

      if (fadeTimeout) clearTimeout(fadeTimeout);
      if (fadeInterval) clearInterval(fadeInterval);

      fadeTimeout = setTimeout(() => {
        fadeInterval = setInterval(() => {
          if (glowLevel > 0) {
            glowLevel--;
            logo.className = glowLevel > 0 ? `logo glow-${glowLevel}` : "logo";
          } else {
            clearInterval(fadeInterval);
          }
        }, 400);
      }, 2500);

      mostrarSeccion("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  cargarCarrusel();
  cargarLogo();
  cargarFooter();
  cargarProductosDestacados();
  cargarProductosPreventa();
});

// ===================== HOME POR DEFECTO =====================
window.onload = async () => {
  mostrarSeccion("home");
  cargarProductosEnCategoria("Magic");
};

// ===================== FOOTER (CARGA DESDE SUPABASE) =====================
async function cargarFooter() {
  try {
    const { data: contenidos, error } = await supabase
      .from("contenido_publico")
      .select("*")
      .in("tipo", ["logo_abajo", "logo_face", "logo_ig", "logo_gmail"]);

    if (error) {
      console.error("Error al cargar footer:", error);
      return;
    }

    contenidos.forEach(c => {
      switch (c.tipo) {
        case "logo_abajo":
          document.getElementById("logo-abajo").src = c.imagen;
          document.getElementById("logo-abajo").style.display = "block";
          break;
        case "logo_face":
          document.getElementById("logo-face").src = c.imagen;
          document.getElementById("logo-face").style.display = "block";
          break;
        case "logo_ig":
          document.getElementById("logo-ig").src = c.imagen;
          document.getElementById("logo-ig").style.display = "block";
          break;
        case "logo_gmail":
          document.getElementById("logo-gmail").src = c.imagen;
          document.getElementById("logo-gmail").style.display = "block";
          break;
      }
    });
  } catch (e) {
    console.error("Error inesperado al cargar el footer:", e);
  }
}