// Referencias al DOM
const form = document.getElementById("form-registro");

const nombreInput = document.getElementById("nombre");
const apellidoInput = document.getElementById("apellido");
const emailInput = document.getElementById("email");
const celularInput = document.getElementById("celular");
const regionSelect = document.getElementById("region");
const comunaSelect = document.getElementById("comuna");
const fechaNacimientoInput = document.getElementById("fecha-nacimiento");

const errorNombre = document.getElementById("error-nombre");
const errorApellido = document.getElementById("error-apellido");
const errorEmail = document.getElementById("error-email");
const errorCelular = document.getElementById("error-celular");
const errorRegion = document.getElementById("error-region");
const errorComuna = document.getElementById("error-comuna");
const errorFechaNacimiento = document.getElementById("error-fecha-nacimiento");

const mensajeExito = document.getElementById("mensaje-exito");

// Poblar selects de región / comuna
const poblarRegiones = () => {
  for (const region in REGIONES_COMUNAS) {
    const option = document.createElement("option");
    option.value = region;
    option.textContent = region;
    regionSelect.appendChild(option);
  }
};

const actualizarComunas = () => {
  const regionSeleccionada = regionSelect.value;

  comunaSelect.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "-- Seleccione una comuna --";
  comunaSelect.appendChild(placeholder);

  if (REGIONES_COMUNAS[regionSeleccionada]) {
    REGIONES_COMUNAS[regionSeleccionada].forEach((comuna) => {
      const option = document.createElement("option");
      option.value = comuna;
      option.textContent = comuna;
      comunaSelect.appendChild(option);
    });
  }
};

regionSelect.addEventListener("change", actualizarComunas);

// Validadores
const validarNombre = (valor) => valor.trim().length >= 2;

const validarApellido = (valor) => valor.trim().length >= 2;

const validarEmail = (valor) => {
  const re = /^[\w.+-]+@[a-zA-Z\d-]+\.[a-zA-Z]{2,}$/;
  return re.test(valor.trim());
};

const validarCelular = (valor) => {
  // Acepta formatos como "+56912345678", "+56 9 1234 5678", "912345678"
  const re = /^(\+?56)?\s?9\s?\d{4}\s?\d{4}$/;
  return re.test(valor.trim());
};

const validarRegion = (valor) => valor !== "";

const validarComuna = (valor) => valor !== "";

const validarFechaNacimiento = (valor) => {
  // Campo opcional: si viene vacío, es válido.
  if (valor === "") return true;
  const fechaIngresada = new Date(valor);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return fechaIngresada <= hoy;
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

  const nombreValido = validarNombre(nombreInput.value);
  const apellidoValido = validarApellido(apellidoInput.value);
  const emailValido = validarEmail(emailInput.value);
  const celularValido = validarCelular(celularInput.value);
  const regionValida = validarRegion(regionSelect.value);
  const comunaValida = validarComuna(comunaSelect.value);
  const fechaNacimientoValida = validarFechaNacimiento(fechaNacimientoInput.value);

  mostrarError(errorNombre, nombreValido);
  mostrarError(errorApellido, apellidoValido);
  mostrarError(errorEmail, emailValido);
  mostrarError(errorCelular, celularValido);
  mostrarError(errorRegion, regionValida);
  mostrarError(errorComuna, comunaValida);
  mostrarError(errorFechaNacimiento, fechaNacimientoValida);

  const formularioValido =
    nombreValido &&
    apellidoValido &&
    emailValido &&
    celularValido &&
    regionValida &&
    comunaValida &&
    fechaNacimientoValida;

  if (formularioValido) {
    mensajeExito.hidden = false;
    form.reset();
    actualizarComunas();
  } else {
    mensajeExito.hidden = true;
  }
});

// Inicialización
poblarRegiones();
