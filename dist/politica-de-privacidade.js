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
      if (!open && details) details.open = false;
    }
    button.addEventListener("click", () => setOpen(button.getAttribute("aria-expanded") !== "true"));
    nav.addEventListener("click", (event) => {
      // Os links mantêm a navegação nativa; o painel fecha somente depois do clique.
      if (event.target.closest("a[href]")) setTimeout(() => setOpen(false), 0);
    });
    document.addEventListener("click", (event) => {
      if (!header.contains(event.target)) setOpen(false);
      else if (details && !details.contains(event.target)) details.open = false;
    });
    header.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (details?.open) {
        details.open = false;
        details.querySelector("summary").focus();
      } else if (button.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        button.focus();
      }
    });
    nav.addEventListener("focusout", (event) => {
      if (details && event.relatedTarget && !nav.contains(event.relatedTarget)) details.open = false;
    });
    matchMedia("(min-width: 1101px)").addEventListener("change", () => setOpen(false));
    header.classList.add("privacy-menu-ready");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
