(() => {
  "use strict";

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const number = value => Number.parseFloat(value) || 0;

  function mount(section) {
    if (section.dataset.smpReady) return;
    const pin = section.querySelector(".smp-pin");
    const header = section.querySelector(".smp-header");
    const viewport = section.querySelector(".smp-window");
    const track = section.querySelector(".smp-track");
    const cards = [...section.querySelectorAll(".smp-card")];
    const footer = section.querySelector(".smp-footer");
    const hint = section.querySelector(".smp-hint");
    const navigation = document.querySelector(".sm-nav-shell");
    const siteHeader = document.querySelector("#site-navigation");
    let closedHeaderHeight = siteHeader ? siteHeader.getBoundingClientRect().height : 72;
    const index = section.querySelector("[data-smp-index]");
    const progress = section.querySelector(".smp-progress");
    const previous = section.querySelector("[data-smp-prev]");
    const next = section.querySelector("[data-smp-next]");
    if (!pin || !header || !viewport || !track || !cards.length || !footer || !hint || !index || !progress || !previous || !next) return;
    section.dataset.smpReady = "true";

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
      const viewportHeight = Math.min(window.innerHeight, window.visualViewport ? window.visualViewport.height : window.innerHeight);
      const bodyStyle = getComputedStyle(document.body);
      const anchorValue = bodyStyle.getPropertyValue("--sm-anchor-offset").trim();
      if (siteHeader && !siteHeader.classList.contains("has-open-menu")) closedHeaderHeight = siteHeader.getBoundingClientRect().height;
      const menuBottom = number(bodyStyle.getPropertyValue("--sm-menu-bottom")) || ((siteHeader ? Math.max(0,siteHeader.getBoundingClientRect().top) : 8) + closedHeaderHeight);
      const navHeight = navigation ? navigation.getBoundingClientRect().height : 0;
      const offset = Math.ceil(/^\d+(?:\.\d+)?px$/.test(anchorValue) ? number(anchorValue) + 16 : menuBottom + navHeight + 16);
      section.style.setProperty("--smp-pin-top", `${offset}px`);
      const availableHeight = Math.max(0, viewportHeight - offset - 12);
      // Le titre défile normalement ; seules les cartes et la progression sont épinglées.
      // La densité dépend de la place disponible, pas de la hauteur mesurée après adaptation.
      section.dataset.smpDensity = availableHeight < 500 ? "compact" : "normal";
      const pinStyle = getComputedStyle(pin);
      const viewportStyle = getComputedStyle(viewport);
      const requiredHeight = Math.ceil(
        number(pinStyle.paddingTop) + number(pinStyle.paddingBottom) +
        track.getBoundingClientRect().height + footer.getBoundingClientRect().height +
        number(pinStyle.rowGap) + number(viewportStyle.paddingTop) + number(viewportStyle.paddingBottom)
      );
      const inset = number(viewportStyle.paddingLeft);
      // La largeur intrinsèque ne change pas sous l’effet du transform.
      const distance = Math.max(0, track.offsetWidth + inset + number(viewportStyle.paddingRight) - viewport.clientWidth);
      const canPin = stickySupported && !reducedMotion.matches && distance > 1 && requiredHeight <= availableHeight + 1;
      const mode = canPin ? "vertical" : "native";
      const changedMode = mode !== state.mode;
      const previousX = state.x;

      state.mode = mode;
      state.distance = distance;
      state.inset = inset;
      state.width = viewport.clientWidth;
      state.positions = cards.map(card => card.offsetLeft);
      state.widths = cards.map(card => card.offsetWidth);
      section.dataset.smpMode = mode;
      hint.textContent = canPin
        ? "Faites défiler vers le bas pour parcourir les quatre étapes."
        : "Balayez horizontalement ou utilisez les flèches pour parcourir les quatre étapes.";
      const headerHeight = header.getBoundingClientRect().height;

      if (canPin) {
        section.style.setProperty("--smp-pin-height", `${requiredHeight}px`);
        section.style.setProperty("--smp-scroll-height", `${headerHeight + requiredHeight + distance}px`);
        viewport.scrollLeft = 0;
      } else {
        section.style.removeProperty("--smp-pin-height");
        section.style.removeProperty("--smp-scroll-height");
        track.style.transform = "";
        if (changedMode) viewport.scrollLeft = clamp(previousX, 0, distance);
      }

      state.start = section.getBoundingClientRect().top + window.scrollY + headerHeight - offset;
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
      [header, viewport, track, footer, navigation, siteHeader].filter(Boolean).forEach(element => observer.observe(element));
    }
    if (navigation || siteHeader) {
      const structure = document.body;
      new MutationObserver(() => schedule(true)).observe(structure,{attributes:true,attributeFilter:["class","style"]});
    }
    if (document.fonts) document.fonts.ready.then(() => schedule(true));
    schedule(true);
  }

  function init() { document.querySelectorAll("[data-smp-carousel]").forEach(mount); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
