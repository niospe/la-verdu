// Variables globales
let carrito = [];
let ventasDelDia = [];
let productos = [];
let productosFiltrados = [];
let descuentoGeneral = 0;

// DOM Elements
const elementos = {
    productosFicha: document.getElementById("productosFicha"),
    carritoItems: document.getElementById("carritoItems"),
    finalizarVentaBtn: document.getElementById("finalizarVentaBtn"),
    vaciarCarritoBtn: document.getElementById("vaciarCarritoBtn"),
    resumenDiaBtn: document.getElementById("resumenDiaBtn"),
    infoModal: document.getElementById("infoModal"),
    modalTitle: document.getElementById("modalTitle"),
    modalContent: document.getElementById("modalContent"),
    closeModal: document.querySelector(".close-modal"),
    fechaActual: document.getElementById("fecha-actual"),
    buscador: document.getElementById("buscador"),
    btnBuscar: document.getElementById("btnBuscar"),
    btnResetBusqueda: document.getElementById("btnResetBusqueda"),
    wappNumber: document.getElementById("wappNumber"),
    wappBtn: document.getElementById("wappBtn"),
    descuentoInput: document.getElementById("descuento"),
    aplicarDescuentoBtn: document.getElementById("aplicarDescuento")
};

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    // Mostrar fecha actual
    const fecha = new Date();
    elementos.fechaActual.textContent = fecha.toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Cargar datos guardados
    cargarDatosGuardados();
    
    // Cargar productos desde JSON
    await cargarProductos();
    
    // Configurar event listeners
    configurarEventListeners();
    
    // Mostrar carrito
    mostrarCarrito();
});

// Cargar datos del localStorage
function cargarDatosGuardados() {
    const carritoGuardado = localStorage.getItem('carrito');
    const ventasGuardadas = localStorage.getItem('ventasDelDia');
    const descuentoGuardado = localStorage.getItem('descuentoGeneral');
    
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
    }
    
    if (ventasGuardadas) {
        ventasDelDia = JSON.parse(ventasGuardadas);
    }
    
    if (descuentoGuardado) {
        descuentoGeneral = parseFloat(descuentoGuardado);
        elementos.descuentoInput.value = descuentoGeneral;
    }
}

// Guardar datos en localStorage
function guardarDatos() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    localStorage.setItem('ventasDelDia', JSON.stringify(ventasDelDia));
    localStorage.setItem('descuentoGeneral', descuentoGeneral.toString());
}

// Cargar productos desde JSON
async function cargarProductos() {
    try {
        const response = await fetch('json/frutas_verduras.json');
        if (!response.ok) throw new Error('Error al cargar productos');
        
        const data = await response.json();
        // Ordenar alfabéticamente
        productos = data.sort((a, b) => a.nombre.localeCompare(b.nombre));
        productosFiltrados = [...productos];
        
        renderizarProductos();
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar los productos',
            icon: 'error'
        });
    }
}

// Configurar event listeners
function configurarEventListeners() {
    elementos.finalizarVentaBtn.addEventListener('click', finalizarVenta);
    elementos.vaciarCarritoBtn.addEventListener('click', vaciarCarrito);
    elementos.resumenDiaBtn.addEventListener('click', mostrarResumenDia);
    elementos.closeModal.addEventListener('click', () => {
        elementos.infoModal.style.display = 'none';
    });
    elementos.wappBtn.addEventListener('click', enviarMensajeWhatsApp);
    elementos.aplicarDescuentoBtn.addEventListener('click', aplicarDescuento);
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === elementos.infoModal) {
            elementos.infoModal.style.display = 'none';
        }
    });
    
    // Configurar buscador
    configurarBuscador();
}

// Configurar funcionalidad del buscador
function configurarBuscador() {
    // Buscar al hacer clic
    elementos.btnBuscar.addEventListener('click', () => {
        filtrarProductos(elementos.buscador.value.trim().toLowerCase());
    });
    
    // Buscar al presionar Enter
    elementos.buscador.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            filtrarProductos(elementos.buscador.value.trim().toLowerCase());
        }
    });
    
    // Resetear búsqueda
    elementos.btnResetBusqueda.addEventListener('click', () => {
        elementos.buscador.value = '';
        productosFiltrados = [...productos];
        renderizarProductos();
    });
}

