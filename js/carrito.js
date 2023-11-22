let carrito = JSON.parse(localStorage.getItem("carrito")) || [];


//variable
let productosJSON = [];
let cantidadTotalCompra = carrito.length;

//codigo generado por dom
$(document).ready(function () {
  $("#cantidad-compra").text(cantidadTotalCompra);
  //configuracion del selector para ordenar productos
  $("#seleccion option[value='pordefecto']").attr("selected", true);
  $("#seleccion").on("change", ordenarProductos);

  //funciones que necesitan renderizarse
  $("#gastoTotal").html(`Total: $ ${calcularTotalCarrito()}`);
  leerJSON();
  prodCards();
  verTabla();
  $("#btn-continuar").on('click', function (e) {
    if (carrito.length == 0) {
      e.preventDefault();
      Swal.fire({
        icon: 'error',
        title: 'carrito vacio',
        text: 'Agrega algun articulo',
        confirmButtonColor: "#444444"
      })
    }
  });
})

function prodCards() {
  for (const producto of productosJSON) {
    $("#section-productos").append(`<div class="card"> 
                            <div class="img-container">
                            <img src="${producto.foto}" alt="${producto.nombre}" class="img-product"/>
                            </div>
                            <div class="contenido-card">
                            <p class="contenido-card">${producto.nombre}</p>
                            <p class="contenido-card">${producto.descripcion}</p>
                            <strong class="title-cards">$${producto.precio}</strong>
                            <button class="botones" id="btn${producto.id}"> Agregar al carrito </button>
                            </div>
                            </div>`);
    $(`#btn${producto.id}`).on('click', function () {
      agregarAlCarrito(producto);
    });
  }
};

//listar los productos creados del json
function leerJSON() {
  $.getJSON("../json/productos.json", function (respuesta, estado) {
    if (estado == "success") {
      productosJSON = respuesta;
      prodCards();
    }
  });
}

// Funcion que ordena
function ordenarProductos() {
  let seleccion = $("#seleccion").val();
  if (seleccion == "defecto") {
    productosJSON.sort(function (a, b) {
      return a.id - b.id
    });
  } else if (seleccion == "menor") {
    productosJSON.sort(function (a, b) {
      return a.precio - b.precio
    });
  } else if (seleccion == "mayor") {
    productosJSON.sort(function (a, b) {
      return b.precio - a.precio
    });
  } else if (seleccion == "alfabetico") {
    productosJSON.sort(function (a, b) {
      return a.nombre.localeCompare(b.nombre);
    });
  }

  // Se llama de nuevo la fc
  $(".card").remove();
  prodCards();
}

//cargar productos al carrito y modifica sus cantidades
class ProductoCarrito {
  constructor(prod) {
    this.id = prod.id;
    this.foto = prod.foto;
    this.nombre = prod.nombre;
    this.precio = prod.precio;
    this.cantidad = 1;
  }
}

//agregar productos al carrito, modificando con el detalle del carrito
function agregarAlCarrito(productoAgregado) {
  let encontrado = carrito.find(p => p.id == productoAgregado.id);
  if (encontrado == undefined) {
    let productoEnCarrito = new ProductoCarrito(productoAgregado);
    carrito.push(productoEnCarrito);
    Swal.fire({
      icon: 'success',
      title: 'Nuevo producto agregado al carrito',
      text: productoAgregado.nombre,
      confirmButtonColor: "#444444"
    });

    //agrega una nueva fila a la tabla de carrito o se suma otro a la cantidad ya comprada
    $("#tablabody").append(`<tr id='fila${productoEnCarrito.id}' class='tabla-carrito'>
                            <td> ${productoEnCarrito.nombre}</td>
                            <td id='${productoEnCarrito.id}'> ${productoEnCarrito.cantidad}</td>
                            <td> ${productoEnCarrito.precio}</td>
                            <td><button class='btn btn-light' id="btn-eliminar-${productoEnCarrito.id}">🗑️</button></td>
                            </tr>`);
  } else {

    //consulta posicion de producto e incrementa su cant
    let posicion = carrito.findIndex(p => p.id == productoAgregado.id);
    carrito[posicion].cantidad += 1;
    $(`#${productoAgregado.id}`).html(carrito[posicion].cantidad);
    Swal.fire({
      icon: 'success',
      title: 'Se Agrego otra Unidad del Mismo Producto ',
      text: productoAgregado.nombre,
      confirmButtonColor: "#444444"
    })
  }
  $("#gastoTotal").html(`Total: $ ${calcularTotalCarrito()}`);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  mostrarEnTabla();
}

//rehacer la tabla del modal al refresca la pagina y eliminar productos del carrito
function verTabla() {
  $("#tablabody").empty();
  for (const prod of carrito) {
    $("#tablabody").append(`<tr id='fila${prod.id}' class='tabla-carrito'>
                            <td> ${prod.nombre}</td>
                            <td id='${prod.id}'> ${prod.cantidad}</td>
                            <td> ${prod.precio}</td>
                            <td><button class='btn btn-light' id="eliminar${prod.id}">🗑️</button></td>
                            </tr>`);

    $(`#eliminar${prod.id}`).click(function () {
      let eliminado = carrito.findIndex(p => p.id == prod.id);
      carrito.splice(eliminado, 1);
      console.log(eliminado);
      $(`#fila${prod.id}`).remove();
      $("#gastoTotal").html(`Total: $ ${calcularTotalCarrito()}`);
      localStorage.setItem("carrito", JSON.stringify(carrito));
    })
  }
};

//calcular el monto total y la cantidad
function calcularTotalCarrito() {
  let total = 0;
  for (const producto of carrito) {
    total += producto.precio * producto.cantidad;
  }
  $("#montoTotalCompra").text(total);
  $("#cantidad-compra").text(carrito.length);
  return total;
}

//reseteo todos los valores una vez finalizada la compra
function vaciarCarrito() {
  $("#gastoTotal").text("Total: $0");
  $("#cantidad-compra").text("0");
  $(".tabla-carrito").remove();
  localStorage.clear();
  carrito = [];
}
