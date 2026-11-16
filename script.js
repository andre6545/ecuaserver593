/* EcuaServer +593 — interacciones accesibles sin dependencias */
(() => {
  'use strict';

  const header = document.querySelector('.site-header');
  const menuToggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('main-nav');
  const backTop = document.getElementById('back-top');
  const serverId = document.getElementById('server-id');
  const copyButton = document.getElementById('copy-server-id');
  const copyLabel = document.getElementById('copy-label');
  const announcement = document.getElementById('copy-announcement');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let copyResetTimer;

  function setMenuOpen(isOpen) {
    header.classList.toggle('nav-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  }

  menuToggle.addEventListener('click', () => {
    setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains('nav-open')) {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (header.classList.contains('nav-open') && !header.contains(event.target)) setMenuOpen(false);
  });
  window.matchMedia('(min-width: 1041px)').addEventListener('change', (event) => {
    if (event.matches) setMenuOpen(false);
  });

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    // Alternativa para navegadores antiguos o contextos sin Clipboard API.
    const hiddenInput = document.createElement('textarea');
    hiddenInput.value = text;
    hiddenInput.setAttribute('readonly', '');
    hiddenInput.style.cssText = 'position:fixed;top:-1000px;left:-1000px;opacity:0';
    document.body.appendChild(hiddenInput);
    hiddenInput.select();
    const succeeded = document.execCommand('copy');
    hiddenInput.remove();
    if (!succeeded) throw new Error('El portapapeles no está disponible');
  }

  copyButton.addEventListener('click', async () => {
    clearTimeout(copyResetTimer);
    try {
      await copyText(serverId.textContent.trim());
      copyButton.classList.add('copied');
      copyLabel.textContent = '¡Copiado!';
      copyButton.setAttribute('aria-label', 'ID copiado');
      announcement.textContent = 'ID del servidor copiado al portapapeles';
    } catch {
      copyButton.classList.remove('copied');
      copyLabel.textContent = 'Seleccionar';
      copyButton.setAttribute('aria-label', 'Seleccionar ID del servidor');
      const range = document.createRange();
      range.selectNodeContents(serverId);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      announcement.textContent = 'No se pudo copiar automáticamente. El ID está seleccionado para copiarlo manualmente.';
    }
    copyResetTimer = setTimeout(() => {
      copyButton.classList.remove('copied');
      copyLabel.textContent = 'Copiar';
      copyButton.setAttribute('aria-label', 'Copiar ID del servidor');
    }, 2800);
  });

  // Los <details> nativos mantienen teclado, foco y lectores de pantalla.
  const faqItems = [...document.querySelectorAll('.faq-item')];
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) faqItems.filter((other) => other !== item && other.open).forEach((other) => { other.open = false; });
    });
  });

  const revealItems = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -45px 0px', threshold: 0.1 });
    revealItems.forEach((element) => revealObserver.observe(element));
  } else {
    revealItems.forEach((element) => element.classList.add('revealed'));
  }

  const sectionIds = ['inicio', 'nosotros', 'servidor', 'convoyes', 'mapa-ecuador', 'preguntas', 'contacto'];
  const links = [...document.querySelectorAll('.nav-link')];
  let ticking = false;

  function updateScrollState() {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 35);
    backTop.classList.toggle('visible', y > 450);
    let activeId = 'inicio';
    for (const id of sectionIds) {
      const section = document.getElementById(id);
      if (section && section.getBoundingClientRect().top <= 155) activeId = id;
    }
    links.forEach((link) => {
      const active = link.getAttribute('href') === `#${activeId}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateScrollState);
      ticking = true;
    }
  }, { passive: true });
  updateScrollState();

  backTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'instant' : 'smooth' });
  });
  document.getElementById('current-year').textContent = new Date().getFullYear();
})();
