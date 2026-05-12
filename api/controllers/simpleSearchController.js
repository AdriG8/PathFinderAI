// =============================================
// CONTROLADORES DE BÚSQUEDA DE RECURSOS
// =============================================

// =============================================
// CONTROLADOR: Buscar recursos con Wikipedia y YouTube
// =============================================

const searchResources = async (req, res) => {
  try {
    // Extrae el tema del cuerpo de la peticion
    const { topic } = req.body;
    console.log('Buscando recursos para:', topic);

    // Valida que el tema no este vacio
    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: 'El tema es requerido' });
    }

    // Array para almacenar los resultados
    const results = [];

    // ============================================
    // 1. Buscar en Wikipedia API
    // ============================================
    // Codifica el tema para la URL
    const wikiQuery = encodeURIComponent(topic);
    // Construye la URL de la API de Wikipedia con opensearch
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${wikiQuery}&limit=2&format=json&origin=*`;

    try {
      // Realiza la peticion a Wikipedia
      const wikiResponse = await fetch(wikiUrl);
      const wikiData = await wikiResponse.json();

      // Si hay resultados, los procesa
      // wikiData[1] contiene los titulos, wikiData[3] contiene las URLs
      if (wikiData[1] && wikiData[1].length > 0) {
        wikiData[1].forEach((title, index) => {
          results.push({
            title: `${title}`,
            url: wikiData[3][index]
          });
        });
        console.log('Wikipedia: encontrados', wikiData[1].length, 'articulos');
      }
    } catch (wikiError) {
      // Captura errores de la API de Wikipedia
      console.log('Error Wikipedia:', wikiError.message);
    }

    // ============================================
    // 2. Generar URL de búsqueda YouTube
    // ============================================
    // Codifica el tema para la URL de YouTube
    const ytQuery = encodeURIComponent(topic);
    // Construye la URL de resultados de busqueda de YouTube
    const ytUrl = `https://www.youtube.com/results?search_query=${ytQuery}`;
    
    // Añade el enlace de YouTube a los resultados
    results.push({
      title: `Buscar en YouTube: ${topic}`,
      url: ytUrl
    });
    console.log('YouTube: URL de busqueda añadida');

    console.log('Total recursos encontrados:', results.length);
    res.json({ results });

  } catch (err) {
    console.log('Error al buscar recursos:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// =============================================
// EXPORTACIÓN DE MÓDULOS
// =============================================

module.exports = {
  searchResources
};
