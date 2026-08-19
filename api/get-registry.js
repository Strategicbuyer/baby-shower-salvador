// api/get-registry.js
// Devuelve el registro completo: quién escogió qué regalo
// Protegido con una clave secreta en el query param ?key=

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  // Protección simple: requiere ?key=salvador2025
  const { key } = req.query;
  if (key !== 'salvador2025') {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }

  try {
    const url   = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    // HGETALL registry → devuelve todos los campos del hash como objeto
    const response = await fetch(`${url}/hgetall/registry`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await response.json();

    // data.result viene como array plano: [campo1, valor1, campo2, valor2, ...]
    const raw = data.result || [];
    const registry = [];

    for (let i = 0; i < raw.length; i += 2) {
      try {
        const entry = JSON.parse(raw[i + 1]);
        registry.push(entry);
      } catch (e) {
        // ignorar entradas malformadas
      }
    }

    // Ordenar por fecha de registro (más reciente primero)
    registry.sort(function (a, b) { return b.date > a.date ? 1 : -1; });

    res.status(200).json({ ok: true, total: registry.length, registry });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Error al leer el registro' });
  }
}
