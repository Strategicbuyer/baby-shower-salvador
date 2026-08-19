// api/take-gift.js
// Marca un regalo como tomado guardándolo en Upstash Redis

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  const { gift } = req.body;

  if (!gift || typeof gift !== 'string' || gift.trim() === '') {
    res.status(400).json({ error: 'El campo gift es requerido' });
    return;
  }

  try {
    const url   = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    // SADD agrega el regalo al set "taken_gifts"
    // Si ya existe, Redis lo ignora (no hay duplicados en un set)
    const response = await fetch(`${url}/sadd/taken_gifts/${encodeURIComponent(gift.trim())}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Error en Upstash');
    }

    res.status(200).json({ ok: true, gift: gift.trim() });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Error al guardar el regalo' });
  }
}
