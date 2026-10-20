const menu = document.querySelector('.menu');
const nav = document.querySelector('nav');
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  nav.classList.toggle('open', open);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Abrir menu');
}));


// Fecha o menu ao sair da navegação ou voltar ao layout de computador.
function closeMenu() {
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Abrir menu');
}
menu.setAttribute('aria-controls', 'main-navigation');
nav.id = 'main-navigation';
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menu.focus();
  }
});
document.addEventListener('click', event => {
  if (!nav.contains(event.target) && !menu.contains(event.target)) closeMenu();
});
window.matchMedia('(min-width: 1101px)').addEventListener('change', closeMenu);

// Entrada suave, uma única vez, sem esconder conteúdo caso a animação não rode.
(() => {
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motionPreference.matches || !('IntersectionObserver' in window) || !Element.prototype.animate) return;

  const activeAnimations = new Set();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      if (motionPreference.matches) return;
      const animation = entry.target.animate([
        { opacity: 0, transform: 'translateY(12px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 600, easing: 'cubic-bezier(.2,.65,.3,1)' });
      activeAnimations.add(animation);
      animation.finished.then(() => activeAnimations.delete(animation), () => activeAnimations.delete(animation));
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.hero-copy, .hero-media, .about-photo, .about-copy, .services-heading, .service-row, .invite > h2, .booking-button').forEach(element => observer.observe(element));

  motionPreference.addEventListener('change', event => {
    if (!event.matches) return;
    observer.disconnect();
    activeAnimations.forEach(animation => animation.cancel());
    activeAnimations.clear();
  });
})();
