/* EcuaServer +593 · Panel público simplificado.
 * Consulta en vivo de BisectHosting y avisos autorizados de Supabase.
 * El registro privado periódico de métricas continúa sin cambios.
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const badge = $('server-status-state');
  if (!badge) return;
  const players = $('server-status-players');
  const playersField = $('server-players-field');
  const playersSubtitle = $('server-players-subtitle');
  const updated = $('server-status-updated');
  const refresh = $('server-refresh');
  const uptime = $('server-uptime');
  const bannerCard = document.querySelector('.banner-live-card');
  const bannerState = $('banner-server-state');
  const bannerPlayers = $('banner-server-players');
  const notice = $('server-notice');
  const noticeText = $('server-notice-text');
  const SUPABASE = 'https://oukgdzfhqeygocmxuiwt.supabase.co';
  const KEY = 'sb_publishable_1U6UEZiyArZL2wswqNfdAA_PSiZesM1';
  const labels = {
    online:'En línea', offline:'Desconectado',
    transitioning:'Cambiando de estado',
    unconfigured:'Sin configurar', unavailable:'No disponible'
  };
  let busy = false;
  let lastManual = 0;

  function syncBanner(state, count) {
    if (!bannerCard || !bannerState || !bannerPlayers) return;
    bannerCard.dataset.status = state;
    bannerState.textContent = labels[state] || labels.unavailable;
    bannerPlayers.textContent = Number.isInteger(count) && count >= 0 ? String(count) : '—';
  }

  function showPlayers(count) {
    if (!Number.isInteger(count) || count < 0) {
      players.textContent = '—';
      playersField.dataset.players = 'unknown';
      playersSubtitle.textContent = 'Dato no disponible';
    } else {
      players.textContent = String(count);
      playersField.dataset.players = count > 0 ? 'active' : 'empty';
      playersSubtitle.textContent = count === 0 ? 'No hay jugadores conectados ahora'
        : count === 1 ? '1 jugador recorriendo las rutas' : count + ' jugadores recorriendo las rutas';
    }
  }

  function displayUptime(seconds) {
    if (!Number.isInteger(seconds) || seconds < 0) return '—';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor(seconds % 86400 / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    return (days ? days + ' d ' : '') + (hours || days ? hours + ' h ' : '') + minutes + ' min';
  }

  async function loadStatus(manual = false) {
    if (busy) return;
    busy = true;
    if (manual) {
      refresh.disabled = true;
      refresh.setAttribute('aria-busy','true');
    }
    try {
      const result = await fetch('/api/server-status' + (manual ? '?refresh=1' : ''), {cache:'no-store'});
      if (!result.ok) throw new Error('Servicio no disponible');
      const data = await result.json();
      const state = Object.prototype.hasOwnProperty.call(labels,data.status) ? data.status : 'unavailable';
      badge.dataset.state = state;
      badge.textContent = labels[state];
      syncBanner(state,data.players);
      showPlayers(data.players);
      uptime.textContent = state === 'online' ? displayUptime(data.uptimeSeconds) : '—';
      if (state === 'unconfigured') {
        updated.textContent = 'La conexión con el servidor todavía no está configurada.';
      } else if (typeof data.checkedAt === 'string' && !Number.isNaN(Date.parse(data.checkedAt))) {
        updated.textContent = 'Última consulta: ' + new Date(data.checkedAt).toLocaleString('es-EC',{
          day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'
        });
      } else {
        updated.textContent = 'No fue posible confirmar el estado del servidor.';
      }
    } catch {
      badge.dataset.state = 'unavailable';
      badge.textContent = 'No disponible';
      syncBanner('unavailable',null);
      showPlayers(null);
      uptime.textContent = '—';
      updated.textContent = 'No fue posible consultar el servidor. Puedes intentarlo de nuevo.';
    } finally {
      busy = false;
      refresh.removeAttribute('aria-busy');
      if (manual) {
        const remaining = Math.max(0,30000-(Date.now()-lastManual));
        setTimeout(() => {refresh.disabled = false;},remaining);
      }
    }
  }

  async function loadNotice() {
    try {
      const response = await fetch(
        SUPABASE + '/rest/v1/ecuaserver_server_notice?select=enabled,message&id=eq.1',
        {headers:{apikey:KEY}}
      );
      if (!response.ok) throw new Error('Aviso no disponible');
      const records = await response.json();
      const item = records[0];
      const message = typeof item?.message === 'string' ? item.message.trim() : '';
      notice.hidden = !(item?.enabled && message);
      noticeText.textContent = item?.enabled ? message : '';
    } catch {
      notice.hidden = true;
      noticeText.textContent = '';
    }
  }

  refresh.addEventListener('click', async () => {
    if (busy || Date.now()-lastManual < 30000) return;
    lastManual = Date.now();
    await loadStatus(true);
    await loadNotice();
  });

  loadStatus();
  loadNotice();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) loadStatus();
  });
  setInterval(() => {
    if (!document.hidden) loadStatus();
  },60000);
  setInterval(() => {
    if (!document.hidden) loadNotice();
  },300000);
})();
