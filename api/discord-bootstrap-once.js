// TEMPORARY one-time Discord monitor initialization bridge.
// Authenticated with a high-entropy ephemeral nonce stored only in Vercel.
// REMOVE THIS FILE immediately after obtaining the message ID.
import { timingSafeEqual } from 'node:crypto';
function secureCompare(a,b){
  if(typeof a!=='string'||typeof b!=='string'||!b)return false;
  const x=Buffer.from(a),y=Buffer.from(b);
  return x.length===y.length && timingSafeEqual(x,y);
}
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Robots-Tag','noindex,nofollow');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({ok:false,error:'method_not_allowed'});}
  if(!secureCompare(req.query?.nonce,process.env.DISCORD_BOOTSTRAP_NONCE)){
    return res.status(404).json({ok:false,error:'not_found'});
  }
  if(process.env.DISCORD_STATUS_MESSAGE_ID)return res.status(409).json({ok:false,error:'already_initialized'});
  if(!process.env.DISCORD_SYNC_SECRET)return res.status(503).json({ok:false,error:'no_sync_secret'});
  try{
    const origin='https://www.ecuaserver.xyz';
    const response=await fetch(origin+'/api/discord-server-status?initialize=1',{
      method:'POST',
      headers:{Authorization:'Bearer '+process.env.DISCORD_SYNC_SECRET,'Content-Type':'application/json'},
      signal:AbortSignal.timeout(22000)
    });
    const body=await response.json();
    return res.status(response.status).json(body);
  }catch{
    return res.status(502).json({ok:false,error:'bootstrap_request_failed'});
  }
}
