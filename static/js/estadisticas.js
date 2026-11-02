// Pide los datos a una URL del servidor (mismo patrón de fetch del Aux 7)
const pedirDatos = (url) => {
  return fetch(url) // 1 acceder a la URL
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json(); // 2 parseamos el response a un json
    })
    .then((respuesta) => respuesta["data"]); // 3 nos quedamos con la lista de datos
};

// Gráfico de líneas: avistamientos por día
const graficoLineas = () => {
  const contenedor = document.getElementById("grafico-dias");

  pedirDatos(contenedor.dataset.url)
    .then((data) => {
      if (data.length === 0) {
        contenedor.textContent = "Aún no hay avistamientos para mostrar.";
        return;
      }
      Highcharts.chart(contenedor, {
        chart: { type: "line" },
        title: { text: "Avistamientos por día" },
        xAxis: {
          categories: data.map((fila) => fila.fecha), // eje X: los días
          title: { text: "Día" },
        },
        yAxis: {
          min: 0,
          allowDecimals: false,
          title: { text: "Cantidad de avistamientos" },
        },
        series: [
          { name: "Avistamientos", data: data.map((fila) => fila.total) },
        ],
      });
    })
    .catch((error) => {
      console.error("No se pudo cargar el gráfico de líneas:", error);
      contenedor.textContent = "No se pudo cargar el gráfico.";
    });
};

// Gráfico de torta: avistamientos por tipo de ave
const graficoTorta = () => {
  const contenedor = document.getElementById("grafico-aves");

  pedirDatos(contenedor.dataset.url)
    .then((data) => {
      if (data.length === 0) {
        contenedor.textContent = "Aún no hay avistamientos para mostrar.";
        return;
      }
      Highcharts.chart(contenedor, {
        chart: { type: "pie" },
        title: { text: "Total de avistamientos por tipo de ave" },
        series: [
          {
            name: "Avistamientos",
            // la torta pide pares nombre / valor
            data: data.map((fila) => ({ name: fila.ave, y: fila.total })),
          },
        ],
      });
    })
    .catch((error) => {
      console.error("No se pudo cargar el gráfico de torta:", error);
      contenedor.textContent = "No se pudo cargar el gráfico.";
    });
};

// Gráfico de barras: voluntarios registrados por comuna
// (en Highcharts las barras verticales se llaman "column")
const graficoBarras = () => {
  const contenedor = document.getElementById("grafico-comunas");

  pedirDatos(contenedor.dataset.url)
    .then((data) => {
      if (data.length === 0) {
        contenedor.textContent = "Aún no hay voluntarios para mostrar.";
        return;
      }
      Highcharts.chart(contenedor, {
        chart: { type: "column" },
        title: { text: "Voluntarios registrados por comuna" },
        xAxis: {
          categories: data.map((fila) => fila.comuna), // eje X: las comunas
          title: { text: "Comuna" },
        },
        yAxis: {
          min: 0,
          allowDecimals: false,
          title: { text: "Total de voluntarios" },
        },
        series: [
          { name: "Voluntarios", data: data.map((fila) => fila.total) },
        ],
      });
    })
    .catch((error) => {
      console.error("No se pudo cargar el gráfico de barras:", error);
      contenedor.textContent = "No se pudo cargar el gráfico.";
    });
};

graficoLineas();
graficoTorta();
graficoBarras();