// Filtrar productos según término de búsqueda
function filtrarProductos(termino) {
    if (!termino) {
        productosFiltrados = [...productos];
    } else {
        productosFiltrados = productos.filter(producto => 
            producto.nombre.toLowerCase().includes(termino) ||
            (producto.tipo && producto.tipo.toLowerCase().includes(termino)) ||
            (producto.beneficios && producto.beneficios.toLowerCase().includes(termino)) ||
            (producto.vitaminas && producto.vitaminas.some(v => v.toLowerCase().includes(termino)))
        );
    }
    
    if (productosFiltrados.length === 0) {
        Swal.fire({
            title: 'No hay resultados',
            text: 'No se encontraron productos que coincidan con tu búsqueda',
            icon: 'info'
        });
    }
    
    renderizarProductos();
}

// Renderizar productos en la página
function renderizarProductos() {
    elementos.productosFicha.innerHTML = '';
    
    productosFiltrados.forEach(producto => {
        const productoCard = document.createElement('div');
        productoCard.className = 'producto-card';
        
        productoCard.innerHTML = `
            <div class="producto-header">
                <h3 class="producto-title">${producto.nombre}</h3>
                <div class="producto-price">$${producto.precio}</div>
                <div class="producto-unit">por ${producto.unidad}</div>
                <button class="producto-info-btn">Ver beneficios</button>
            </div>
            <div class="producto-actions">
                <input type="number" min="${producto.unidad === 'un' ? '1' : '0.1'}" 
                       step="${producto.unidad === 'un' ? '1' : '0.1'}" 
                       value="${producto.unidad === 'un' ? '1' : '0.5'}">
                <button class="agregar-carrito-btn">Agregar</button>
            </div>
        `;
        
        // Configurar botón de información
        const infoBtn = productoCard.querySelector('.producto-info-btn');
        infoBtn.addEventListener('click', () => mostrarInfoProducto(producto));
        
        // Configurar botón de agregar
        const agregarBtn = productoCard.querySelector('.agregar-carrito-btn');
        const cantidadInput = productoCard.querySelector('input');
        
        agregarBtn.addEventListener('click', () => {
            agregarAlCarrito(producto, parseFloat(cantidadInput.value));
            cantidadInput.value = producto.unidad === 'un' ? '1' : '0.5';
        });
        
        elementos.productosFicha.appendChild(productoCard);
    });
}

// Mostrar información nutricional del producto
function mostrarInfoProducto(producto) {
    elementos.modalTitle.textContent = `Beneficios de ${producto.nombre}`;
    
    let contenido = `
        <div class="nutricion-info">
            <p><strong>Tipo:</strong> ${producto.tipo || 'No especificado'}</p>
            
            <h4>Beneficios:</h4>
            <p>${producto.beneficios || 'Información no disponible'}</p>
            
            <h4>Vitaminas y Minerales:</h4>
            <ul>
    `;
    
    if (producto.vitaminas && producto.vitaminas.length > 0) {
        producto.vitaminas.forEach(vit => {
            contenido += `<li>${vit}</li>`;
        });
    } else {
        contenido += '<li>Información no disponible</li>';
    }
    
    contenido += `
            </ul>
            
            <h4>Recomendaciones:</h4>
            <p>${producto.recomendaciones || 'No hay recomendaciones específicas'}</p>
        </div>
    `;
    
    elementos.modalContent.innerHTML = contenido;
    elementos.infoModal.style.display = 'flex';
}

// Funciones del carrito
function agregarAlCarrito(producto, cantidad) {
    if (cantidad <= 0 || isNaN(cantidad)) {
        Swal.fire({
            title: 'Error',
            text: 'La cantidad debe ser mayor a cero',
            icon: 'error'
        });
        return;
    }
    
    const itemExistente = carrito.find(item => item.id === producto.id);
    
    if (itemExistente) {
        itemExistente.cantidad += cantidad;
        itemExistente.subtotal = producto.precio * itemExistente.cantidad;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            unidad: producto.unidad,
            cantidad: cantidad,
            subtotal: producto.precio * cantidad
        });
    }
    
    mostrarCarrito();
    guardarDatos();
    
    Swal.fire({
        title: 'Producto agregado',
        text: `${producto.nombre} agregado al carrito`,
        icon: 'success',
        timer: 1000,
        showConfirmButton: false
    });
}

// Aplicar descuento general
function aplicarDescuento() {
    const descuento = parseFloat(elementos.descuentoInput.value);
    
    if (isNaN(descuento) || descuento < 0 || descuento > 100) {
        Swal.fire({
            title: 'Error',
            text: 'Por favor ingresa un porcentaje válido (0-100)',
            icon: 'error'
        });
        return;
    }
    
    descuentoGeneral = descuento;
    mostrarCarrito();
    guardarDatos();
    
    Swal.fire({
        title: 'Descuento aplicado',
        text: `Se aplicó un ${descuento}% de descuento`,
        icon: 'success',
        timer: 1000,
        showConfirmButton: false
    });
}

