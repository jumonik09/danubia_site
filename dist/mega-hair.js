/* Mega hair: menu, submenu e efeitos suaves, limitados ao contêiner da página. */
(() => {
  "use strict";

  function init() {
    const page = document.querySelector(".danubia-mega-hair");
    if (!page || page.dataset.megaReady) return;
    page.dataset.megaReady = "true";

    // 1. Animações não ocultam conteúdo se o recurso estiver indisponível.
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Set();
    function enter(element, distance = 12, duration = 580, delay = 0) {
      if (!element || motion.matches || typeof element.animate !== "function") return;
      const animation = element.animate(
        [
          { opacity: 0, transform: `translateY(${distance}px)` },
          { opacity: 1, transform: "translateY(0)" }
        ],
        { duration, delay, easing: "cubic-bezier(.2,.65,.3,1)", fill: "backwards" }
      );
      animations.add(animation);
      animation.finished.then(
        () => animations.delete(animation),
        () => animations.delete(animation)
      );
      return animation;
    }

    // 2. Navegação: clique fora, Escape, teclado e mudança de largura.
    const menu = page.querySelector(".menu");
    const nav = page.querySelector("#main-navigation");
    const disclosure = nav?.querySelector(".nav-disclosure");
    const summary = disclosure?.querySelector("summary");
    let menuAnimation;
    function setMenu(open) {
      if (!menu || !nav) return;
      menuAnimation?.cancel();
      nav.classList.toggle("open", open);
      menu.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
      if (!open && disclosure) disclosure.open = window.matchMedia("(max-width: 1100px)").matches;
      if (open) menuAnimation = enter(nav, 4, 220);
    }

    if (menu && nav) {
      menu.addEventListener("click", () => setMenu(menu.getAttribute("aria-expanded") !== "true"));
      nav.addEventListener("click", (event) => {
        if (event.target.closest("a")) setTimeout(() => setMenu(false), 0);
      });
      document.addEventListener("click", (event) => {
        if (!page.contains(event.target) || (!nav.contains(event.target) && !menu.contains(event.target))) {
          setMenu(false);
        } else if (disclosure && !disclosure.contains(event.target)) {
          disclosure.open = window.matchMedia("(max-width: 1100px)").matches;
        }
      });
      page.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        if (disclosure?.open && !window.matchMedia("(max-width: 1100px)").matches) {
          disclosure.open = window.matchMedia("(max-width: 1100px)").matches;
          summary?.focus();
        } else if (menu.getAttribute("aria-expanded") === "true") {
          setMenu(false);
          menu.focus();
        }
      });
      // relatedTarget identifica o próximo foco sem fechar o submenu durante
      // o mousedown de um link. Consultar activeElement aqui pode retornar o body
      // antes de o navegador focar o destino e impedir o clique de navegar.
      nav.addEventListener("focusout", (event) => {
        const nextFocus = event.relatedTarget;
        if (disclosure && nextFocus && !nav.contains(nextFocus)) disclosure.open = window.matchMedia("(max-width: 1100px)").matches;
      });
      if ("ResizeObserver" in window) {
        let wasCompact = page.getBoundingClientRect().width <= 1100;
        new ResizeObserver(([entry]) => {
          const compact = entry.contentRect.width <= 1100;
          if (compact !== wasCompact) setMenu(false);
          wasCompact = compact;
        }).observe(page);
      } else {
        window.matchMedia("(max-width: 1100px)").addEventListener("change", () => setMenu(false));
      }
      // Sem JavaScript, a navegação continua visível.
      page.classList.add("is-ready");
    }

    // 3. Entrada única ao rolar, com pequeno intervalo entre os cartões.
    let observer;
    if (!motion.matches && "IntersectionObserver" in window) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          const card = entry.target;
          const index = card.matches(".mega-card") ? Array.from(card.parentElement.children).indexOf(card) : 0;
          enter(card, card.matches(".mega-hero-photo") ? 16 : 12, 580, index * 70);
        });
      }, { threshold: 0.08 });
      page.querySelectorAll(
        ".hero > div, .mega-hero-photo, .section-heading, .mega-card, .mega-about > div, .mega-care > div, .mega-care-list, .mega-invite, .contact-grid > div"
      ).forEach((element) => observer.observe(element));
    }

    // 4. Dúvidas frequentes: abertura nativa e efeito opcional.
    page.querySelectorAll(".mega-faq details").forEach((details) => {
      let responseAnimation;
      details.addEventListener("toggle", () => {
        responseAnimation?.cancel();
        if (details.open) responseAnimation = enter(details.querySelector("p"), 5, 240);
      });
    });
    motion.addEventListener("change", (event) => {
      if (!event.matches) return;
      observer?.disconnect();
      animations.forEach((animation) => animation.cancel());
      animations.clear();
    });
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
