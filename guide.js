(() => {
  'use strict';
  const storageKey = 'ecuaserver-guide-v1';
  const serverId = '85568392936670275';
  const discord = 'https://discord.gg/cTk2V9feYF';
  const steam = 'https://store.steampowered.com/app/270880/American_Truck_Simulator/';
  const whatsapp = 'https://wa.link/k18cir';
  const questions = [
    {title:'¿Tienes American Truck Simulator instalado?',description:'Para continuar, necesitas tener American Truck Simulator comprado e instalado en tu computadora.',answers:[
      {label:'Sí, ya lo tengo',text:'Configuración indicada. A continuación comprobaremos cómo consultar la compatibilidad de tu versión de ATS.'},
      {label:'No, necesito instalarlo',text:'Adquiere American Truck Simulator desde su página oficial de Steam. Instala el juego y completa las actualizaciones disponibles. Después vuelve a esta guía.',link:steam,cta:'Comprar ATS en Steam'},
      {label:'No estoy seguro',text:'Abre tu biblioteca de Steam y busca American Truck Simulator. Si aparece instalado, prueba iniciarlo. Si no está en la biblioteca, comprueba que lo hayas adquirido con tu cuenta.',link:steam,cta:'Consultar ATS en Steam'}
    ]},
    {title:'¿Tu versión de ATS es compatible?',description:'Consulta la versión compatible publicada por el equipo EcuaServer +593. No se mostrará un número de versión sin confirmación oficial.',answers:[
      {label:'Sí, es compatible',text:'Entendido. Continuaremos a Discord. Esta es una respuesta declarada: el asistente no comprueba automáticamente la versión de tu instalación.'},
      {label:'No estoy seguro',text:'Abre ATS y consulta el número de versión del juego. Compáralo con el anunciado por el equipo. Si no hay versión confirmada, pide información en Discord.',link:discord,cta:'Consultar en Discord'},
      {label:'Necesito actualizar ATS',text:'Cierra ATS, abre tu biblioteca de Steam y revisa las actualizaciones pendientes. Espera a que termine la descarga. Comprueba la compatibilidad con EcuaServer antes de conectarte.',link:discord,cta:'Confirmar versión en Discord'}
    ]},
    {title:'¿Ya estás en nuestro Discord?',description:'Discord es nuestro canal oficial para comunicarnos y recibir ayuda.',answers:[
      {label:'Sí, ya estoy dentro',text:'Perfecto. Ya formas parte del canal de comunicación de la comunidad. Continuaremos con el acceso al servidor.'},
      {label:'No, quiero unirme',text:'Abre la invitación oficial, inicia sesión en Discord y revisa los canales de bienvenida y las normas de la comunidad.',link:discord,cta:'Unirme a Discord'},
      {label:'Tengo problemas para entrar',text:'Comprueba que hayas iniciado sesión. Intenta abrir la invitación en la aplicación de Discord o en otro navegador. No compartas contraseñas ni códigos de seguridad.',link:discord,cta:'Reintentar invitación'}
    ]},
    {title:'¿Sabes cómo encontrar nuestro servidor?',description:'ID de nuestro servidor: '+serverId+'. Para sesiones Convoy de hasta 128 jugadores, el equipo indica revisar el comando g_max_convoy_size 128.',answers:[
      {label:'Sí, ya sé cómo conectarme',text:'Perfecto. Continúa con la información del Mapa Ecuador. Siempre podrás regresar a copiar el ID del servidor.',copy:serverId,cta:'Copiar ID del servidor'},
      {label:'No, necesito instrucciones',text:'Abre ATS y entra en Convoy. Busca la sesión usando los datos del servidor. Si la sesión utiliza más participantes de los predeterminados, comprueba las instrucciones del comando de consola g_max_convoy_size 128 para tu versión de ATS.',copy:serverId,cta:'Copiar ID del servidor',secondaryCopy:'g_max_convoy_size 128'},
      {label:'El servidor no aparece',text:'Comprueba primero el estado del servidor, la versión compatible de ATS y los filtros de búsqueda de Convoy. Revisa también la configuración g_max_convoy_size 128 indicada por el equipo. Si continúa el problema, pide ayuda en Discord.',copy:'g_max_convoy_size 128',cta:'Copiar comando',link:discord,secondaryCta:'Solicitar ayuda en Discord',status:true}
    ]},
    {title:'¿Necesitas información sobre el Mapa Ecuador?',description:'Consulta los detalles publicados por el equipo o solicita información de compra por WhatsApp.',answers:[
      {label:'Sí, quiero conocer el mapa',text:'Conoce el Mapa Ecuador mediante las fotografías y la información publicada por EcuaServer. Consulta con el equipo sus requisitos y contenido confirmado.',link:whatsapp,cta:'Consultar información del mapa'},
      {label:'Quiero información para comprarlo',text:'Solicita detalles de compra del Mapa Ecuador por el WhatsApp oficial. Los precios y las fechas deben confirmarse directamente con el equipo.',link:whatsapp,cta:'Consultar por WhatsApp'},
      {label:'No, gracias',text:'De acuerdo. Si más adelante necesitas información del mapa, puedes volver a esta etapa.'}
    ]},
    {title:'¿Tienes problemas para conectarte?',description:'Selecciona tu problema para recibir primero una solución y después la opción de soporte.',answers:[
      {label:'No, todo funciona',text:'Excelente. No necesitas realizar comprobaciones adicionales. Continúa a la confirmación final.'},
      {label:'El servidor no aparece',text:'1. Consulta el estado del servidor. 2. Revisa la versión compatible de ATS. 3. Comprueba los filtros de búsqueda de Convoy y el comando g_max_convoy_size 128 si corresponde. Si todavía no aparece, contacta al equipo en Discord.',status:true,link:discord,cta:'Pedir ayuda en Discord'},
      {label:'Me desconecto',text:'1. Comprueba la estabilidad de Internet. 2. Reinicia ATS. 3. Verifica la versión requerida. 4. Anota cualquier mensaje de error y el momento de desconexión. Si persiste, solicita ayuda.',link:discord,cta:'Pedir ayuda en Discord'},
      {label:'Tengo un problema con el mapa',text:'1. Comprueba que utilizas la versión correcta del mapa. 2. Revisa sus requisitos y el orden de carga oficial. 3. Conserva el mensaje de error y consulta al equipo antes de borrar archivos.',link:discord,cta:'Pedir ayuda en Discord'}
    ]},
    {title:'¿Terminaste de preparar tu conexión?',description:'Revisa tus respuestas y elige cómo continuar.',answers:[
      {label:'Sí, estoy listo',text:'¡Excelente! Ya conoces los pasos para formar parte de EcuaServer +593. ¡Nos vemos en la carretera!'},
      {label:'Quiero revisar un paso',text:'Puedes volver a las etapas anteriores y modificar tus respuestas. Los pasos omitidos permanecerán pendientes hasta que los revises.',review:true},
      {label:'Necesito ayuda adicional',text:'Revisa la información relacionada con tu problema y explica al equipo en Discord tu versión de ATS y cualquier mensaje de error que aparezca.',link:discord,cta:'Solicitar ayuda en Discord'}
    ]}
  ];
  const drawer = document.getElementById('guide-drawer');
  const overlay = document.getElementById('guide-overlay');
  const view = document.getElementById('guide-content');
  const progress = document.getElementById('guide-progress');
  const progressLabel = document.getElementById('guide-progress-label');
  const prev = document.getElementById('guide-prev');
  const next = document.getElementById('guide-next');
  const skip = document.getElementById('guide-skip');
  const soundInput = document.getElementById('guide-sounds');
  const live = document.getElementById('guide-announcement');
  if (!drawer || !overlay || !view || !progress || !prev || !next || !skip || !soundInput) return;
  const defaultState = () => ({step:0,answers:{},skipped:[],complete:false,rating:null,sounds:false});
  let state = defaultState(), opener = null, audioContext = null;
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (parsed && typeof parsed === 'object') {
      state.step = Number.isInteger(parsed.step) ? Math.max(0,Math.min(6,parsed.step)) : 0;
      state.answers = parsed.answers && typeof parsed.answers === 'object' ? parsed.answers : {};
      state.skipped = Array.isArray(parsed.skipped) ? parsed.skipped : [];
      state.complete = parsed.complete === true;
      state.rating = parsed.rating === true || parsed.rating === false ? parsed.rating : null;
      state.sounds = parsed.sounds === true;
    }
  } catch {}
  const save = () => {try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{}};
  const sound = () => {
    if (!state.sounds || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioContext ||= new Ctx();
      const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
      oscillator.type = 'sine';oscillator.frequency.value = 440;gain.gain.value = .012;
      oscillator.connect(gain);gain.connect(audioContext.destination);
      oscillator.start();oscillator.stop(audioContext.currentTime + .065);
    } catch {}
  };
  const el = (tag, cls, text) => {
    const node=document.createElement(tag);
    if (cls) node.className=cls;
    if (text!==undefined) node.textContent=text;
    return node;
  };
  const action = (parent, text, callback, secondary=false) => {
    const b=el('button','guide-action'+(secondary?' guide-secondary':''),text);
    b.type='button';b.addEventListener('click',callback);parent.append(b);return b;
  };
  const urlAction = (parent, text, url) => {
    const a=el('a','guide-action',text+' ↗');
    a.href=url;a.target='_blank';a.rel='noopener noreferrer';parent.append(a);
  };
  const copyAction = (parent, text, value) => action(parent,text,async()=>{
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw Error('clipboard');
      await navigator.clipboard.writeText(value);
      live.textContent='Copiado al portapapeles'; 
    } catch {live.textContent='No fue posible copiar. Selecciona este texto: '+value;}
  });
  const getAnswer = (step) => {
    const idx=state.answers[step];
    return Number.isInteger(idx) && questions[step]?.answers[idx] ? questions[step].answers[idx] : null;
  };
  async function loadStatus(host) {
    const label=el('p','guide-status','Consultando estado del servidor…');host.append(label);
    try {
      const response=await fetch('/api/server-status',{cache:'no-store'});
      if (!response.ok) throw Error('sin respuesta');
      const data=await response.json();
      if (!label.isConnected) return;
      const raw=data?.status ?? data?.server?.status ?? data?.online ?? data?.server?.online;
      if (raw === true || ['online','running','on','active'].includes(String(raw).toLowerCase())) label.textContent='Estado del servidor: en línea (según información disponible).';
      else if (raw === false || ['offline','stopped','off','inactive'].includes(String(raw).toLowerCase())) label.textContent='Estado del servidor: fuera de línea (según información disponible).';
      else label.textContent='Estado del servidor: no disponible.';
    } catch {if (label.isConnected)label.textContent='Estado del servidor: no disponible.';}
  }
  function render() {
    soundInput.checked=state.sounds;
    view.replaceChildren();progress.replaceChildren();
    progressLabel.textContent=state.complete?'Guía completada':'Paso '+(state.step+1)+' de 7';
    for(let i=0;i<7;i++){
      const seg=el('span',(state.complete || Object.prototype.hasOwnProperty.call(state.answers,i))?'done':i===state.step?'current':'');
      seg.title='Paso '+(i+1)+(state.skipped.includes(i)?' omitido':'');
      progress.append(seg);
    }
    if (state.complete) {
      const area=el('div','guide-complete');
      area.append(el('div','guide-complete-mark','✓'),el('h2','', '¡Guía completada!'),el('p','', '¡Excelente! Ya conoces los pasos para formar parte de EcuaServer +593. ¡Nos vemos en la carretera!'));
      const rating=el('div','guide-rating');rating.append(el('p','', '¿Te ayudó esta guía?'));
      action(rating,state.rating===true?'✓ Sí':'Sí',()=>{state.rating=true;save();render();},state.rating!==true);
      action(rating,state.rating===false?'✓ No':'No',()=>{state.rating=false;save();render();},state.rating!==false);
      area.append(rating);urlAction(area,'Unirme a Discord',discord);
      action(area,'Reiniciar guía',()=>{if(!window.confirm('¿Quieres reiniciar la guía y borrar las respuestas guardadas?'))return;state=defaultState();save();sound();render();},true);
      view.append(area);
    } else {
      const q=questions[state.step];
      view.append(el('h2','guide-step-title',q.title),el('p','guide-description',q.description));
      const opts=el('div','guide-options');
      q.answers.forEach((answer,index)=>{
        const b=el('button','guide-option');b.type='button';
        b.setAttribute('aria-pressed',String(state.answers[state.step]===index));
        b.append(el('span','guide-option-indicator'),el('span','',answer.label));
        b.addEventListener('click',()=>{
          state.answers[state.step]=index;state.skipped=state.skipped.filter(n=>n!==state.step);
          save();sound();render();
        });opts.append(b);
      });view.append(opts);
      const selected=getAnswer(state.step);
      if(selected){
        const box=el('section','guide-response');box.setAttribute('aria-label','Respuesta del asistente');
        box.append(el('strong','', 'Orientación para tu respuesta'),el('p','', selected.text));
        if(selected.copy) copyAction(box,selected.cta||'Copiar',selected.copy);
        if(selected.secondaryCopy) copyAction(box,'Copiar comando de Convoy',selected.secondaryCopy);
        if(selected.link) urlAction(box,selected.copy?(selected.secondaryCta||'Solicitar ayuda'):selected.cta||'Más información',selected.link);
        if(selected.status) loadStatus(box);
        if(selected.review)action(box,'Volver al primer paso',()=>{state.step=0;save();render();},true);
        view.append(box);
      }
    }
    const nav=state.complete;
    prev.hidden=nav;next.hidden=nav;skip.hidden=nav;
    prev.disabled=state.step===0;
    next.disabled=!getAnswer(state.step);
    next.textContent=state.step===6?'Completar guía':'Siguiente →';
  }
  const open=ev=>{
    opener=ev?.currentTarget || document.activeElement;
    overlay.hidden=false;drawer.hidden=false;drawer.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';render();
    document.getElementById('guide-close').focus();
    document.getElementById('mobile-menu-toggle')?.setAttribute('aria-expanded','false');
    document.getElementById('main-navigation')?.classList.remove('is-open','open','active');
  };
  const close=()=>{
    overlay.hidden=true;drawer.hidden=true;drawer.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
    if(opener?.isConnected)opener.focus();
  };
  document.querySelectorAll('[data-open-guide]').forEach(b=>b.addEventListener('click',ev=>{ev.preventDefault();open(ev);}));
  document.getElementById('guide-close').addEventListener('click',close);
  overlay.addEventListener('click',close);
  document.addEventListener('keydown',e=>{
    if(drawer.hidden)return;
    if(e.key==='Escape'){e.preventDefault();close();return;}
    if(e.key==='Tab'){
      const list=Array.from(drawer.querySelectorAll('button:not([disabled]):not([hidden]),a[href],input:not([disabled])')).filter(n=>n.getClientRects().length>0);
      if(!list.length)return;
      if(e.shiftKey && document.activeElement===list[0]){e.preventDefault();list[list.length-1].focus();}
      else if(!e.shiftKey && document.activeElement===list[list.length-1]){e.preventDefault();list[0].focus();}
    }
  });
  prev.addEventListener('click',()=>{if(state.step>0){state.step--;save();sound();render();}});
  skip.addEventListener('click',()=>{if(state.step===6)return;state.skipped=[...new Set([...state.skipped,state.step])];delete state.answers[state.step];state.step++;save();sound();render();});
  next.addEventListener('click',()=>{
    const selected=getAnswer(state.step);if(!selected)return;
    if(state.step===6){
      if(state.answers[6]===0){state.complete=true;save();sound();render();}
      else if(state.answers[6]===1){state.step=0;save();render();}
      else {live.textContent='Puedes solicitar ayuda desde la respuesta y volver a finalizar cuando estés listo.';}
    } else {state.step++;save();sound();render();}
  });
  soundInput.addEventListener('change',()=>{state.sounds=soundInput.checked;save();if(state.sounds)sound();});
  render();
})();