// Mostrar carrito con descuento
function mostrarCarrito() {
    elementos.carritoItems.innerHTML = '';
    
    if (carrito.length === 0) {
        elementos.carritoItems.innerHTML = '<p>El carrito está vacío</p>';
        return;
    }
    
    carrito.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'carrito-item';
        
        itemElement.innerHTML = `
            <div class="carrito-item-info">
                <strong>${item.nombre}</strong> - $${item.precio}/${item.unidad}
                <br>
                Cantidad: ${item.cantidad} - Subtotal: $${item.subtotal.toFixed(2)}
            </div>
            <div class="carrito-item-actions">
                <button class="edit-btn" data-id="${item.id}">Editar</button>
                <button class="delete-btn" data-id="${item.id}">Eliminar</button>
            </div>
        `;
        
        elementos.carritoItems.appendChild(itemElement);
    });
    
    // Configurar botones de editar/eliminar
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editarItemCarrito(parseInt(btn.dataset.id)));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => eliminarItemCarrito(parseInt(btn.dataset.id)));
    });
    
    // Calcular subtotal sin descuento
    const subtotal = carrito.reduce((sum, item) => sum + item.subtotal, 0);
    
    // Mostrar subtotal
    const subtotalElement = document.createElement('div');
    subtotalElement.className = 'total-section';
    subtotalElement.innerHTML = `<strong>Subtotal: $${subtotal.toFixed(2)}</strong>`;
    elementos.carritoItems.appendChild(subtotalElement);
    
    // Mostrar descuento si existe
    if (descuentoGeneral > 0) {
        const descuento = subtotal * (descuentoGeneral / 100);
        
        const descuentoElement = document.createElement('div');
        descuentoElement.className = 'descuento-section';
        descuentoElement.innerHTML = `<strong>Descuento (${descuentoGeneral}%): -$${descuento.toFixed(2)}</strong>`;
        elementos.carritoItems.appendChild(descuentoElement);
        
        // Mostrar total con descuento
        const total = subtotal - descuento;
        const totalElement = document.createElement('div');
        totalElement.className = 'total-section final';
        totalElement.innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;
        elementos.carritoItems.appendChild(totalElement);
    } else {
        // Mostrar total sin descuento
        const totalElement = document.createElement('div');
        totalElement.className = 'total-section final';
        totalElement.innerHTML = `<strong>Total: $${subtotal.toFixed(2)}</strong>`;
        elementos.carritoItems.appendChild(totalElement);
    }
}

function editarItemCarrito(id) {
    const item = carrito.find(item => item.id === id);
    if (!item) return;
    
    Swal.fire({
        title: `Editar ${item.nombre}`,
        html: `
            <div class="swal2-input-group">
                <label for="swal-input1">Cantidad:</label>
                <input id="swal-input1" type="number" 
                       min="${item.unidad === 'un' ? '1' : '0.1'}" 
                       step="${item.unidad === 'un' ? '1' : '0.1'}" 
                       value="${item.cantidad}" 
                       class="swal2-input">
            </div>
        `,
        focusConfirm: false,
        preConfirm: () => {
            const cantidad = parseFloat(document.getElementById('swal-input1').value);
            if (cantidad <= 0 || isNaN(cantidad)) {
                Swal.showValidationMessage('La cantidad debe ser mayor a cero');
                return false;
            }
            return cantidad;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            item.cantidad = result.value;
            item.subtotal = item.precio * item.cantidad;
            mostrarCarrito();
            guardarDatos();
            
            Swal.fire({
                title: 'Actualizado',
                text: 'Cantidad modificada correctamente',
                icon: 'success',
                timer: 1000,
                showConfirmButton: false
            });
        }
    });
}

function eliminarItemCarrito(id) {
    Swal.fire({
        title: '¿Eliminar producto?',
        text: '¿Estás seguro de que quieres eliminar este producto del carrito?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            carrito = carrito.filter(item => item.id !== id);
            mostrarCarrito();
            guardarDatos();
            
            Swal.fire(
                'Eliminado',
                'El producto ha sido eliminado del carrito',
                'success'
            );
        }
    });
}

function vaciarCarrito() {
    if (carrito.length === 0) return;
    
    Swal.fire({
        title: '¿Vaciar carrito?',
        text: '¿Estás seguro de que quieres vaciar todo el carrito?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, vaciar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            carrito = [];
            descuentoGeneral = 0;
            elementos.descuentoInput.value = '0';
            mostrarCarrito();
            guardarDatos();
            
            Swal.fire(
                'Carrito vaciado',
                'Todos los productos han sido eliminados',
                'success'
            );
        }
    });
}

