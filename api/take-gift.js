// api/take-gift.js
// Marca un regalo como tomado y guarda nombre + teléfono + regalo en Upstash Redis

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  const { gift, name, phone } = req.body;

  if (!gift || typeof gift !== 'string' || gift.trim() === '') {
    res.status(400).json({ error: 'El campo gift es requerido' });
    return;
  }

  try {
    const url   = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    const giftClean = gift.trim();
    const timestamp = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });

    // Registro completo del invitado
    const entry = JSON.stringify({
      gift:  giftClean,
      name:  (name  || '').trim(),
      phone: (phone || '').trim(),
      date:  timestamp
    });

    // Pipeline: ejecuta dos comandos en una sola petición
    // 1. SADD taken_gifts <regalo>  → marca el regalo como tomado
    // 2. HSET registry <regalo> <entry>  → guarda el registro completo
    const pipeline = [
      ['sadd', 'taken_gifts', giftClean],
      ['hset', 'registry',    giftClean, entry]
    ];

    const response = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pipeline)
    });

    if (!response.ok) throw new Error('Error en Upstash');

    res.status(200).json({ ok: true, gift: giftClean });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Error al guardar el regalo' });
  }
}
