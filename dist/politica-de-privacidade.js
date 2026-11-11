/* Política de Privacidade: menu acessível e links nativos para todas as páginas. */
(() => {
  "use strict";
  function init() {
    const page = document.querySelector(".danubia-privacidade");
    const header = page?.querySelector(".danubia-header");
    if (!header || header.dataset.menuReady) return;
    const button = header.querySelector(".menu");
    const nav = header.querySelector("#main-navigation");
    const details = nav?.querySelector(".nav-disclosure");
    if (!button || !nav) return;
    header.dataset.menuReady = "true";
    function setOpen(open) {
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
      nav.classList.toggle("open", open);
      if (!open && details) details.open = window.matchMedia("(max-width: 1100px)").matches;
    }
    button.addEventListener("click", () => setOpen(button.getAttribute("aria-expanded") !== "true"));
    nav.addEventListener("click", (event) => {
      // Os links mantêm a navegação nativa; o painel fecha somente depois do clique.
      if (event.target.closest("a[href]")) setTimeout(() => setOpen(false), 0);
    });
    document.addEventListener("click", (event) => {
      if (!header.contains(event.target)) setOpen(false);
      else if (details && !details.contains(event.target)) details.open = window.matchMedia("(max-width: 1100px)").matches;
    });
    header.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (details?.open && !window.matchMedia("(max-width: 1100px)").matches) {
        details.open = window.matchMedia("(max-width: 1100px)").matches;
        details.querySelector("summary").focus();
      } else if (button.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        button.focus();
      }
    });
    nav.addEventListener("focusout", (event) => {
      if (details && event.relatedTarget && !nav.contains(event.relatedTarget)) details.open = window.matchMedia("(max-width: 1100px)").matches;
    });
    matchMedia("(min-width: 1101px)").addEventListener("change", () => setOpen(false));
    header.classList.add("privacy-menu-ready");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();

// Submenu: hover e teclado no desktop; lista sempre aberta no mobile.
(() => {
  function initSubmenus() {
    const mobile = window.matchMedia("(max-width: 1100px)");
    document.querySelectorAll(".nav-disclosure").forEach((details) => {
      if (details.dataset.submenuReady) return;
      details.dataset.submenuReady = "true";
      const summary = details.querySelector("summary");
      const close = () => { details.open = mobile.matches; };
      close();
      mobile.addEventListener("change", close);
      details.addEventListener("pointerenter", (event) => {
        if (!mobile.matches && event.pointerType !== "touch") details.open = true;
      });
      details.addEventListener("pointerleave", () => {
        if (!mobile.matches && !details.contains(document.activeElement)) close();
      });
      details.addEventListener("focusin", () => { details.open = true; });
      details.addEventListener("focusout", (event) => {
        if (!details.contains(event.relatedTarget)) close();
      });
      summary.addEventListener("click", (event) => {
        // O texto navega; a seta mantém as opções abertas.
        if (event.target.closest("a[href]")) return;
        event.preventDefault();
        details.open = true;
      });
      details.addEventListener("toggle", () => {
        if (mobile.matches && !details.open) details.open = true;
      });
      details.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !mobile.matches) {
          event.stopPropagation();
          summary.focus();
          details.open = false;
        }
      });
      details.addEventListener("click", (event) => {
        if (event.target.closest("a")) setTimeout(close, 0);
      });
      document.addEventListener("click", (event) => {
        if (!details.contains(event.target)) close();
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initSubmenus);
  else initSubmenus();
})();

// Abre a lista de Serviços sem acrescentar uma âncora ao endereço.
(() => {
  function initServicesScroll() {
    const section = document.querySelector('main section.catalog#servicos');
    if (!section || window.location.hash) return;
    const showServices = () => {
      // As fontes podem alterar a altura da abertura em telas estreitas.
      const fontsReady = document.fonts?.ready || Promise.resolve();
      fontsReady.then(() => requestAnimationFrame(() => {
        // Preserve uma âncora escolhida enquanto a página carregava.
        if (!window.location.hash) {
          const margin = parseFloat(getComputedStyle(section).scrollMarginTop) || 0;
          const scroller = document.scrollingElement || document.documentElement;
          const padding = parseFloat(getComputedStyle(scroller).scrollPaddingTop) || 0;
          // Alinha a janela sem acumular espaçamentos dos contêineres WordPress.
          const top = window.scrollY + section.getBoundingClientRect().top - margin - padding;
          window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
        }
      }));
    };
    if (document.readyState === "complete") showServices();
    else window.addEventListener("load", showServices, { once: true });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initServicesScroll, { once: true });
  } else initServicesScroll();
})();
