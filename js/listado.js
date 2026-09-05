// Referencias al DOM
const filtroTipoSelect = document.getElementById("filtro-tipo");
const ordenarPorSelect = document.getElementById("ordenar-por");
const cuerpoTabla = document.getElementById("cuerpo-tabla");
const sinResultados = document.getElementById("sin-resultados");
const tablaAvistamientos = document.getElementById("tabla-avistamientos");
const btnAnterior = document.getElementById("btn-anterior");
const btnSiguiente = document.getElementById("btn-siguiente");
const infoPagina = document.getElementById("info-pagina");

const ITEMS_POR_PAGINA = 5;
let paginaActual = 1;

// Nombres legibles para mostrar el tipo de ave en la tabla
const NOMBRES_TIPO = {
  rapaz: "Rapaz",
  acuatica: "Acuática",
  paseriforme: "Paseriforme",
  playera: "Playera / costera",
};

// Obtener avistamientos filtrados y ordenados
const obtenerAvistamientosProcesados = () => {
  const tipoSeleccionado = filtroTipoSelect.value;
  const criterioOrden = ordenarPorSelect.value;

  let resultado = AVISTAMIENTOS.slice();

  if (tipoSeleccionado !== "") {
    resultado = resultado.filter((a) => a.tipo === tipoSeleccionado);
  }

  resultado.sort((a, b) => {
    if (criterioOrden === "fecha-asc") {
      return new Date(a.fecha) - new Date(b.fecha);
    }
    if (criterioOrden === "fecha-desc") {
      return new Date(b.fecha) - new Date(a.fecha);
    }
    if (criterioOrden === "lugar-asc") {
      return a.lugar.localeCompare(b.lugar);
    }
    if (criterioOrden === "lugar-desc") {
      return b.lugar.localeCompare(a.lugar);
    }
    return 0;
  });

  return resultado;
};

// Renderizar la tabla según la página actual
const renderizarTabla = () => {
  const avistamientosProcesados = obtenerAvistamientosProcesados();
  const totalPaginas = Math.max(
    1,
    Math.ceil(avistamientosProcesados.length / ITEMS_POR_PAGINA)
  );

  // Si al filtrar quedamos en una página que ya no existe, volvemos a la última.
  if (paginaActual > totalPaginas) {
    paginaActual = totalPaginas;
  }

  const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const fin = inicio + ITEMS_POR_PAGINA;
  const avistamientosPagina = avistamientosProcesados.slice(inicio, fin);

  cuerpoTabla.innerHTML = "";

  avistamientosPagina.forEach((avistamiento) => {
    const fila = document.createElement("tr");

    const celdaAve = document.createElement("td");
    celdaAve.textContent = avistamiento.ave;

    const celdaTipo = document.createElement("td");
    celdaTipo.textContent = NOMBRES_TIPO[avistamiento.tipo] || avistamiento.tipo;

    const celdaLugar = document.createElement("td");
    celdaLugar.textContent = avistamiento.lugar;

    const celdaFecha = document.createElement("td");
    celdaFecha.textContent = avistamiento.fecha;

    const celdaVoluntario = document.createElement("td");
    celdaVoluntario.textContent = avistamiento.voluntario;

    fila.appendChild(celdaAve);
    fila.appendChild(celdaTipo);
    fila.appendChild(celdaLugar);
    fila.appendChild(celdaFecha);
    fila.appendChild(celdaVoluntario);

    cuerpoTabla.appendChild(fila);
  });

  const hayResultados = avistamientosProcesados.length > 0;
  tablaAvistamientos.hidden = !hayResultados;
  sinResultados.hidden = hayResultados;

  infoPagina.textContent = `Página ${paginaActual} de ${totalPaginas}`;
  btnAnterior.disabled = paginaActual <= 1;
  btnSiguiente.disabled = paginaActual >= totalPaginas;
};

// Eventos
filtroTipoSelect.addEventListener("change", () => {
  paginaActual = 1;
  renderizarTabla();
});

ordenarPorSelect.addEventListener("change", () => {
  paginaActual = 1;
  renderizarTabla();
});

btnAnterior.addEventListener("click", () => {
  if (paginaActual > 1) {
    paginaActual--;
    renderizarTabla();
  }
});

btnSiguiente.addEventListener("click", () => {
  paginaActual++;
  renderizarTabla();
});

// Inicialización
renderizarTabla();
