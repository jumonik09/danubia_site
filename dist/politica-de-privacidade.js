// Navegação da Política de Privacidade; carregar apenas nessa página.
(() => {
 function init() {
  const header = document.querySelector('.danubia-privacidade .danubia-header');
  if (!header || header.dataset.menuReady) return;
  header.dataset.menuReady = 'true';
  const button = header.querySelector('.menu'), nav = header.querySelector('nav');
  function setOpen(open) {
   button.setAttribute('aria-expanded', String(open));
   button.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
   nav.classList.toggle('open', open);
  }
  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('click', e => { if (!header.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') { setOpen(false); button.focus(); } });
  matchMedia('(min-width: 1101px)').addEventListener('change', () => setOpen(false));
 }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

// Fecha o submenu ao navegar, clicar fora ou pressionar Escape.
(() => {
  function initSubmenus() {
    document.querySelectorAll(".nav-disclosure").forEach((details) => {
      if (details.dataset.submenuReady) return;
      details.dataset.submenuReady = "true";
      details.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && details.open) {
          details.open = false;
          details.querySelector("summary").focus();
        }
      });
      details.addEventListener("click", (event) => {
        if (event.target.closest("a")) details.open = false;
      });
      document.addEventListener("click", (event) => {
        if (!details.contains(event.target)) details.open = false;
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") details.open = false;
      });
      window.matchMedia("(min-width: 1101px)").addEventListener("change", () => { details.open = false; });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initSubmenus);
  else initSubmenus();
})();
