const menu = document.querySelector(".menu");
const nav = document.querySelector("nav");
if (menu && nav) {
  menu.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    nav.classList.toggle("open", open);
  });
  nav.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      setTimeout(() => {
        nav.classList.remove("open");
        menu.setAttribute("aria-expanded", "false");
        menu.setAttribute("aria-label", "Abrir menu");
      }, 0);
    })
  );

  // Fecha o menu ao sair da navegação ou voltar ao layout de computador.
  function closeMenu() {
    nav.classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Abrir menu");
  }
  menu.setAttribute("aria-controls", "main-navigation");
  nav.id = "main-navigation";
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menu.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!nav.contains(event.target) && !menu.contains(event.target)) closeMenu();
  });
  window.matchMedia("(min-width: 1101px)").addEventListener("change", closeMenu);
}

// Entrada suave, uma única vez, sem esconder conteúdo caso a animação não rode.
(() => {
  const motionPreference = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );
  if (
    motionPreference.matches ||
    !("IntersectionObserver" in window) ||
    !Element.prototype.animate
  )
    return;

  const activeAnimations = new Set();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        if (motionPreference.matches) return;
        const animation = entry.target.animate(
          [
            { opacity: 0, transform: "translateY(12px)" },
            { opacity: 1, transform: "translateY(0)" }
          ],
          { duration: 600, easing: "cubic-bezier(.2,.65,.3,1)" }
        );
        activeAnimations.add(animation);
        animation.finished.then(
          () => activeAnimations.delete(animation),
          () => activeAnimations.delete(animation)
        );
      });
    },
    { threshold: 0.08 }
  );

  document
    .querySelectorAll(
      ".hero-copy, .hero-media, .about-photo, .about-copy, .services-heading, .service-row, .invite > h2, .booking-button"
    )
    .forEach((element) => observer.observe(element));

  motionPreference.addEventListener("change", (event) => {
    if (!event.matches) return;
    observer.disconnect();
    activeAnimations.forEach((animation) => animation.cancel());
    activeAnimations.clear();
  });
})();

// Galeria com passagem automática, controles e pausa.
(() => {
  function initPhotos() {
    document.querySelectorAll(".photo-carousel").forEach((carousel) => {
      const track = carousel.querySelector(".photo-track");
      const slides = carousel.querySelectorAll(".photo-slide");
      const pause = carousel.querySelector(".photo-pause");
      const previous = carousel.querySelector(".photo-prev");
      const next = carousel.querySelector(".photo-next");
      const count = carousel.querySelector(".photo-count");
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
      let index = 0;
      let paused = reduced.matches;
      let timer;
      let hovered = false;
      let focused = false;
      if (!track || !pause || !previous || !next || !count || slides.length === 0) return;
      const render = (animate = true) => {
        track.scrollTo({
          left: index * track.clientWidth,
          behavior: !animate || reduced.matches ? "instant" : "smooth"
        });
        count.textContent =
          `${index + 1} / ${slides.length}`;
      };
      const stop = () => {
        clearInterval(timer);
        timer = undefined;
      };
      const start = () => {
        stop();
        if (!paused && !document.hidden && !hovered && !focused && slides.length > 1)
          timer = setInterval(() => {
            index = (index + 1) % slides.length;
            render();
          }, 4000);
      };
      const label = () => {
        pause.textContent = paused ? "Reproduzir" : "Pausar";
        pause.setAttribute(
          "aria-label",
          paused ? "Iniciar passagem automática" : "Pausar passagem automática"
        );
      };
      previous.addEventListener("click", () => {
        index = (index - 1 + slides.length) % slides.length;
        render();
        start();
      });
      next.addEventListener("click", () => {
        index = (index + 1) % slides.length;
        render();
        start();
      });
      pause.addEventListener("click", () => {
        paused = !paused;
        label();
        start();
      });
      carousel.addEventListener("mouseenter", () => { hovered = true; stop(); });
      carousel.addEventListener("mouseleave", () => { hovered = false; start(); });
      carousel.addEventListener("focusin", () => { focused = true; stop(); });
      carousel.addEventListener("focusout", (event) => {
        focused = carousel.contains(event.relatedTarget);
        start();
      });
      document.addEventListener("visibilitychange", start);
      window.addEventListener("resize", () => render(false));
      reduced.addEventListener("change", () => {
        paused = reduced.matches;
        label();
        start();
      });
      render(false);
      label();
      start();
    });
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", initPhotos, { once: true });
  else initPhotos();
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
