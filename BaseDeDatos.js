var bd;
var cajaContactos;

function IniciarBaseDatos() {
  var formularioBusqueda = document.querySelector("#formulario-busqueda");
  formularioBusqueda.addEventListener("submit", buscarContacto);
  cajaContactos = document.querySelector(".caja-contactos");
  var BtnGuardar = document.querySelector("#btn-guardar");
  BtnGuardar.addEventListener("click", AlmacenarContacto);

  // Creamos la base de datos en memoria
  var solicitd = indexedDB.open("Datos-De-Contacto");

  solicitd.addEventListener("error", MostrarError);
  solicitd.addEventListener("success", Comenzar);
  solicitd.addEventListener("upgradeneeded", CrearAlmacen);
}
//Funcion para mostrar errores
function MostrarError(evento) {
  alert("Tenemos un Error: " + evento.code + " / " + evento.message);
}
//Creacion del almacen
function Comenzar(evento) {
  bd = evento.target.result;
  console.log("Funcion Comenzar");
  Mostrar();
}
//Creando el almacen y sus indices
function CrearAlmacen(evento) {
  var basedatos = evento.target.result;
  let almacen = basedatos.createObjectStore("Contactos", { keyPath: "id" });
  almacen.createIndex("BuscarNombre", "nombre", { unique: false });
  console.log("Funcion CrearAlmacen");
}
//Funcion para almacenar contactos
function AlmacenarContacto() {
  var N = document.querySelector("#nombre").value.toLowerCase();
  var I = document.querySelector("#id").value;
  var E = document.querySelector("#edad").value;

  var transaccion = bd.transaction(["Contactos"], "readwrite");
  var almacen = transaccion.objectStore("Contactos");
  transaccion.addEventListener("complete", Mostrar);

  almacen.add({
    nombre: N,
    id: I,
    edad: E,
  });

  document.querySelector("#nombre").value = "";
  document.querySelector("#id").value = "";
  document.querySelector("#edad").value = "";
}

//Funcion para mostrar contactos
function Mostrar() {
  cajaContactos.innerHTML = "";
  var transaccion = bd.transaction(["Contactos"]);
  var almacen = transaccion.objectStore("Contactos");

  var puntero = almacen.openCursor();
  puntero.addEventListener("success", MostrarContactos);
}

//Funcion Mostrar contactos
function MostrarContactos(evento) {
  var puntero = evento.target.result;
  if (puntero) {
    cajaContactos.innerHTML +=
      "<div>" +
      puntero.value.nombre +
      " / " +
      puntero.value.id +
      " / " +
      puntero.value.edad +
      "<input type='button' class='btn-editar' value='Editar' onclick='seleccionarContacto(\"" +
      puntero.value.id +
      "\")'>" +
      "<input type='button' class='btn-borrar' value='Borrar' onclick='eliminarContacto(\"" +
      puntero.value.id +
      "\")'>" +
      "</div>";
    puntero.continue();
  }
}

function seleccionarContacto(key) {
  var transaccion = bd.transaction(["Contactos"], "readwrite");
  var almacen = transaccion.objectStore("Contactos");

  var solicitd = almacen.get(key);
  solicitd.addEventListener("success", function () {
    document.querySelector("#nombre").value = solicitd.result.nombre;
    document.querySelector("#id").value = solicitd.result.id;
    document.querySelector("#edad").value = solicitd.result.edad;
  });
  
  var padreBoton = document.querySelector(".padre-boton");
  padreBoton.innerHTML = "<input type='button' class='btn-actualizar' value='Actualizar' onclick='actualizarContacto()'>";
}
function actualizarContacto(){
  var N = document.querySelector("#nombre").value;
  var I = document.querySelector("#id").value;
  var E = document.querySelector("#edad").value;

  var transaccion = bd.transaction(["Contactos"], "readwrite");
  var almacen = transaccion.objectStore("Contactos");
  transaccion.addEventListener("complete", Mostrar);

  almacen.put({
    nombre: N,
    id: I,
    edad: E,
  });

  document.querySelector("#nombre").value = "";
  document.querySelector("#id").value = "";
  document.querySelector("#edad").value = "";

  var padreBoton = document.querySelector(".padre-boton");
  padreBoton.innerHTML = "<input type='button' id='btn-guardar' value='Guardar' onclick='almacenarContacto()'>";
}
//Buscar contacto

