(() => {
  "use strict";

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const animations = new Set();

  // O conteúdo permanece visível se as animações não estiverem disponíveis.
  function enter(element, distance = 10, duration = 480) {
    if (motion.matches || typeof element.animate !== "function") return;
    const animation = element.animate(
      [
        { opacity: 0, transform: `translateY(${distance}px)` },
        { opacity: 1, transform: "translateY(0)" }
      ],
      { duration, easing: "cubic-bezier(.2,.65,.3,1)" }
    );
    animations.add(animation);
    animation.finished.then(
      () => animations.delete(animation),
      () => animations.delete(animation)
    );
    return animation;
  }

  const menu = document.querySelector(".menu");
  const nav = document.querySelector("#main-navigation");
  if (menu && nav) {
    let menuAnimation;
    function setMenu(open) {
      menuAnimation?.cancel();
      nav.classList.toggle("open", open);
      menu.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
      menu.textContent = open ? "×" : "☰";
      if (open) menuAnimation = enter(nav, 4, 220);
    }

    menu.addEventListener("click", () => {
      setMenu(menu.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setTimeout(() => setMenu(false), 0);
    });
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        menu.getAttribute("aria-expanded") === "true"
      ) {
        setMenu(false);
        menu.focus();
      }
    });
    document.addEventListener("click", (event) => {
      if (!nav.contains(event.target) && !menu.contains(event.target))
        setMenu(false);
    });
    window
      .matchMedia("(min-width: 601px)")
      .addEventListener("change", () => setMenu(false));
    // Esconde o menu mobile apenas depois de preparar seus controles.
    document.documentElement.classList.add("js");
  }

  let observer;
  if (!motion.matches && "IntersectionObserver" in window) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          enter(entry.target);
        });
      },
      { threshold: 0.08 }
    );
    document
      .querySelectorAll(
        ".hero > div, .photo, .section-heading, .service, .contact-grid > div, .contact-heading, .contact-card"
      )
      .forEach((element) => observer.observe(element));
  }

  motion.addEventListener("change", (event) => {
    if (!event.matches) return;
    observer?.disconnect();
    animations.forEach((animation) => animation.cancel());
    animations.clear();
  });
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
