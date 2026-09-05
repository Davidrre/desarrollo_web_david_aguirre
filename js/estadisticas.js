// Referencias al DOM 
const totalVoluntariosElem = document.getElementById("total-voluntarios");
const totalAvistamientosElem = document.getElementById("total-avistamientos");
const graficoTipoElem = document.getElementById("grafico-tipo");
const graficoVoluntarioElem = document.getElementById("grafico-voluntario");

const NOMBRES_TIPO = {
  rapaz: "Rapaz",
  acuatica: "Acuática",
  paseriforme: "Paseriforme",
  playera: "Playera / costera",
};

// Indicadores generales
const mostrarIndicadores = () => {
  totalVoluntariosElem.textContent = VOLUNTARIOS.length;
  totalAvistamientosElem.textContent = AVISTAMIENTOS.length;
};

// Contar avistamientos agrupados por una propiedad (tipo o voluntario) 
const contarPorPropiedad = (propiedad) => {
  const conteo = {};

  AVISTAMIENTOS.forEach((avistamiento) => {
    const clave = avistamiento[propiedad];
    if (conteo[clave]) {
      conteo[clave]++;
    } else {
      conteo[clave] = 1;
    }
  });

  return conteo;
};

// Construir un gráfico de barras simple
const construirGraficoBarras = (contenedor, conteo, obtenerEtiqueta) => {
  contenedor.innerHTML = "";

  const valores = Object.values(conteo);
  const maximo = Math.max(...valores);

  for (const clave in conteo) {
    const cantidad = conteo[clave];
    const alturaPorcentaje = (cantidad / maximo) * 100;

    const barraContainer = document.createElement("div");
    barraContainer.className = "barra-container";

    const barra = document.createElement("div");
    barra.className = "barra";
    barra.style.height = alturaPorcentaje + "%";

    const valorBarra = document.createElement("span");
    valorBarra.className = "valor-barra";
    valorBarra.textContent = cantidad;
    barra.appendChild(valorBarra);

    const etiqueta = document.createElement("span");
    etiqueta.className = "etiqueta-barra";
    etiqueta.textContent = obtenerEtiqueta(clave);

    barraContainer.appendChild(barra);
    barraContainer.appendChild(etiqueta);
    contenedor.appendChild(barraContainer);
  }
};

// Inicialización 
mostrarIndicadores();

const conteoPorTipo = contarPorPropiedad("tipo");
construirGraficoBarras(graficoTipoElem, conteoPorTipo, (tipo) => NOMBRES_TIPO[tipo] || tipo);

const conteoPorVoluntario = contarPorPropiedad("voluntario");
construirGraficoBarras(graficoVoluntarioElem, conteoPorVoluntario, (voluntario) => voluntario);
