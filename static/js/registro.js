// Referencias al DOM
const form = document.getElementById("form-registro");

const nombreInput = document.getElementById("nombre");
const emailInput = document.getElementById("email");
const celularInput = document.getElementById("celular");
const regionSelect = document.getElementById("region");
const comunaSelect = document.getElementById("comuna");

const errorNombre = document.getElementById("error-nombre");
const errorEmail = document.getElementById("error-email");
const errorCelular = document.getElementById("error-celular");
const errorRegion = document.getElementById("error-region");
const errorComuna = document.getElementById("error-comuna");

// Poblar select de región con los datos reales (id + nombre) que Flask inyectó
const poblarRegiones = () => {
  REGIONES.forEach((region) => {
    const option = document.createElement("option");
    option.value = region.id;
    option.textContent = region.nombre;
    regionSelect.appendChild(option);
  });
};

// Poblar select de comuna según la región actualmente seleccionada
const actualizarComunas = () => {
  const regionIdSeleccionada = regionSelect.value;

  comunaSelect.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "-- Seleccione una comuna --";
  comunaSelect.appendChild(placeholder);

  const comunas = COMUNAS_POR_REGION[regionIdSeleccionada];
  if (comunas) {
    comunas.forEach((comuna) => {
      const option = document.createElement("option");
      option.value = comuna.id;
      option.textContent = comuna.nombre;
      comunaSelect.appendChild(option);
    });
  }
};

regionSelect.addEventListener("change", actualizarComunas);

// Validadores
const validarNombre = (valor) => valor.trim().length >= 2;

const validarEmail = (valor) => {
  const re = /^[\w.+-]+@[a-zA-Z\d-]+\.[a-zA-Z]{2,}$/;
  return re.test(valor.trim());
};

const validarCelular = (valor) => {
  const re = /^(\+?56)?\s?9\s?\d{4}\s?\d{4}$/;
  return re.test(valor.trim());
};

const validarRegion = (valor) => valor !== "";

const validarComuna = (valor) => valor !== "";

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
  const emailValido = validarEmail(emailInput.value);
  const celularValido = validarCelular(celularInput.value);
  const regionValida = validarRegion(regionSelect.value);
  const comunaValida = validarComuna(comunaSelect.value);

  mostrarError(errorNombre, nombreValido);
  mostrarError(errorEmail, emailValido);
  mostrarError(errorCelular, celularValido);
  mostrarError(errorRegion, regionValida);
  mostrarError(errorComuna, comunaValida);

  const formularioValido =
    nombreValido &&
    emailValido &&
    celularValido &&
    regionValida &&
    comunaValida;

  if (formularioValido) {
    form.submit();
  }
});

// Inicialización
poblarRegiones();

// Si Flask nos devolvió el formulario con una región/comuna ya elegida
// (porque hubo un error de validación en el servidor), las restauramos.
if (REGION_SELECCIONADA) {
  regionSelect.value = REGION_SELECCIONADA;
  actualizarComunas();
  if (COMUNA_SELECCIONADA) {
    comunaSelect.value = COMUNA_SELECCIONADA;
  }
}