function buscarContacto(evento){
  evento.preventDefault();
    document.querySelector(".resultado-busqueda").innerHTML = "";
    var buscar = document.querySelector("#buscar-nombre").value.toLowerCase();

    var transaccion = bd.transaction(["Contactos"]);
    var almacen = transaccion.objectStore("Contactos");

    var indice = almacen.index("BuscarNombre");
    var rango = IDBKeyRange.only(buscar);
    var puntero = indice.openCursor(rango);

    puntero.addEventListener("success", mostrarBusqueda);
}

function mostrarBusqueda(evento){
  var puntero = evento.target.result;
  var resultadoBusqueda = document.querySelector(".resultado-busqueda");
  if (puntero) {
    resultadoBusqueda.innerHTML +=
      "<div>" +
      puntero.value.nombre +
      " / " +
      puntero.value.id +
      " / " +
      puntero.value.edad +
      "<input type='button' class='btn-editar' value='Editar' onclick='seleccionarContacto(\"" +
      puntero.value.id +
      "\")'>" +
      "</div>";
    puntero.continue();
  }
  document.querySelector("#buscar-nombre").value = "";
}
function eliminarContacto(key)
{
   var transaccion = bd.transaction(["Contactos"], "readwrite");
   var almacen = transaccion.objectStore("Contactos");
   transaccion.addEventListener("complete", Mostrar);

   var solicitud = almacen.delete(key);
}



//Cargar el evento load que inicia la base de datos
window.addEventListener("load", IniciarBaseDatos);
 /* 
 let numeroPrato = inputNumero.value;

  if (numeroPrato) {
    // Abrimos una transacción contra el almacén "carta" en modo lectura
    let transaccion = basedatos.transaction(["carta"], "readonly");
    let almacenProductos = transaccion.objectStore("carta");

    // Hacemos una solicitud a la base de datos para buscar el plato por número
    let solicitud = almacenProductos.get(numeroPrato);

    solicitud.onsuccess = (eventoExito) => {
      let prato = eventoExito.target.result;

      if (prato) {
        // Llena los campos del formulario con los valores del plato
        inputNome.value = prato.nome;
        selectTipo.value = prato.tipo || '';
        inputCantidade.value = prato.cantidade || '';
        inputPrezo.value = prato.prezo || '';
      } else {
        // Si no se encuentra el plato, limpia los campos del formulario
        inputNome.value = '';
        selectTipo.value = '';
        inputCantidade.value = '';
        inputPrezo.value = '';
        console.log("Plato no encontrado");
      }
    };
  } else {
    console.log("Ingresa un número de plato válido");
  }
  let listaPratos = document.getElementById("resultado");
  listaPratos.innerHTML = ''; // Limpia el contenido anterior

  //Abrimos una transaccion contra o almacen "productos" en modo lectura
  let transaccion = basedatos.transaction(["carta"], "readonly");
  let almacenProductos = transaccion.objectStore("carta");

  //Hacemos una solicitud a la base de datos ,para o que abriremos un cursor
  let solicitudeLectura = almacenProductos.openCursor();

  //Definimos o comportamiento no caso de que a leitura tenha exito
  solicitudeLectura.onsuccess = (eventoExitos) => {
    //Gardamos o cursor dentro do evento
    let cursor = eventoExitos.target.result;

    //Si hay datos dentro de la base de datos por ler
    if (cursor) {
      // Crea un div para mostrar el objeto
      let objetoPrato = document.createElement('div');
      objetoPrato.textContent = JSON.stringify(cursor.value);

      // Agrega el div al contenedor de resultados
      listaPratos.appendChild(objetoPrato);

      inputNumero.value = cursor.value.numero;
      inputNome.value = cursor.value.nome;
      selectTipo.value = cursor.value.tipo;
      inputCantidade.value = cursor.value.cantidade;
      inputPrezo.value = cursor.value.prezo;
      //Movemos o cursor para o próximo registro
      console.log(cursor.value); //mostramos por consola o obxeto estraido da BD
      cursor.continue();
    } else {
      

      console.log("Rematouse de leer a  BD");
    }
  };
  */