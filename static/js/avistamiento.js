// Referencias al DOM
const form = document.getElementById("form-avistamiento");

const voluntarioSelect = document.getElementById("voluntario");
const aveInput = document.getElementById("ave");
const lugarInput = document.getElementById("lugar");
const fechaHoraInput = document.getElementById("fecha-hora");
const archivosInput = document.getElementById("archivos");

const errorVoluntario = document.getElementById("error-voluntario");
const errorAve = document.getElementById("error-ave");
const errorLugar = document.getElementById("error-lugar");
const errorFechaHora = document.getElementById("error-fecha-hora");
const errorArchivos = document.getElementById("error-archivos");

// Validadores
const validarVoluntario = (valor) => valor !== "";

const validarAve = (valor) => valor.trim().length >= 2;

const validarLugar = (valor) => valor.trim().length >= 3;

const validarFechaHora = (valor) => {
  if (valor === "") return false;

  const fechaIngresada = new Date(valor);
  const ahora = new Date();

  const haceUnAnio = new Date();
  haceUnAnio.setFullYear(ahora.getFullYear() - 1);

  return fechaIngresada <= ahora && fechaIngresada >= haceUnAnio;
};

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

  const voluntarioValido = validarVoluntario(voluntarioSelect.value);
  const aveValida = validarAve(aveInput.value);
  const lugarValido = validarLugar(lugarInput.value);
  const fechaHoraValida = validarFechaHora(fechaHoraInput.value);
  const archivosValidos = validarArchivos(archivosInput.files);

  mostrarError(errorVoluntario, voluntarioValido);
  mostrarError(errorAve, aveValida);
  mostrarError(errorLugar, lugarValido);
  mostrarError(errorFechaHora, fechaHoraValida);
  mostrarError(errorArchivos, archivosValidos);

  const formularioValido =
    voluntarioValido &&
    aveValida &&
    lugarValido &&
    fechaHoraValida &&
    archivosValidos;

  if (formularioValido) {
    form.submit();
  }
});
