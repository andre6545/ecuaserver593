// EcuaServer +593 · ATS event log for Discord.
// Reuses the existing BisectHosting query and independent Supabase outbox.
// Only confirmed state transitions and net player-count changes are announced.
// Does not identify individual players without authenticated player identity data.
import { queryStatus } from './server-status.js';
import { timingSafeEqual } from 'node:crypto';

const SUPABASE = 'https://oukgdzfhqeygocmxuiwt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_1U6UEZiyArZL2wswqNfdAA_PSiZesM1';

function equalSecret(a,b){
  if(typeof a!=='string'||typeof b!=='string'||!b)return false;
  const x=Buffer.from(a),y=Buffer.from(b);
  return x.length===y.length&&timingSafeEqual(x,y);
}
function safeWebhook(raw){
  try {
    const u=new URL(raw);
    if(u.protocol!=='https:'||u.hostname!=='discord.com'||u.search||u.hash||
      !/^\/api\/webhooks\/\d{17,22}\/[A-Za-z0-9_-]+\/?$/.test(u.pathname))return null;
    return u.origin+u.pathname.replace(/\/$/,'');
  } catch{return null;}
}
async function rpc(name,payload){
  const response=await fetch(SUPABASE+'/rest/v1/rpc/'+name,{
    method:'POST',
    headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json','Accept':'application/json'},
    body:JSON.stringify(payload),
    signal:AbortSignal.timeout(9500)
  });
  if(!response.ok)throw new Error('state_store_failed');
  return response.json();
}
// Plain-text ATS join/leave notices. Never guess the server capacity.
function count(n){return Number.isInteger(n)&&n>=0&&n<=5000?n:null;}
function cleanName(raw){
  if(typeof raw!=='string'||raw.length>48)return null;
  const name=raw.replace(/[@\x00-\x1f\x7f\u200b-\u200f]/g,'')
    .replace(/[*_`~|<>\\]/g,'').trim();
  return name||null;
}
function formatOccupancy(connected,capacity){
  const max=count(capacity);
  return '('+(count(connected)??'—')+'/'+(max!==null&&max>0?max:'—')+')';
}
function eventMessages(e){
  // User requested only join/leave logs; suppress status-only notifications.
  if(e.type!=='players_increased'&&e.type!=='players_decreased')return [];
  const before=count(e.previousPlayers),after=count(e.players);
  if(before===null||after===null)return [];
  const entered=Array.isArray(e.playerNamesIn)?e.playerNamesIn.map(cleanName).filter(Boolean):[];
  const departed=Array.isArray(e.playerNamesOut)?e.playerNamesOut.map(cleanName).filter(Boolean):[];
  const capacity=e.capacity;
  const result=[];
  if(entered.length||departed.length){
    // Counts after each named movement are derived from the two observed rosters.
    // When both entry and exit occurred between polls, exact order is unknown:
    // display the final observed occupancy rather than invent event ordering.
    const mixed=entered.length>0&&departed.length>0;
    let occupancy=before;
    for(const name of departed){
      if(!mixed)occupancy=Math.max(0,occupancy-1);
      result.push('⬅️ *'+name+'*, salió del servidor. '+formatOccupancy(mixed?after:occupancy,capacity));
    }
    for(const name of entered){
      if(!mixed)occupancy++;
      result.push('➡️ *'+name+'*, entró al servidor. '+formatOccupancy(mixed?after:occupancy,capacity));
    }
    return result;
  }
  // No reliable names: keep a truthful count-change notification.
  const delta=after-before;
  if(delta===0)return [];
  return [(delta>0?'➡️ Entraron ':'⬅️ Salieron ')+Math.abs(delta)+
    ' jugador'+(Math.abs(delta)===1?'':'es')+' del servidor. '+formatOccupancy(after,capacity)];
}
async function send(webhook,content){
  const response=await fetch(webhook+'?wait=true',{
    method:'POST',
    headers:{'Content-Type':'application/json','Accept':'application/json'},
    body:JSON.stringify({
      username:'EcuaServer Logs',
      content,
      allowed_mentions:{parse:[]},
      embeds:[]
    }),
    signal:AbortSignal.timeout(12000)
  });
  if(!response.ok){
    const err=new Error('discord_send_failed');
    err.status=response.status;
    throw err;
  }
  const message=await response.json();
  if(!/^\d{17,22}$/.test(String(message?.id||'')))throw new Error('discord_message_not_confirmed');
}
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('X-Robots-Tag','noindex,nofollow');
  if(req.method!=='POST'){
    res.setHeader('Allow','POST');
    return res.status(405).json({ok:false,error:'method_not_allowed'});
  }
  const supplied=(req.headers.authorization||'').replace(/^Bearer /,'');
  if(!equalSecret(supplied,process.env.DISCORD_SYNC_SECRET))
    return res.status(401).json({ok:false,error:'unauthorized'});
  const webhook=safeWebhook(process.env.DISCORD_STATUS_WEBHOOK_URL);
  const monitorSecret=process.env.ECUA_MONITOR_SECRET;
  if(!webhook||!monitorSecret)
    return res.status(503).json({ok:false,error:'integration_not_configured'});

  try {
    const sample=await queryStatus({includePlayerNames:true});
    const queue=await rpc('ecuaserver_discord_log_poll_v2',{
      p_secret:monitorSecret,p_status:sample.status,p_players:sample.players,
      p_capacity:sample.capacity,p_uptime_seconds:sample.uptimeSeconds,
      p_player_names:sample.playerNames??null
    });
    if(!Array.isArray(queue))throw new Error('invalid_event_queue');
    let sent=0;
    for(const e of queue.slice(0,10)){
      if(!/^[0-9a-f-]{36}$/i.test(String(e.id||'')))throw new Error('invalid_event');
      const messages=eventMessages(e);
      for(const content of messages){
        await send(webhook,content);
        sent++;
      }
      await rpc('ecuaserver_discord_log_ack',{p_secret:monitorSecret,p_id:e.id});
    }
    return res.status(200).json({ok:true,mode:'event_log',sent,
      status:sample.status,players:sample.players??null});
  }catch(e){
    return res.status(e?.status===429?429:502).json({
      ok:false,error:e?.status===429?'discord_rate_limited':'event_log_failed'
    });
  }
}
