let carrito = [];

// Lista de productos para el carrito
let productos = [
    {id:1, nombre:"Manzana", precio:1500, unidad:"kg"},
    {id:2, nombre:"Banana", precio:1200, unidad:"kg"},
    {id:3, nombre:"Naranja", precio:1300, unidad:"kg"},
    {id:4, nombre:"Limón", precio:1400, unidad:"kg"},
    {id:5, nombre:"Palta", precio:1600, unidad:"un"},
    {id:6, nombre:"Sandía", precio:1800, unidad:"kg"},
    {id:7, nombre:"Uva", precio:2000, unidad:"kg"},
    {id:8, nombre:"Pera", precio:1700, unidad:"kg"},
    {id:9, nombre:"Kiwi", precio:1900, unidad:"kg"},
    {id:10, nombre:"Ananá", precio:2100, unidad:"un"},
    {id:11, nombre:"Zanahoria", precio:1200, unidad:"kg"}
]

// Mostrar los productos en el HTML
const fichaProducto = document.getElementById("productoFicha");

if (fichaProducto) {
    productos.forEach((producto) => {
        const divProducto = document.createElement("div");
        divProducto.className = "producto"; 
        
        divProducto.innerHTML = `
            <h3>${producto.nombre}</h3>
            <p>Precio: $${producto.precio} / ${producto.unidad}</p>
        `;
        
        const cantidadInput = document.createElement("input");
        cantidadInput.type = "number";
        cantidadInput.min = producto.unidad === "un" ? "1" : "0.1";
        cantidadInput.step = producto.unidad === "un" ? "1" : "0.1";
        cantidadInput.value = producto.unidad === "un" ? "1" : "0.1";
        
        divProducto.appendChild(cantidadInput);
        
        const agregarBtn = document.createElement("button");
        agregarBtn.innerHTML = "Agregar";
        
        agregarBtn.addEventListener("click", () => {
            const cantidad = parseFloat(cantidadInput.value);
            if (cantidad <= 0 || isNaN(cantidad)) {
                alert('La cantidad debe ser mayor a cero');
                return;
            }
            
            // Verificar si el producto ya está en el carrito
            const itemExistente = carrito.find(item => item.id === producto.id);
            
            if (itemExistente) {
                // Si existe, actualizar cantidad y subtotal
                itemExistente.cantidad += cantidad;
                itemExistente.subtotal = producto.precio * itemExistente.cantidad;
            } else {
                // Si no existe, agregar nuevo item
                carrito.push({
                    id: producto.id,
                    nombre: producto.nombre,
                    precio: producto.precio,
                    unidad: producto.unidad,
                    cantidad: cantidad,
                    subtotal: producto.precio * cantidad,
                });
            }
            
            mostrarCarrito();
            cantidadInput.value = producto.unidad === "un" ? "1" : "0.1";
        });

        divProducto.appendChild(agregarBtn);
        fichaProducto.appendChild(divProducto);
    });
} else {
    console.error("No se encontró el elemento con ID 'productoFicha'");
}

// Función para mostrar el carrito en el HTML
function mostrarCarrito() {
    const listaCompras = document.querySelector("#carritoItems");
    if (!listaCompras) {
        console.error("No se encontró el elemento para mostrar el carrito");
        return;
    }
    
    listaCompras.innerHTML = ""; 

    if (carrito.length === 0) {
        listaCompras.innerHTML = "<li>El carrito está vacío</li>";
        return;
    }

    carrito.forEach((item) => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${item.nombre} - $${item.precio}/${item.unidad} 
            - Cantidad: ${item.cantidad} 
            - Subtotal: $${item.subtotal.toFixed(2)}
        `;
        listaCompras.appendChild(li);
    });
    
    // Mostrar total
    const total = carrito.reduce((sum, item) => sum + item.subtotal, 0);
    const totalElement = document.createElement("li");
    totalElement.innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;
    listaCompras.appendChild(totalElement);
}

mostrarCarrito();

//Reseteo de la lista de articulos agregada

function vaciarCarrito() {
  carrito = [];
  mostrarCarrito();
}
const limpiarListaArticulos = document.getElementById("reseteo") 
limpiarListaArticulos.addEventListener("click", vaciarCarrito) 

//Enviar cuenta por Wp

const wappNumberInput = document.getElementById('wappNumber');
const wappBtn = document.getElementById('wappBtn');

// Función para formatear el carrito como texto para WhatsApp
function formatearCarritoParaWapp() {
    if (carrito.length === 0) return '';
    
    let mensaje = "Gracias por tu compra en LA VERDU\n\n";
    mensaje += "Detalle de tu pedido:\n";
    
    carrito.forEach(item => {
        mensaje += `- ${item.nombre}: ${item.cantidad} ${item.unidad} x $${item.precio} = $${item.subtotal.toFixed(2)}\n`;
    });
    
    // Calcular total
    const total = carrito.reduce((sum, item) => sum + item.subtotal, 0);
    mensaje += `\nTotal: $${total.toFixed(2)}`;
    
    return mensaje;
}

function enviarMensajeWapp() {
    const numero = wappNumberInput.value.trim();
    
    // Validar número
    if (!numero || !/^[0-9]{10,15}$/.test(numero)) {
        alert('Por favor ingresa un número de WhatsApp válido');
        return;
    }
    
    // Validar carrito no vacío
    if (carrito.length === 0) {
        alert('El carrito está vacío');
        return;
    }
    
    const mensaje = formatearCarritoParaWapp();
    const mensajeCodificado = encodeURIComponent(mensaje);
    
    window.open(`https://wa.me/${numero}?text=${mensajeCodificado}`, '_blank');
}

wappBtn.addEventListener('click', enviarMensajeWapp);