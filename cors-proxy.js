import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;
const accessToken = process.env.ACCESS_TOKEN;

app.use(cors());

// Ruta GET que actúa como proxy para buscar productos
app.get('/api/search', async (req, res) => {
   // Término de búsqueda enviado desde el frontend
  const query = req.query.q;
   // Límite de resultados (por defecto 3)
  const limit = req.query.limit || 3;

  try {
    console.log(`[Proxy] Buscando: "${query}", limit: ${limit}`);

    // Hace la petición a la API de Mercado Libre usando el access token
    const response = await axios.get('https://api.mercadolibre.com/products/search', {
      params: { q: query, limit, site_id: 'MLM', status: 'active' },
      headers: {
        Authorization: `Bearer $ACCESS_TOKEN`
      }
    });

    // Devuelve solo los resultados al frontend
    res.json(response.data.results);
  } catch (error) {
    console.error('[Proxy] Error al buscar en MercadoLibre');
    // Si hubo respuesta del servidor de Mercado Libre
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      // Si fue un error de red u otro
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Error interno en el proxy' });
    }
  }
});

// Inicia el servidor en el puerto definido
app.listen(PORT, () => {
  console.log(`Servidor proxy corriendo en http://localhost:${PORT}`);
});