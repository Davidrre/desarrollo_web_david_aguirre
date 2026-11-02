// Referencias al DOM
const formComentario = document.getElementById("form-comentario");
const nombreInput = document.getElementById("nombre-comentario");
const textoInput = document.getElementById("texto-comentario");
const errorNombre = document.getElementById("error-nombre-comentario");
const errorTexto = document.getElementById("error-texto-comentario");
const listaComentarios = document.getElementById("lista-comentarios");

// Validadores
const validarNombre = (valor) => {
  const largo = valor.trim().length;
  return largo >= 3 && largo <= 50;
};

const validarTexto = (valor) => {
  const largo = valor.trim().length;
  return largo >= 5 && largo <= 300;
};

// Mostrar / ocultar errores
const mostrarError = (spanElem, esValido) => {
  if (esValido) {
    spanElem.classList.remove("visible");
  } else {
    spanElem.classList.add("visible");
  }
};

// Dibuja la lista de comentarios en la página.
// Usamos textContent (y no innerHTML) porque el texto lo escribió un usuario:
// así el navegador lo muestra como texto y nunca lo ejecuta como HTML.
const mostrarComentarios = (comentarios) => {
  listaComentarios.innerHTML = "";

  if (comentarios.length === 0) {
    const vacio = document.createElement("p");
    vacio.textContent = "Aún no hay comentarios.";
    listaComentarios.appendChild(vacio);
    return;
  }

  comentarios.forEach((comentario) => {
    const caja = document.createElement("div");
    caja.className = "comentario";

    const cabecera = document.createElement("p");
    cabecera.className = "comentario-cabecera";
    cabecera.textContent = `${comentario.fecha} - ${comentario.nombre}`;

    const texto = document.createElement("p");
    texto.className = "comentario-texto";
    texto.textContent = comentario.texto;

    caja.appendChild(cabecera);
    caja.appendChild(texto);
    listaComentarios.appendChild(caja);
  });
};

// GET: pide la lista de comentarios al servidor
const cargarComentarios = () => {
  fetch(formComentario.action) // 1 acceder a la URL (por defecto es GET)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json(); // 2 parseamos el response a un json
    })
    .then((respuesta) => {
      mostrarComentarios(respuesta["data"]); // 3 dibujamos los comentarios
    })
    .catch((error) => {
      console.error("No se pudieron cargar los comentarios:", error);
    });
};

// POST: envía el comentario al servidor
const enviarComentario = () => {
  fetch(formComentario.action, {
    method: "POST",
    body: new FormData(formComentario), // campos "nombre" y "texto" del formulario
  })
    .then((response) => response.json()) // leemos el JSON también cuando el status es 400
    .then((respuesta) => {
      if (respuesta["status"] === "ok") {
        formComentario.reset();
        mostrarError(errorNombre, true);
        mostrarError(errorTexto, true);
        cargarComentarios();
      } else {
        // El servidor encontró errores: se muestran y el formulario sigue visible
        const errores = respuesta["errores"];
        mostrarError(errorNombre, !errores["nombre"]);
        mostrarError(errorTexto, !errores["texto"]);
      }
    })
    .catch((error) => {
      console.error("No se pudo enviar el comentario:", error);
    });
};

// Al enviar el formulario: validar primero en el navegador
formComentario.addEventListener("submit", (event) => {
  event.preventDefault();

  const nombreValido = validarNombre(nombreInput.value);
  const textoValido = validarTexto(textoInput.value);

  mostrarError(errorNombre, nombreValido);
  mostrarError(errorTexto, textoValido);

  if (nombreValido && textoValido) {
    enviarComentario();
  }
});

// Al abrir la página, mostrar los comentarios que ya existen
cargarComentarios();