// Finalizar venta
function finalizarVenta() {
    if (carrito.length === 0) {
        Swal.fire({
            title: 'Error',
            text: 'El carrito está vacío',
            icon: 'error'
        });
        return;
    }
    
    const subtotal = carrito.reduce((sum, item) => sum + item.subtotal, 0);
    const descuento = subtotal * (descuentoGeneral / 100);
    const total = subtotal - descuento;
    
    // Registrar venta
    ventasDelDia.push({
        fecha: new Date().toISOString(),
        items: [...carrito],
        subtotal: subtotal,
        descuento: descuento,
        descuentoPorcentaje: descuentoGeneral,
        total: total
    });
    
    // Limpiar carrito y descuento
    carrito = [];
    descuentoGeneral = 0;
    elementos.descuentoInput.value = '0';
    mostrarCarrito();
    guardarDatos();
    
    Swal.fire({
        title: 'Venta registrada',
        html: `
            <p>Subtotal: $${subtotal.toFixed(2)}</p>
            ${descuento > 0 ? `<p>Descuento: ${descuentoGeneral}% (-$${descuento.toFixed(2)})</p>` : ''}
            <p><strong>Total: $${total.toFixed(2)}</strong></p>
        `,
        icon: 'success'
    });
}

// Mostrar resumen del día
function mostrarResumenDia() {
    if (ventasDelDia.length === 0) {
        Swal.fire({
            title: 'Resumen del día',
            text: 'No se han registrado ventas hoy',
            icon: 'info'
        });
        return;
    }
    
    const totalVentas = ventasDelDia.reduce((sum, venta) => sum + venta.total, 0);
    const cantidadVentas = ventasDelDia.length;
    const totalDescuentos = ventasDelDia.reduce((sum, venta) => sum + (venta.descuento || 0), 0);
    
    let mensaje = `📊 Resumen del Día\n\n`;
    mensaje += `💰 Ventas Totales: $${totalVentas.toFixed(2)}\n`;
    mensaje += `🎁 Descuentos Totales: $${totalDescuentos.toFixed(2)}\n`;
    mensaje += `🛒 Cantidad de Ventas: ${cantidadVentas}\n\n`;
    mensaje += `📅 Detalle de ventas:\n`;
    
    ventasDelDia.forEach((venta, index) => {
        const fecha = new Date(venta.fecha).toLocaleTimeString();
        mensaje += `\n${index + 1}. [${fecha}] - $${venta.total.toFixed(2)}`;
        if (venta.descuento > 0) {
            mensaje += ` (Descuento: ${venta.descuentoPorcentaje}%)`;
        }
    });
    
    Swal.fire({
        title: 'Resumen del Día',
        html: mensaje.replace(/\n/g, '<br>'),
        icon: 'info',
        confirmButtonText: 'Cerrar',
        width: '600px'
    });
}

// Enviar mensaje por WhatsApp
function enviarMensajeWhatsApp() {
    if (carrito.length === 0) {
        Swal.fire({
            title: 'Error',
            text: 'El carrito está vacío',
            icon: 'error'
        });
        return;
    }
    
    const numero = elementos.wappNumber.value.trim();
    
    // Validar número de teléfono (ejemplo simple)
    if (!numero || numero.length < 8) {
        Swal.fire({
            title: 'Error',
            text: 'Por favor ingresa un número de WhatsApp válido',
            icon: 'error'
        });
        return;
    }
    
    // Calcular totales
    const subtotal = carrito.reduce((sum, item) => sum + item.subtotal, 0);
    const descuento = subtotal * (descuentoGeneral / 100);
    const total = subtotal - descuento;
    
    // Formatear mensaje
    let mensaje = "🚀 *Pedido de Verdulería Fresca* 🚀\n\n";
    mensaje += "📅 *Fecha:* " + new Date().toLocaleDateString() + "\n\n";
    mensaje += "🛒 *Productos:*\n";
    
    carrito.forEach(item => {
        mensaje += `- ${item.nombre}: ${item.cantidad} ${item.unidad} x $${item.precio} = $${item.subtotal.toFixed(2)}\n`;
    });
    
    mensaje += `\n💵 *Subtotal:* $${subtotal.toFixed(2)}\n`;
    
    if (descuentoGeneral > 0) {
        mensaje += `🎁 *Descuento (${descuentoGeneral}%):* -$${descuento.toFixed(2)}\n`;
    }
    
    mensaje += `💰 *Total:* $${total.toFixed(2)}\n\n`;
    mensaje += "📲 *Confirmar pedido por este medio*";
    
    // Codificar mensaje para URL
    const mensajeCodificado = encodeURIComponent(mensaje);
    
    // Abrir WhatsApp
    window.open(`https://wa.me/${numero}?text=${mensajeCodificado}`, '_blank');
}