// EcuaServer +593 — Secure Discord ATS status synchronization.
// Reuses the existing read-only BisectHosting API. No database mutations.
import { queryStatus } from './server-status.js';
import { timingSafeEqual } from 'node:crypto';

const ID = '85568392936670275';
const VALID_STATE = {
  online: { label:'🟢 En línea', color:0x2ecc71 },
  offline: { label:'🔴 Desconectado', color:0xe45460 },
  transitioning: { label:'🟡 Cambiando de estado', color:0xf2bf67 },
  unavailable: { label:'⚪ No disponible', color:0xe8b85e },
  unconfigured: { label:'⚪ No configurado', color:0xe8b85e }
};
const DISCORD_API = 'https://discord.com/api/webhooks/';
const NO_CACHE = { 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff' };

function equalSecret(a,b) {
  if (typeof a !== 'string' || typeof b !== 'string' || !b) return false;
  const lhs=Buffer.from(a),rhs=Buffer.from(b);
  return lhs.length===rhs.length && timingSafeEqual(lhs,rhs);
}
function discordUrl(raw) {
  try {
    const u=new URL(raw);
    if(u.protocol!=='https:' || u.hostname!=='discord.com' || u.search || u.hash ||
      !/^\/api\/webhooks\/\d{17,22}\/[A-Za-z0-9_-]+\/?$/.test(u.pathname)) return null;
    return DISCORD_API+u.pathname.slice('/api/webhooks/'.length).replace(/\/$/,'');
  } catch { return null; }
}
function cleanCount(n) { return Number.isInteger(n)&&n>=0&&n<=5000?String(n):'No disponible'; }
function duration(seconds){
  if(!Number.isInteger(seconds)||seconds<0)return 'No disponible';
  const d=Math.floor(seconds/86400),h=Math.floor(seconds%86400/3600),m=Math.floor(seconds%3600/60);
  return [d?d+' d':null,h?h+' h':null,(!d&&!h||m)?m+' min':null].filter(Boolean).join(' ');
}
function toEmbed(data) {
  const state=VALID_STATE[data.status]||VALID_STATE.unavailable;
  const online=data.status==='online';
  const date=data.checkedAt && !Number.isNaN(Date.parse(data.checkedAt))
    ?new Date(data.checkedAt).toISOString():null;
  return {
    title:'🇪🇨 ECUASERVER +593 · Estado de ATS',
    description:'**American Truck Simulator · Comunidad Ecuador**',
    color:state.color,
    fields:[
      {name:'Estado del servidor',value:state.label,inline:true},
      {name:'Jugadores conectados',value:online?cleanCount(data.players):data.status==='offline'?'0':'No disponible',inline:true},
      {name:'Tiempo activo',value:online?duration(data.uptimeSeconds):'No disponible',inline:true},
      {name:'Capacidad',value:online&&Number.isInteger(data.capacity)&&data.capacity>0?String(data.capacity):'No disponible',inline:true},
      {name:'ID del servidor ATS',value:'\`'+ID+'\`',inline:false}
    ],
    footer:{text:'EcuaServer +593 · Datos de BisectHosting · Actualización programada'},
    ...(date?{timestamp:date}:{})
  };
}
async function discordRequest(url,method,body) {
  const abort=AbortSignal.timeout(12000);
  const response=await fetch(url,{
    method,signal:abort,
    headers:{'Content-Type':'application/json','Accept':'application/json'},
    body:JSON.stringify(body)
  });
  if(!response.ok) {
    // Never include Discord URL, token or response body in errors/logs.
    const err=new Error('discord_write_failed');
    err.status=response.status;
    throw err;
  }
  return response.status===204?null:response.json();
}
export default async function handler(req,res) {
  for(const [k,v] of Object.entries(NO_CACHE))res.setHeader(k,v);
  if(req.method!=='POST'){
    res.setHeader('Allow','POST');
    return res.status(405).json({ok:false,error:'method_not_allowed'});
  }
  const token=process.env.DISCORD_SYNC_SECRET;
  const authorization=req.headers.authorization||'';
  if(!equalSecret(authorization.startsWith('Bearer ')?authorization.slice(7):'',token)){
    return res.status(401).json({ok:false,error:'unauthorized'});
  }
  const url=discordUrl(process.env.DISCORD_STATUS_WEBHOOK_URL);
  if(!url)return res.status(503).json({ok:false,error:'webhook_not_configured'});

  const storedId=process.env.DISCORD_STATUS_MESSAGE_ID;
  const bootstrap=req.query?.initialize==='1';
  if(!storedId&&!bootstrap){
    return res.status(409).json({ok:false,error:'message_id_required',hint:'initialize_once'});
  }
  if(bootstrap&&storedId){
    return res.status(409).json({ok:false,error:'already_initialized'});
  }
  if(storedId&&!/^\d{17,22}$/.test(storedId)){
    return res.status(503).json({ok:false,error:'invalid_message_id'});
  }

  try {
    const data=await queryStatus();
    const payload={
      username:'EcuaServer Monitor',
      allowed_mentions:{parse:[]},
      embeds:[toEmbed(data)]
    };
    if(bootstrap){
      const message=await discordRequest(url+'?wait=true','POST',payload);
      if(!/^\d{17,22}$/.test(String(message?.id||''))) {
        return res.status(502).json({ok:false,error:'missing_discord_message_id'});
      }
      // Return only the message ID so it can be placed in a Vercel env var.
      return res.status(201).json({ok:true,initialized:true,messageId:String(message.id)});
    }
    await discordRequest(url+'/messages/'+storedId,'PATCH',payload);
    return res.status(200).json({ok:true,updated:true,status:data.status,players:data.players??null});
  } catch (e) {
    const status=e?.status===404?404:e?.status===429?429:502;
    const error=e?.status===404?'message_missing':e?.status===429?'discord_rate_limited':'sync_failed';
    return res.status(status).json({ok:false,error});
  }
}
