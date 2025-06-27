let subtotal = 0;

// Función para agregar un producto al carrito
const ventanaUnidades = document.getElementById("agregarUnidades");
const btn = document.getElementById("productoFicha");
btn.addEventListener("click", () => {
    ventanaUnidades.style.display = "block";
})
window.onclick = function(event) {
  if (event.target == ventanaUnidades) {
    ventanaUnidades.style.display = "none";
  }
}