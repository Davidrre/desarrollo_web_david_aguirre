// Referencias al DOM
const form = document.getElementById("form-avistamiento");

const voluntarioSelect = document.getElementById("voluntario");
const tipoAveSelect = document.getElementById("tipo-ave");
const nombreAveInput = document.getElementById("nombre-ave");
const lugarInput = document.getElementById("lugar");
const fechaInput = document.getElementById("fecha-avistamiento");
const horaInput = document.getElementById("hora-avistamiento");
const archivosInput = document.getElementById("archivos");

const errorVoluntario = document.getElementById("error-voluntario");
const errorTipoAve = document.getElementById("error-tipo-ave");
const errorNombreAve = document.getElementById("error-nombre-ave");
const errorLugar = document.getElementById("error-lugar");
const errorFecha = document.getElementById("error-fecha-avistamiento");
const errorHora = document.getElementById("error-hora-avistamiento");
const errorArchivos = document.getElementById("error-archivos");

const mensajeExito = document.getElementById("mensaje-exito");

// Validadores
const validarSeleccionado = (valor) => valor !== "";

const validarTextoMinimo = (valor, minimo) => valor.trim().length >= minimo;

const validarFechaAvistamiento = (valor) => {
  if (valor === "") return false;

  const fechaIngresada = new Date(valor + "T00:00:00");
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const unAnoAtras = new Date(hoy);
  unAnoAtras.setFullYear(hoy.getFullYear() - 1);

  // No puede ser futura ni anterior a 1 año atrás.
  return fechaIngresada <= hoy && fechaIngresada >= unAnoAtras;
};

const validarHora = (valor) => valor !== "";

const validarArchivos = (archivos) => {
  if (!archivos || archivos.length < 1) return false;

  for (const archivo of archivos) {
    const familia = archivo.type.split("/")[0];
    if (familia !== "image" && familia !== "video") {
      return false;
    }
  }
  return true;
};

// Mostrar / ocultar errores
const mostrarError = (spanElem, esValido) => {
  if (esValido) {
    spanElem.classList.remove("visible");
  } else {
    spanElem.classList.add("visible");
  }
};

// Listener principal
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const voluntarioValido = validarSeleccionado(voluntarioSelect.value);
  const tipoAveValido = validarSeleccionado(tipoAveSelect.value);
  const nombreAveValido = validarTextoMinimo(nombreAveInput.value, 3);
  const lugarValido = validarTextoMinimo(lugarInput.value, 3);
  const fechaValida = validarFechaAvistamiento(fechaInput.value);
  const horaValida = validarHora(horaInput.value);
  const archivosValidos = validarArchivos(archivosInput.files);

  mostrarError(errorVoluntario, voluntarioValido);
  mostrarError(errorTipoAve, tipoAveValido);
  mostrarError(errorNombreAve, nombreAveValido);
  mostrarError(errorLugar, lugarValido);
  mostrarError(errorFecha, fechaValida);
  mostrarError(errorHora, horaValida);
  mostrarError(errorArchivos, archivosValidos);

  const formularioValido =
    voluntarioValido &&
    tipoAveValido &&
    nombreAveValido &&
    lugarValido &&
    fechaValida &&
    horaValida &&
    archivosValidos;

  if (formularioValido) {
    mensajeExito.hidden = false;
    form.reset();
  } else {
    mensajeExito.hidden = true;
  }
});
