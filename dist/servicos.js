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
      if (event.target.closest("a")) setMenu(false);
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
