// Endpoint de solo lectura para EcuaServer +593.
// Credenciales exclusivamente en variables privadas de Vercel.
const PANEL_ORIGIN = 'https://games.bisecthosting.com';

function send(res, data, statusCode = 200) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.status(statusCode).json(data);
}

async function getJSON(url, token) {
  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' },
    signal: AbortSignal.timeout(6500)
  });
  if (!response.ok) throw new Error('Upstream status ' + response.status);
  return response.json();
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ status: 'unavailable', players: null });
  }

  const token = process.env.BISECT_API_TOKEN;
  const serverId = process.env.BISECT_SERVER_ID;
  if (!token || !serverId) {
    return send(res, { status: 'unconfigured', players: null, checkedAt: null });
  }
  // El identificador de Starbase NO es el ID de sesión de ATS.
  if (!/^[a-zA-Z0-9_-]{6,64}$/.test(serverId) || !/^ptlc_[a-zA-Z0-9]+$/.test(token)) {
    return send(res, { status: 'unavailable', players: null, checkedAt: null });
  }

  const base = PANEL_ORIGIN + '/api/client/servers/' + encodeURIComponent(serverId);
  try {
    const data = await getJSON(base + '/resources', token);
    const state = data?.attributes?.current_state ?? data?.attributes?.state ?? null;
    const status = state === 'running' ? 'online'
      : ['offline', 'stopped'].includes(state) ? 'offline'
      : ['starting', 'stopping'].includes(state) ? 'transitioning'
      : 'unavailable';

    let players = null;
    if (status === 'online') {
      try {
        const result = await getJSON(base + '/player/online', token);
        if (Array.isArray(result?.data)) players = result.data.length;
        else if (Array.isArray(result?.attributes?.players)) players = result.attributes.players.length;
        else if (Number.isInteger(result?.attributes?.online_players) && result.attributes.online_players >= 0) {
          players = result.attributes.online_players;
        }
      } catch {
        // La disponibilidad de /player/online depende de las funciones del juego.
        // No sustituir datos desconocidos por cero.
      }
    }
    return send(res, { status, players, checkedAt: new Date().toISOString() });
  } catch {
    return send(res, { status: 'unavailable', players: null, checkedAt: null });
  }
}
