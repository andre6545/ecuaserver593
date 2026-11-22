// TEMPORARY smoke-test bridge. Remove after verifying the new Discord event log.
// Only a high entropy Vercel-controlled nonce may invoke the authenticated POST.
import {timingSafeEqual} from 'node:crypto';
function eq(a,b){if(typeof a!=='string'||typeof b!=='string'||!b)return false;const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Robots-Tag','noindex,nofollow');
  if(req.method!=='GET'||!eq(req.query?.nonce,process.env.DISCORD_BOOTSTRAP_NONCE))return res.status(404).json({ok:false});
  try{
    const r=await fetch('https://www.ecuaserver.xyz/api/discord-server-status',{
      method:'POST',headers:{Authorization:'Bearer '+process.env.DISCORD_SYNC_SECRET,'Content-Type':'application/json'},
      signal:AbortSignal.timeout(25000)
    });
    return res.status(r.status).json(await r.json());
  }catch{return res.status(502).json({ok:false,error:'test_bridge_failed'});}
}
