// Alias administrativo validado en servidor: nunca se envía el correo interno al navegador.
const URL='https://oukgdzfhqeygocmxuiwt.supabase.co';
const KEY='sb_publishable_1U6UEZiyArZL2wswqNfdAA_PSiZesM1';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Método no permitido'});}
 const username=req.body?.username, password=req.body?.password;
 if(typeof username!=='string'||username.trim().toUpperCase()!=='ANDRES'||typeof password!=='string'||password.length<1||password.length>256)
   return res.status(401).json({error:'Usuario o contraseña incorrectos.'});
 const email=process.env.ECUA_ADMIN_EMAIL;
 if(!email)return res.status(503).json({error:'Acceso temporalmente no disponible.'});
 try{
   const r=await fetch(URL+'/auth/v1/token?grant_type=password',{
     method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},
     body:JSON.stringify({email,password}),signal:AbortSignal.timeout(9000)
   });
   if(!r.ok)return res.status(401).json({error:'Usuario o contraseña incorrectos.'});
   const data=await r.json();
   if(typeof data.access_token!=='string'||typeof data.refresh_token!=='string')throw Error('Sesión inválida');
   // Retornar solamente los campos necesarios para la sesión de Supabase Auth.
   return res.status(200).json({access_token:data.access_token,refresh_token:data.refresh_token,expires_at:data.expires_at,expires_in:data.expires_in,token_type:data.token_type});
 }catch{return res.status(503).json({error:'No fue posible iniciar sesión. Inténtalo nuevamente.'});}
}
