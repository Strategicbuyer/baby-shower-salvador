// api/get-gifts.js
// Devuelve la lista de regalos ya tomados guardados en Upstash Redis

export default async function handler(req, res) {
  // Permitir CORS para que el HTML pueda llamar esta API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    const url   = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    // SMEMBERS devuelve todos los miembros del set "taken_gifts"
    const response = await fetch(`${url}/smembers/taken_gifts`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await response.json();
    // data.result es el array de regalos tomados (o [] si no hay ninguno)
    const taken = Array.isArray(data.result) ? data.result : [];

    res.status(200).json({ taken });
  } catch (err) {
    res.status(500).json({ taken: [], error: 'Error al leer los regalos' });
  }
}
