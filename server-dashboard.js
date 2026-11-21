/* EcuaServer +593: estado, disponibilidad, jugadores y avisos públicos.
   Nunca contiene tokens privados de BisectHosting. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const badge = $('server-status-state');
  if (!badge) return;
  const players = $('server-status-players');
  const bannerCard = document.querySelector('.banner-live-card');
  const bannerState = $('banner-server-state');
  const bannerPlayers = $('banner-server-players');
  function syncBanner(state, value) {
    if (!bannerCard || !bannerState || !bannerPlayers) return;
    bannerCard.dataset.status = state;
    bannerState.textContent = labels[state] || labels.unavailable;
    bannerPlayers.textContent = Number.isInteger(value) && value >= 0 ? String(value) : '—';
  }

  const updated = $('server-status-updated');
  const playersField = $('server-players-field');
  const playersSubtitle = $('server-players-subtitle');
  const refresh = $('server-refresh');
  const uptime = $('server-uptime');
  const capacityText = $('server-occupancy-text');
  const occupancyBar = $('server-occupancy-bar');
  const occupancyFill = $('server-occupancy-fill');
  const notice = $('server-notice');
  const noticeText = $('server-notice-text');
  const historyTrack = $('server-history-track');
  const playerTrack = $('server-player-track');
  const historyInfo = $('server-history-info');
  const availability = $('server-availability');
  const peak = $('server-peak');
  const average = $('server-average');
  const periodButtons = [...document.querySelectorAll('[data-history-period]')];
  const SUPABASE = 'https://oukgdzfhqeygocmxuiwt.supabase.co';
  const KEY = 'sb_publishable_1U6UEZiyArZL2wswqNfdAA_PSiZesM1';
  const labels = {
    online:'En línea',offline:'Desconectado',transitioning:'Cambiando de estado',
    unconfigured:'Sin configurar',unavailable:'No disponible'
  };
  let dataRows = [], periodHours = 24, loading = false, lastManual = 0;

  function showPlayers(value) {
    if (!Number.isInteger(value) || value < 0) {
      players.textContent = '—';
      playersField.dataset.players = 'unknown';
      playersSubtitle.textContent = 'Dato no disponible';
    } else {
      players.textContent = String(value);
      playersField.dataset.players = value > 0 ? 'active' : 'empty';
      playersSubtitle.textContent = value === 0 ? 'Sin jugadores conectados'
        : value === 1 ? '1 jugador en el servidor' : value + ' jugadores en el servidor';
    }
  }
  function formatUptime(seconds) {
    if (!Number.isInteger(seconds) || seconds < 0) return '—';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor(seconds % 86400 / 3600);
    const mins = Math.floor(seconds % 3600 / 60);
    return (days ? days + ' d ' : '') + (days || hours ? hours + ' h ' : '') + mins + ' min';
  }
  async function loadStatus(force = false) {
    if (loading) return;
    loading = true;
    if (force) { refresh.disabled = true; refresh.setAttribute('aria-busy','true'); }
    try {
      const response = await fetch('/api/server-status' + (force ? '?refresh=1' : ''), {cache:'no-store'});
      if (!response.ok) throw new Error('No disponible');
      const data = await response.json();
      const state = Object.prototype.hasOwnProperty.call(labels,data.status) ? data.status : 'unavailable';
      badge.dataset.state = state;
      badge.textContent = labels[state];
      syncBanner(state,data.players);
      showPlayers(data.players);
      uptime.textContent = state === 'online' ? formatUptime(data.uptimeSeconds) : '—';
      const hasCapacity = state === 'online'
        && Number.isInteger(data.capacity) && data.capacity > 0
        && Number.isInteger(data.players) && data.players >= 0;
      capacityText.textContent = hasCapacity
        ? data.players + ' / ' + data.capacity + ' jugadores'
        : 'Capacidad no disponible';
      occupancyBar.hidden = !hasCapacity;
      if (hasCapacity) {
        const pct = Math.round(100 * Math.min(data.players / data.capacity,1));
        occupancyFill.style.width = pct + '%';
        occupancyBar.setAttribute('aria-valuenow',String(pct));
      }
      if (state === 'unconfigured') {
        updated.textContent = 'La conexión con el servidor todavía no está configurada.';
      } else if (typeof data.checkedAt === 'string' && !Number.isNaN(Date.parse(data.checkedAt))) {
        updated.textContent = 'Última consulta: ' + new Date(data.checkedAt).toLocaleString('es-EC',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'});
      } else {
        updated.textContent = 'No fue posible verificar los datos del servidor.';
      }
    } catch {
      badge.dataset.state = 'unavailable';
      badge.textContent = 'No disponible';
      syncBanner('unavailable',null);
      showPlayers(null);
      uptime.textContent = '—';
      capacityText.textContent = 'Capacidad no disponible';
      occupancyBar.hidden = true;
      updated.textContent = 'No fue posible verificar los datos del servidor.';
    } finally {
      loading = false;
      refresh.removeAttribute('aria-busy');
      if (force) {
        const ms = Math.max(0,30000 - (Date.now() - lastManual));
        setTimeout(() => { refresh.disabled = false; },ms);
      }
    }
  }
  refresh.addEventListener('click',async () => {
    if (loading || Date.now() - lastManual < 30000) return;
    lastManual = Date.now();
    await loadStatus(true);
    await Promise.allSettled([loadHistory(),loadNotice()]);
  });

  async function getPublic(tableQuery) {
    const r = await fetch(SUPABASE + '/rest/v1/' + tableQuery, {headers:{apikey:KEY}});
    if (!r.ok) throw new Error('Servicio no disponible');
    return r.json();
  }
  async function loadNotice() {
    try {
      const rows = await getPublic('ecuaserver_server_notice?select=enabled,message&id=eq.1');
      const record = rows[0];
      const message = typeof record?.message === 'string' ? record.message.trim() : '';
      notice.hidden = !(record?.enabled && message);
      noticeText.textContent = record?.enabled ? message : '';
    } catch { notice.hidden = true; noticeText.textContent = ''; }
  }
  function makeBar(cls, state, label, height = null) {
    const wrap = document.createElement('div');
    wrap.className = cls;
    wrap.title = label;
    wrap.setAttribute('aria-label',label);
    const span = document.createElement('span');
    span.className = cls + '-fill';
    if (state) span.dataset.state = state;
    if (height !== null) span.style.height = height + '%';
    wrap.append(span);
    return wrap;
  }
  function drawHistory() {
    const count = periodHours === 24 ? 24 : 7;
    const step = periodHours === 24 ? 3600000 : 86400000;
    const start = Date.now() - count * step;
    const bins = Array.from({length:count},() => ({on:0,off:0,unknown:0,max:null,total:0,knownPlayers:0}));
    let matched = 0, onlineCount = 0, offlineCount = 0, totalPlayers = 0, totalPlayerSamples = 0, peakPlayers = null;
    for (const row of dataRows) {
      const t = Date.parse(row.bucket_at);
      const i = Math.floor((t-start)/step);
      if (!Number.isFinite(t) || i<0 || i>=count) continue;
      matched++;
      const bin = bins[i];
      if (row.status === 'online') {bin.on++;onlineCount++;}
      else if (row.status === 'offline') {bin.off++;offlineCount++;}
      else bin.unknown++;
      if (Number.isInteger(row.players) && row.players >= 0) {
        bin.knownPlayers++;bin.total+=row.players;
        bin.max = bin.max===null ? row.players : Math.max(bin.max,row.players);
        peakPlayers = peakPlayers===null ? row.players : Math.max(peakPlayers,row.players);
        totalPlayers += row.players;totalPlayerSamples++;
      }
    }
    availability.textContent = onlineCount+offlineCount
      ? Math.round(100 * onlineCount / (onlineCount+offlineCount)) + '%'
      : '—';
    peak.textContent = peakPlayers===null ? '—' : String(peakPlayers);
    average.textContent = totalPlayerSamples
      ? (totalPlayers / totalPlayerSamples).toFixed(1).replace(/\.0$/,'') : '—';
    historyInfo.textContent = matched
      ? matched + ' muestras disponibles. Porcentajes calculados solo con estados verificados.'
      : 'Aún no hay registros. El historial se recopilará progresivamente.';
    const available = document.createDocumentFragment();
    const playersBars = document.createDocumentFragment();
    const top = Math.max(1,...bins.map(bin => bin.max === null ? 0 : bin.max));
    bins.forEach((bin,i) => {
      const date = new Date(start + (i+.5)*step);
      const label = periodHours === 24 ? date.toLocaleTimeString('es-EC',{hour:'2-digit',minute:'2-digit'})
        : date.toLocaleDateString('es-EC',{day:'2-digit',month:'short'});
      const state = bin.on+bin.off===0 ? 'unknown'
        : bin.on>0 && bin.off>0 ? 'mixed' : bin.on ? 'online' : 'offline';
      const description = label + ': '+bin.on+' en línea, '+bin.off+' desconectado, '+bin.unknown+' indeterminados';
      available.append(makeBar('server-availability-bar',state,description));
      const p = bin.max===null ? null : Math.round(100*bin.max/top);
      playersBars.append(makeBar('server-player-bar',bin.max===null?'unknown':'known',
        label + ': '+(bin.max===null?'sin dato':bin.max+' jugadores máximo registrado'),p===null?10:Math.max(5,p)));
    });
    historyTrack.replaceChildren(available);
    playerTrack.replaceChildren(playersBars);
    historyTrack.setAttribute('aria-label','Disponibilidad del servidor en las últimas '+(periodHours===24?'24 horas':'7 días'));
    playerTrack.setAttribute('aria-label','Actividad de jugadores en las últimas '+(periodHours===24?'24 horas':'7 días'));
  }
  async function loadHistory() {
    try {
      const since = new Date(Date.now()-7*86400000).toISOString();
      const rows = await getPublic('ecuaserver_server_samples?select=bucket_at,status,players,capacity,uptime_seconds&bucket_at=gte.'+encodeURIComponent(since)+'&order=bucket_at.asc&limit=2300');
      dataRows = Array.isArray(rows) ? rows : [];
      drawHistory();
    } catch {
      dataRows = [];
      drawHistory();
      historyInfo.textContent = 'No se pudo consultar el historial en este momento.';
    }
  }
  periodButtons.forEach(b => b.addEventListener('click',() => {
    periodHours = Number(b.dataset.historyPeriod);
    periodButtons.forEach(x=>{x.setAttribute('aria-pressed',String(x===b));x.classList.toggle('active',x===b);});
    drawHistory();
  }));

  loadStatus();
  Promise.allSettled([loadHistory(),loadNotice()]);
  document.addEventListener('visibilitychange',()=>{if (!document.hidden)loadStatus();});
  setInterval(()=>{if(!document.hidden)loadStatus();},60000);
  setInterval(()=>{if(!document.hidden)Promise.allSettled([loadHistory(),loadNotice()]);},300000);
})();
