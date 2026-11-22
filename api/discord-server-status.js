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
const BRAND = 0xE8B85E;
function validMetric(n,max=5000){return Number.isInteger(n)&&n>=0&&n<=max?n:null;}
function uptimeLabel(seconds){
  const n=validMetric(seconds,315360000);
  if(n===null)return 'No disponible';
  const d=Math.floor(n/86400),h=Math.floor(n%86400/3600),m=Math.floor(n%3600/60);
  return [d?d+' d':null,h?h+' h':null,(!d&&!h||m)?m+' min':null].filter(Boolean).join(' ');
}
function safePlayerName(raw){
  if(typeof raw!=='string'||raw.length>48)return null;
  const name=raw.replace(/[@\x00-\x1f\x7f\u200b-\u200f]/g,'')
    .replace(/[*_`~|<>\\]/g,'').trim();
  return name.length?name:null;
}
function playerLines(names,verb){
  if(!Array.isArray(names))return [];
  return names.slice(0,20).map(safePlayerName).filter(Boolean)
    .map(name=>'**'+name+'**, '+verb+' al servidor.');
}
function eventEmbed(e){
  const time=typeof e.at==='string'&&!Number.isNaN(Date.parse(e.at))
    ?new Date(e.at).toISOString():new Date().toISOString();
  const isOnline=e.type==='server_online';
  const isOffline=e.type==='server_offline';
  const increased=e.type==='players_increased';
  const decreased=e.type==='players_decreased';
  if(!isOnline&&!isOffline&&!increased&&!decreased)return null;
  const count=validMetric(e.players),cap=validMetric(e.capacity);
  const fields=[
    {name:'👥 Jugadores',value:(count===null?'—':String(count))+'/'+(cap&&cap>0?cap:'—'),inline:true},
    {name:'⏱️ Tiempo activo',value:isOffline?'No disponible':uptimeLabel(e.uptimeSeconds),inline:true}
  ];
  let description,color,title;
  if(isOnline){
    title='🟢 Servidor en línea';
    description='**EcuaServer +593** está disponible. ¡Buenas rutas! 🇪🇨';
    color=0x32B67A;
  }else if(isOffline){
    title='🔴 Servidor desconectado';
    description='**EcuaServer +593** está fuera de línea.';
    color=0xE45C65;
  }else{
    const amount=Math.abs(Number(e.delta));
    if(!Number.isInteger(amount)||amount<1||amount>5000||
      validMetric(e.previousPlayers)===null||count===null)return null;
    const entered=playerLines(e.playerNamesIn,'entró');
    const exited=playerLines(e.playerNamesOut,'salió');
    // Name-based notices only use validated differences between two complete rosters.
    // A single interval may contain both entries and exits.
    const lines=[...entered,...exited];
    description=lines.length?lines.join('\n')
      :(increased?'🚛 **+'+amount+'** jugador'+(amount===1?'':'es')+' conectado'+(amount===1?'':'s')+'.'
        :'🚪 **−'+amount+'** jugador'+(amount===1?'':'es')+' conectado'+(amount===1?'':'s')+' (cambio neto).');
    color=increased?BRAND:0x6E9FCE;
  }
  return { ...(title?{title}:{}),description,color,fields,timestamp:time };
}
async function send(webhook,embed){
  const response=await fetch(webhook+'?wait=true',{
    method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
    body:JSON.stringify({username:'EcuaServer Logs',allowed_mentions:{parse:[]},embeds:[embed]}),
    signal:AbortSignal.timeout(12000)
  });
  if(!response.ok){
    const err=new Error('discord_send_failed');
    err.status=response.status;
    throw err;
  }
  // Discord must confirm creation before the event is marked delivered.
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
      const embed=eventEmbed(e);
      if(!embed||!/^[0-9a-f-]{36}$/i.test(String(e.id||'')))
        throw new Error('invalid_event');
      await send(webhook,embed);
      await rpc('ecuaserver_discord_log_ack',{p_secret:monitorSecret,p_id:e.id});
      sent++;
    }
    return res.status(200).json({ok:true,mode:'event_log',sent,
      status:sample.status,players:sample.players??null});
  }catch(e){
    return res.status(e?.status===429?429:502).json({
      ok:false,error:e?.status===429?'discord_rate_limited':'event_log_failed'
    });
  }
}
