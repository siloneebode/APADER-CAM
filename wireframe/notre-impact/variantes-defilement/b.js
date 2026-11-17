(() => {
  "use strict";

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const number = value => Number.parseFloat(value) || 0;

  function mount(section) {
    if (section.dataset.ipcReady) return;
    const pin = section.querySelector(".ipc-pin");
    const header = section.querySelector(".ipc-header");
    const viewport = section.querySelector(".ipc-window");
    const track = section.querySelector(".ipc-track");
    const cards = [...section.querySelectorAll(".ipc-card")];
    const footer = section.querySelector(".ipc-footer");
    const hint = section.querySelector(".ipc-hint");
    const index = section.querySelector("[data-ipc-index]");
    const progress = section.querySelector(".ipc-progress");
    const previous = section.querySelector("[data-ipc-prev]");
    const next = section.querySelector("[data-ipc-next]");
    if (!pin || !header || !viewport || !track || !cards.length || !footer || !hint || !index || !progress || !previous || !next) return;
    section.dataset.ipcReady = "true";

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stickySupported = window.CSS && CSS.supports("position", "sticky");
    const state = { mode: "native", distance: 0, start: 0, x: 0, positions: [], widths: [], inset: 0, width: 0 };
    let frame = 0;
    let needsMeasurement = true;
    let lastIndex = -1;

    function schedule(measure = false) {
      needsMeasurement = needsMeasurement || measure;
      if (!frame) frame = window.requestAnimationFrame(update);
    }

    function measure() {
      const pinStyle = getComputedStyle(pin);
      const viewportStyle = getComputedStyle(viewport);
      const gap = number(pinStyle.rowGap);
      const requiredHeight = Math.ceil(
        number(pinStyle.paddingTop) + number(pinStyle.paddingBottom) +
        header.getBoundingClientRect().height + track.getBoundingClientRect().height +
        footer.getBoundingClientRect().height + gap * 2 +
        number(viewportStyle.paddingTop) + number(viewportStyle.paddingBottom)
      );
      const viewportHeight = Math.min(window.innerHeight, window.visualViewport ? window.visualViewport.height : window.innerHeight);
      const inset = number(viewportStyle.paddingLeft);
      // La largeur intrinsèque ne change pas sous l’effet du transform.
      const distance = Math.max(0, track.offsetWidth + inset + number(viewportStyle.paddingRight) - viewport.clientWidth);
      const canPin = stickySupported && !reducedMotion.matches && distance > 1 && requiredHeight + 2 <= viewportHeight - 28;
      const mode = canPin ? "vertical" : "native";
      const changedMode = mode !== state.mode;
      const previousX = state.x;

      state.mode = mode;
      state.distance = distance;
      state.inset = inset;
      state.width = viewport.clientWidth;
      state.positions = cards.map(card => card.offsetLeft);
      state.widths = cards.map(card => card.offsetWidth);
      section.dataset.ipcMode = mode;

      if (canPin) {
        section.style.setProperty("--ipc-pin-height", `${requiredHeight}px`);
        section.style.setProperty("--ipc-scroll-height", `${requiredHeight + distance}px`);
        viewport.scrollLeft = 0;
      } else {
        section.style.removeProperty("--ipc-pin-height");
        section.style.removeProperty("--ipc-scroll-height");
        track.style.transform = "";
        if (changedMode) viewport.scrollLeft = clamp(previousX, 0, distance);
      }

      state.start = section.getBoundingClientRect().top + window.scrollY - 14;
      hint.textContent = canPin
        ? "Faites défiler vers le bas pour parcourir les quatre domaines."
        : "Balayez horizontalement ou utilisez les flèches pour parcourir les quatre domaines.";
    }

    function render() {
      state.x = clamp(state.mode === "vertical" ? window.scrollY - state.start : viewport.scrollLeft, 0, state.distance);
      if (state.mode === "vertical") track.style.transform = `translate3d(${-state.x}px, 0, 0)`;
      const ratio = state.distance ? state.x / state.distance : 0;
      const visibleWidths = state.positions.map((position, cardIndex) => {
        const left = state.inset + position - state.x;
        return Math.max(0, Math.min(state.width, left + state.widths[cardIndex]) - Math.max(0, left));
      });
      // En cas d’égalité, conserver la première carte dans l’ordre de lecture.
      const active = visibleWidths.reduce((best, width, cardIndex) => width > visibleWidths[best] ? cardIndex : best, 0);
      if (active !== lastIndex) {
        index.textContent = `${String(active + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
        lastIndex = active;
      }
      progress.value = ratio;
      progress.setAttribute("aria-valuetext", `${Math.round(ratio * 100)} % du carrousel parcouru`);
      previous.disabled = state.distance <= 1 || state.x <= 1;
      next.disabled = state.distance <= 1 || state.x >= state.distance - 1;

      // Les cartes partiellement visibles restent disponibles aux aides techniques.
      cards.forEach((card, cardIndex) => {
        const visible = visibleWidths[cardIndex] > 1;
        if ("inert" in card) card.inert = !visible && !card.contains(document.activeElement);
      });
    }

    function update() {
      frame = 0;
      if (needsMeasurement) {
        needsMeasurement = false;
        measure();
      }
      render();
    }

    function goToX(position) {
      const target = clamp(position, 0, state.distance);
      const behavior = reducedMotion.matches ? "auto" : "smooth";
      if (state.mode === "vertical") window.scrollTo({ top: state.start + target, behavior });
      else viewport.scrollTo({ left: target, behavior });
    }

    function step(direction) {
      // Les contrôles visent les vrais points d’accroche du scroll-snap natif.
      const stops = [...new Set([0, ...state.positions.map(position => clamp(position, 0, state.distance)), state.distance])];
      const target = direction > 0
        ? stops.find(stop => stop > state.x + 2)
        : stops.slice().reverse().find(stop => stop < state.x - 2);
      goToX(target === undefined ? (direction > 0 ? state.distance : 0) : target);
    }

    previous.addEventListener("click", () => step(-1));
    next.addEventListener("click", () => step(1));
    viewport.addEventListener("keydown", event => {
      if (event.target !== viewport || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "ArrowLeft") step(-1);
      else if (event.key === "ArrowRight") step(1);
      else if (event.key === "Home") goToX(0);
      else if (event.key === "End") goToX(state.distance);
      else return;
      event.preventDefault();
    });

    // Aucun listener wheel ni interception du défilement vertical.
    window.addEventListener("scroll", () => schedule(), { passive: true });
    viewport.addEventListener("scroll", () => schedule(), { passive: true });
    window.addEventListener("resize", () => schedule(true), { passive: true });
    if (window.visualViewport) window.visualViewport.addEventListener("resize", () => schedule(true), { passive: true });
    if (reducedMotion.addEventListener) reducedMotion.addEventListener("change", () => schedule(true));
    else reducedMotion.addListener(() => schedule(true));
    if (window.ResizeObserver) {
      const observer = new ResizeObserver(() => schedule(true));
      [header, viewport, track, footer].forEach(element => observer.observe(element));
    }
    if (document.fonts) document.fonts.ready.then(() => schedule(true));
    schedule(true);
  }

  function init() { document.querySelectorAll("[data-ipc-carousel]").forEach(mount); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
