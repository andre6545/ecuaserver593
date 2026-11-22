// EcuaServer +593 · Consulta de solo lectura a Starbase.
// Nunca se exponen credenciales ni la respuesta original del hosting.
const PANEL_ORIGIN = 'https://games.bisecthosting.com';
const validInt = (value, max) => Number.isInteger(value) && value >= 0 && value <= max ? value : null;

async function getJSON(path, token) {
  const r = await fetch(path, {
    method: 'GET',
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' },
    signal: AbortSignal.timeout(7000)
  });
  if (!r.ok) throw Error('Starbase no disponible');
  return r.json();
}

function verifiedPlayerNames(data, expectedCount) {
  // Only a complete, distinct roster is eligible for Discord event labels.
  const roster = Array.isArray(data?.data) ? data.data
    : Array.isArray(data?.attributes?.players) ? data.attributes.players : null;
  if (!roster || !Number.isInteger(expectedCount) || roster.length !== expectedCount ||
      roster.length > 128) return null;
  const names = roster.map(item => {
    if (!item || typeof item !== 'object') return null;
    const a = item.attributes && typeof item.attributes === 'object' ? item.attributes : item;
    const name = a.name ?? a.username ?? a.player_name ?? a.display_name;
    return typeof name === 'string' ? name.trim() : null;
  });
  if (names.some(n => !n || n.length > 48 || /[\x00-\x1f\x7f]/.test(n))) return null;
  if (new Set(names.map(n => n.toLocaleLowerCase('en'))).size !== names.length) return null;
  return names;
}

export async function queryStatus({ includePlayerNames = false } = {}) {
  const token = process.env.BISECT_API_TOKEN;
  const id = process.env.BISECT_SERVER_ID;
  const fallback = { status:'unavailable', players:null, uptimeSeconds:null, capacity:null, checkedAt:null };
  if (!token || !id) return { ...fallback, status:'unconfigured' };
  if (!/^ptlc_[a-zA-Z0-9]+$/.test(token) || !/^[a-zA-Z0-9_-]{6,64}$/.test(id)) return fallback;

  const url = PANEL_ORIGIN + '/api/client/servers/' + encodeURIComponent(id);
  try {
    const body = await getJSON(url + '/resources', token);
    const a = body?.attributes || {};
    const state = a.current_state ?? a.state;
    const status = state === 'running' ? 'online'
      : ['offline','stopped'].includes(state) ? 'offline'
      : ['starting','stopping'].includes(state) ? 'transitioning' : 'unavailable';
    const uptimeMs = a.resources?.uptime;
    const uptimeSeconds = status === 'online' && Number.isFinite(uptimeMs) && uptimeMs >= 0
      ? validInt(Math.floor(uptimeMs / 1000), 315360000) : null;

    let players = null, capacity = null, playerNames = null;
    if (status === 'online') {
      const [online, details] = await Promise.allSettled([
        getJSON(url + '/player/online', token),
        getJSON(url, token)
      ]);
      if (online.status === 'fulfilled') {
        const data = online.value;
        if (Array.isArray(data?.data)) players = validInt(data.data.length, 5000);
        else if (Array.isArray(data?.attributes?.players)) players = validInt(data.attributes.players.length, 5000);
        else players = validInt(data?.attributes?.online_players, 5000);
        if (includePlayerNames) playerNames = verifiedPlayerNames(data, players);
      }
      if (details.status === 'fulfilled') {
        const b = details.value?.attributes || {};
        // Solo campos que explícitamente designan un límite de jugadores;
        // no inferir capacidad desde memoria RAM, CPU o límites de funciones.
        const candidates = [b.max_players,b.player_limit,b.game?.max_players,b.configuration?.max_players];
        for (const n of candidates) {
          if (Number.isInteger(n) && n > 0 && n <= 5000) { capacity=n; break; }
        }
      }
    }
    return { status, players, uptimeSeconds, capacity, checkedAt:new Date().toISOString(),
      ...(includePlayerNames ? { playerNames } : {}) };
  } catch {
    return fallback;
  }
}

export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Cache-Control',req.query?.refresh === '1'
    ? 'public, s-maxage=30, stale-while-revalidate=30'
    : 'public, s-maxage=60, stale-while-revalidate=120');
  if (req.method !== 'GET') {
    res.setHeader('Allow','GET');
    return res.status(405).json({status:'unavailable',players:null,capacity:null,uptimeSeconds:null,checkedAt:null});
  }
  const data = await queryStatus();
  return res.status(200).json(data);
}
