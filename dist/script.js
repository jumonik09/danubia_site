const menu = document.querySelector(".menu");
const nav = document.querySelector("nav");
menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  nav.classList.toggle("open", open);
});
nav.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Abrir menu");
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
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
      let index = 0;
      let paused = reduced.matches;
      let timer;
      const render = () => {
        track.scrollTo({
          left: index * track.clientWidth,
          behavior: reduced.matches ? "instant" : "smooth"
        });
        carousel.querySelector(".photo-count").textContent =
          `${index + 1} / ${slides.length}`;
      };
      const stop = () => clearInterval(timer);
      const start = () => {
        stop();
        if (!paused && !document.hidden)
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
      carousel.querySelector(".photo-prev").addEventListener("click", () => {
        index = (index - 1 + slides.length) % slides.length;
        render();
        start();
      });
      carousel.querySelector(".photo-next").addEventListener("click", () => {
        index = (index + 1) % slides.length;
        render();
        start();
      });
      pause.addEventListener("click", () => {
        paused = !paused;
        label();
        start();
      });
      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
      carousel.addEventListener("focusin", stop);
      carousel.addEventListener("focusout", (event) => {
        if (!carousel.contains(event.relatedTarget)) start();
      });
      document.addEventListener("visibilitychange", start);
      window.addEventListener("resize", render);
      reduced.addEventListener("change", () => {
        paused = reduced.matches;
        label();
        start();
      });
      label();
      start();
    });
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", initPhotos, { once: true });
  else initPhotos();
})();
