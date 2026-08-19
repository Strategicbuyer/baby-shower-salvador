// api/reset-gifts.js
// Limpia todos los regalos tomados y el registro (solo para pruebas)
// Protegido con ?key=salvador2025

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { key } = req.query;
  if (key !== 'salvador2025') {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }

  try {
    const url   = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    // Borrar tanto el set de regalos como el hash del registro
    const pipeline = [
      ['del', 'taken_gifts'],
      ['del', 'registry']
    ];

    await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pipeline)
    });

    res.status(200).json({ ok: true, message: 'Base de datos limpiada correctamente' });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Error al limpiar la base de datos' });
  }
}
