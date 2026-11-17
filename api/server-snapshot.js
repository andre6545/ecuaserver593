// Muestra programada con autenticación separada: solo lectura al hosting.
// Escritura exclusivamente en la tabla de historial de EcuaServer.
import { timingSafeEqual } from 'node:crypto';
import { queryStatus } from './server-status.js';

const URL = 'https://oukgdzfhqeygocmxuiwt.supabase.co';
const PUBLIC_KEY = 'sb_publishable_1U6UEZiyArZL2wswqNfdAA_PSiZesM1';

function checkSecret(candidate,secret) {
  if (typeof candidate !== 'string' || typeof secret !== 'string') return false;
  const given = Buffer.from(candidate);
  const expected = Buffer.from(secret);
  return given.length === expected.length && given.length >= 32 && timingSafeEqual(given,expected);
}

export default async function handler(req,res) {
  res.setHeader('Cache-Control','private, no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method !== 'GET') {res.setHeader('Allow','GET');return res.status(405).json({ok:false});}
  const secret=process.env.ECUA_MONITOR_SECRET;
  const supplied=(req.headers.authorization||'').replace(/^Bearer /,'');
  if(!checkSecret(supplied,secret)) return res.status(401).json({ok:false});
  try {
    const sample=await queryStatus();
    if(sample.status==='unconfigured') return res.status(503).json({ok:false,state:'unconfigured'});
    const result=await fetch(URL+'/rest/v1/rpc/ecuaserver_record_server_sample',{
      method:'POST',
      headers:{apikey:PUBLIC_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({
        p_secret:secret,p_status:sample.status,
        p_players:sample.players,p_capacity:sample.capacity,
        p_uptime_seconds:sample.uptimeSeconds,p_checked_at:sample.checkedAt
      }),
      signal:AbortSignal.timeout(10000)
    });
    if(!result.ok) return res.status(502).json({ok:false});
    return res.status(200).json({ok:true,state:sample.status});
  } catch {
    return res.status(503).json({ok:false});
  }
}
