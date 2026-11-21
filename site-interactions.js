// EcuaServer +593 · Interacciones progresivas de la portada y navegación.
// No interviene en la administración, la galería ni la API del servidor.
(() => {
  'use strict';
  const menu = document.getElementById('mobile-menu-toggle');
  const nav = document.getElementById('main-navigation');
  const progress = document.getElementById('scroll-progress');
  const topButton = document.getElementById('back-to-top');
  const header = document.getElementById('site-header');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function closeMenu(returnFocus = false) {
    if (!menu || !nav) return;
    nav.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Abrir menú de navegación');
    if (returnFocus) menu.focus();
  }
  if (menu && nav) {
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      nav.classList.toggle('is-open', open);
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeMenu()));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) closeMenu(true);
    });
    document.addEventListener('click', e => {
      if (nav.classList.contains('is-open') && !nav.contains(e.target) && !menu.contains(e.target)) closeMenu();
    });
    window.matchMedia('(min-width: 821px)').addEventListener('change', e => {if (e.matches) closeMenu();});
  }


  // Resaltado accesible de la sección actual; no modifica enlaces ni navegación.
  const sectionLinks = Array.from(document.querySelectorAll('#main-navigation a[data-section]'));
  if (sectionLinks.length && 'IntersectionObserver' in window) {
    const sections = sectionLinks.map(link => document.getElementById(link.dataset.section)).filter(Boolean);
    const setActive = id => {
      sectionLinks.forEach(link => {
        const active = link.dataset.section === id;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    };
    const sectionObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting);
      if (!visible.length) return;
      visible.sort((a,b) => b.intersectionRatio-a.intersectionRatio);
      setActive(visible[0].target.id);
    }, {rootMargin:'-18% 0px -48% 0px',threshold:[0,.15,.35,.6]});
    sections.forEach(section => sectionObserver.observe(section));
    sectionLinks.forEach(link => link.addEventListener('click', () => setActive(link.dataset.section)));
  }

  let scheduled = false;
  const onScroll = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      const total = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (progress) progress.style.transform = 'scaleX(' + Math.min(1, Math.max(0, scrollY / total)) + ')';
      if (header) header.classList.toggle('is-scrolled', scrollY > 40);
      if (topButton) topButton.hidden = scrollY < 650;
      scheduled = false;
    });
  };
  window.addEventListener('scroll', onScroll, {passive: true});
  window.addEventListener('resize', onScroll, {passive: true});
  onScroll();

  topButton?.addEventListener('click', () => {
    window.scrollTo({top:0,behavior: reduceMotion.matches ? 'instant':'smooth'});
  });

  // Revelado ligero solamente cuando la página admite movimiento y observadores.
  // Sin JS o con movimiento reducido, el contenido se mantiene visible.
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const observed = document.querySelectorAll('.showcase-reveal');
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },{threshold:0.07,rootMargin:'0px 0px -35px 0px'});
    observed.forEach(el => io.observe(el));
    document.documentElement.classList.add('supports-reveal');
  }
})();
