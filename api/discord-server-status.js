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
function eventEmbed(e){
  const time=typeof e.at==='string'&&!Number.isNaN(Date.parse(e.at))
    ?new Date(e.at).toISOString():new Date().toISOString();
  const base={
    footer:{text:'EcuaServer +593 · Registro automático ATS · Datos consultados cada ejecución'},
    timestamp:time
  };
  switch(e.type){
    case 'server_online':return {...base,title:'🟢 Servidor ATS encendido',
      description:'**EcuaServer +593** está en línea. ¡Buenas rutas! 🚛',color:0x2ecc71};
    case 'server_offline':return {...base,title:'🔴 Servidor ATS desconectado',
      description:'**EcuaServer +593** está fuera de línea.',color:0xe45460};
    case 'players_increased':
    case 'players_decreased':{
      const increase=e.type==='players_increased';
      const amount=Math.abs(Number(e.delta));
      const before=Number(e.previousPlayers),after=Number(e.players);
      if(!Number.isInteger(amount)||amount<1||amount>5000||
        !Number.isInteger(before)||before<0||!Number.isInteger(after)||after<0)return null;
      return {...base,title:increase?'🚛 Aumentó la cantidad de jugadores':'🚪 Disminuyó la cantidad de jugadores',
        description:(increase?'📈 **+':'📉 **−')+amount+'** jugador'+(amount===1?'':'es')+
          ' conectado'+(amount===1?'':'s')+' (cambio neto).',
        color:increase?0xe8b85e:0x688bbf,
        fields:[{name:'Antes',value:String(before),inline:true},
          {name:'Ahora',value:String(after),inline:true}],
        footer:{text:'EcuaServer +593 · Cambios netos: no identifica usuarios individuales'},
        timestamp:time};
    }
    default:return null;
  }
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
    const sample=await queryStatus();
    const queue=await rpc('ecuaserver_discord_log_poll',{
      p_secret:monitorSecret,p_status:sample.status,p_players:sample.players
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
