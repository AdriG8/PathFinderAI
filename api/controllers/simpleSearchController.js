const searchResources = async (req, res) => {
  try {
    const { topic } = req.body;
    console.log('Buscando recursos para:', topic);

    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: 'El tema es requerido' });
    }

    // Limitar longitud del topic (máximo 200 caracteres)
    const safeTopic = String(topic).trim().substring(0, 200);
    if (!safeTopic) {
      return res.status(400).json({ error: 'El tema es requerido' });
    }

    const results = [];
    const API_KEY_YT = process.env.API_KEY_YT_SEARCH;

    if (API_KEY_YT) {
      try {
        const ytQuery = encodeURIComponent(safeTopic);
        const ytUrl = 'https://www.googleapis.com/youtube/v3/search?part=snippet&q=' + ytQuery + '&type=video&maxResults=3&key=' + API_KEY_YT;

        const ytResponse = await fetch(ytUrl);
        const ytData = await ytResponse.json();

        if (ytData.items && ytData.items.length > 0) {
          ytData.items.forEach((item) => {
            results.push({
              title: item.snippet.title,
              url: 'https://www.youtube.com/watch?v=' + item.id.videoId,
              thumbnail: item.snippet.thumbnails && item.snippet.thumbnails.medium ? item.snippet.thumbnails.medium.url : (item.snippet.thumbnails && item.snippet.thumbnails.default ? item.snippet.thumbnails.default.url : null),
              channel: item.snippet.channelTitle,
              type: 'video',
              description: item.snippet.description ? item.snippet.description.substring(0, 150) + '...' : ''
            });
          });
          console.log('YouTube: encontrados', ytData.items.length, 'videos');
        }
      } catch (ytError) {
        console.log('Error YouTube API:', ytError.message);
      }
    } else {
      const ytFallbackUrl = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(safeTopic);
      results.push({
        title: 'Buscar videos en YouTube: ' + safeTopic,
        url: ytFallbackUrl,
        type: 'video'
      });
    }

    try {
      const wikiQuery = encodeURIComponent(safeTopic);
      const wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + wikiQuery + '&limit=3&format=json&origin=*';

      const wikiResponse = await fetch(wikiUrl);
      const wikiData = await wikiResponse.json();

      if (wikiData[1] && wikiData[1].length > 0) {
        wikiData[1].forEach((title, index) => {
          results.push({
            title: title,
            url: wikiData[3][index],
            type: 'documentacion',
            description: 'Articulo de Wikipedia'
          });
        });
        console.log('Wikipedia: encontrados', wikiData[1].length, 'articulos');
      }
    } catch (wikiError) {
      console.log('Error Wikipedia:', wikiError.message);
    }

    console.log('Total recursos encontrados:', results.length);
    res.json({ results });

  } catch (err) {
    console.log('Error al buscar recursos:', err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  searchResources
};