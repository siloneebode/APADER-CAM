(() => {
  "use strict";

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const number = value => Number.parseFloat(value) || 0;

  function mount(section) {
    if (section.dataset.domainReady) return;
    const heading = section.querySelector(".domain-scroll-heading");
    const runway = section.querySelector(".domain-scroll-runway");
    const pin = section.querySelector(".domain-scroll-pin");
    const viewport = section.querySelector(".domain-scroll-window");
    const track = section.querySelector(".domain-scroll-track");
    const cards = [...section.querySelectorAll(".revue-domain-card")];
    const footer = section.querySelector(".domain-scroll-footer");
    const hint = section.querySelector(".domain-scroll-hint");
    const index = section.querySelector("[data-domain-index]");
    const progress = section.querySelector(".domain-scroll-progress");
    const previous = section.querySelector("[data-domain-prev]");
    const next = section.querySelector("[data-domain-next]");
    if (!heading || !runway || !pin || !viewport || !track || !cards.length || !footer || !hint || !index || !progress || !previous || !next) return;
    section.dataset.domainReady = "true";

    const siteHeader = document.getElementById("site-navigation");
    const navigation = document.querySelector(".sm-nav-shell");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stickySupported = window.CSS && window.CSS.supports("position", "sticky");
    const state = { mode:"native", distance:0, start:0, x:0, positions:[], widths:[], inset:0, width:0 };
    let frame = 0;
    let needsMeasurement = true;
    let lastRange = "";

    function schedule(measure = false) {
      needsMeasurement = needsMeasurement || measure;
      if (!frame) frame = window.requestAnimationFrame(update);
    }

    function pinOffset() {
      const bodyStyle = getComputedStyle(document.body);
      const anchorValue = bodyStyle.getPropertyValue("--sm-anchor-offset").trim();
      if (/^\d+(?:\.\d+)?px$/.test(anchorValue)) return Math.ceil(number(anchorValue) + 16);
      let headerBottom = 0;
      if (siteHeader) {
        const style = getComputedStyle(siteHeader);
        if (style.position === "fixed" || style.position === "sticky") {
          const row = siteHeader.querySelector(".header-row");
          const height = row ? row.getBoundingClientRect().height : siteHeader.getBoundingClientRect().height;
          headerBottom = number(bodyStyle.getPropertyValue("--sm-menu-bottom")) || Math.max(0, number(style.top)) + height;
        }
      }
      // Le menu absolu de l’accueil défile avec le hero et ne masque pas les cartes.
      const navHeight = navigation ? navigation.getBoundingClientRect().height : 0;
      return Math.ceil(headerBottom + navHeight + 16);
    }

    function measure() {
      const wasPinned = state.mode === "vertical" && window.scrollY >= state.start && window.scrollY <= state.start + state.distance;
      const previousX = state.mode === "vertical" ? clamp(window.scrollY - state.start, 0, state.distance) : viewport.scrollLeft;
      const previousBounds = viewport.getBoundingClientRect();
      const viewportHeight = Math.min(window.innerHeight, window.visualViewport ? window.visualViewport.height : window.innerHeight);
      const offset = pinOffset();
      const wasReadingNative = state.mode === "native" && state.positions.length > 0 && previousX > 1 && previousBounds.top < viewportHeight - 12 && previousBounds.bottom > offset;
      const availableHeight = Math.max(0, viewportHeight - offset - 12);
      section.style.setProperty("--domain-scroll-pin-top", `${offset}px`);
      // Une densité déterminée par la fenêtre évite les oscillations de mesure.
      section.dataset.domainDensity = availableHeight < 620 ? "compact" : "normal";
      const pinStyle = getComputedStyle(pin);
      const viewportStyle = getComputedStyle(viewport);
      const requiredHeight = Math.ceil(
        number(pinStyle.paddingTop) + number(pinStyle.paddingBottom) +
        track.getBoundingClientRect().height + footer.getBoundingClientRect().height +
        number(pinStyle.rowGap) + number(viewportStyle.paddingTop) + number(viewportStyle.paddingBottom)
      );
      const inset = number(viewportStyle.paddingLeft);
      const distance = Math.max(0, track.offsetWidth + inset + number(viewportStyle.paddingRight) - viewport.clientWidth);
      const canPin = stickySupported && !reducedMotion.matches && distance > 1 && requiredHeight <= availableHeight + 1;
      const mode = canPin ? "vertical" : "native";
      const changedMode = mode !== state.mode;

      state.mode = mode;
      state.distance = distance;
      state.inset = inset;
      state.width = viewport.clientWidth;
      state.positions = cards.map(card => card.offsetLeft);
      state.widths = cards.map(card => card.offsetWidth);
      section.dataset.domainMode = mode;
      hint.textContent = canPin
        ? "Faites défiler vers le bas pour parcourir les quatre domaines."
        : "Balayez horizontalement ou utilisez les flèches pour parcourir les quatre domaines.";

      if (canPin) {
        section.style.setProperty("--domain-scroll-pin-height", `${requiredHeight}px`);
        section.style.setProperty("--domain-scroll-distance", `${distance}px`);
        viewport.scrollLeft = 0;
      } else {
        section.style.removeProperty("--domain-scroll-pin-height");
        section.style.removeProperty("--domain-scroll-distance");
        track.style.transform = "";
        if (changedMode) viewport.scrollLeft = clamp(previousX, 0, distance);
      }
      // La piste dédiée exclut le titre, les marges et le padding de la section.
      state.start = runway.getBoundingClientRect().top + window.scrollY - offset;
      // Réduire la hauteur de piste ne doit pas projeter la lecture sous les cartes.
      if (changedMode && wasPinned && mode === "native") window.scrollTo({ top:state.start,behavior:"instant" });
      if (changedMode && wasReadingNative && mode === "vertical") window.scrollTo({ top:state.start + clamp(previousX, 0, distance),behavior:"instant" });
    }

    function render() {
      state.x = clamp(state.mode === "vertical" ? window.scrollY - state.start : viewport.scrollLeft, 0, state.distance);
      if (state.mode === "vertical") track.style.transform = `translate3d(${-state.x}px, 0, 0)`;
      const ratio = state.distance ? state.x / state.distance : 0;
      const visibleWidths = state.positions.map((position, cardIndex) => {
        const left = state.inset + position - state.x;
        return Math.max(0, Math.min(state.width, left + state.widths[cardIndex]) - Math.max(0, left));
      });
      // Sur ordinateur plusieurs cartes sont lisibles : le compteur indique leur plage.
      const visibleCards = visibleWidths.map((width, cardIndex) => width >= state.widths[cardIndex] / 2 ? cardIndex : -1).filter(cardIndex => cardIndex >= 0);
      const first = visibleCards[0] ?? 0;
      const last = visibleCards[visibleCards.length - 1] ?? first;
      const range = first === last ? String(first + 1).padStart(2, "0")
        : `${String(first + 1).padStart(2, "0")}–${String(last + 1).padStart(2, "0")}`;
      if (range !== lastRange) {
        index.textContent = `${range} / ${String(cards.length).padStart(2, "0")}`;
        index.setAttribute("aria-label", first === last ? `Domaine ${first + 1} sur ${cards.length} visible` : `Domaines ${first + 1} à ${last + 1} sur ${cards.length} visibles`);
        lastRange = range;
      }
      progress.value = ratio;
      progress.textContent = `${Math.round(ratio * 100)} %`;
      progress.setAttribute("aria-valuetext", `${Math.round(ratio * 100)} % du carrousel parcouru`);
      previous.disabled = state.distance <= 1 || state.x <= 1;
      next.disabled = state.distance <= 1 || state.x >= state.distance - 1;
    }

    function update() {
      frame = 0;
      if (!section.isConnected) return;
      if (needsMeasurement) {
        needsMeasurement = false;
        measure();
      }
      render();
    }

    function goToX(position, immediate = false) {
      const target = clamp(position, 0, state.distance);
      const behavior = immediate || reducedMotion.matches ? "instant" : "smooth";
      if (state.mode === "vertical") window.scrollTo({ top:state.start + target, behavior });
      else viewport.scrollTo({ left:target, behavior });
    }

    function step(direction) {
      const stops = [...new Set([0, ...state.positions.map(position => clamp(position, 0, state.distance)), state.distance])];
      const target = direction > 0 ? stops.find(stop => stop > state.x + 2)
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
    // Tous les liens restent dans l’ordre de tabulation ; le focus révèle sa carte.
    viewport.addEventListener("focusin", event => {
      const cardIndex = cards.findIndex(card => card.contains(event.target));
      if (cardIndex < 0) return;
      // Le focus natif peut faire défiler le conteneur même en mode transformé.
      if (state.mode === "vertical") viewport.scrollLeft = 0;
      const left = state.inset + state.positions[cardIndex] - state.x;
      const right = left + state.widths[cardIndex];
      if (left < state.inset - 1 || right > state.width - state.inset + 1) goToX(state.positions[cardIndex], true);
    });

    // Le scroll de la page reste natif, sans listener wheel ni blocage tactile.
    window.addEventListener("scroll", () => schedule(), { passive:true });
    viewport.addEventListener("scroll", () => schedule(), { passive:true });
    window.addEventListener("resize", () => schedule(true), { passive:true });
    window.addEventListener("load", () => schedule(true), { once:true });
    if (window.visualViewport) window.visualViewport.addEventListener("resize", () => schedule(true), { passive:true });
    if (reducedMotion.addEventListener) reducedMotion.addEventListener("change", () => schedule(true));
    else reducedMotion.addListener(() => schedule(true));
    if (window.ResizeObserver) {
      const observer = new ResizeObserver(() => schedule(true));
      [document.body, heading, viewport, track, footer, navigation, siteHeader].filter(Boolean).forEach(element => observer.observe(element));
    }
    if (window.MutationObserver) {
      const observer = new MutationObserver(() => schedule(true));
      [document.body, navigation, siteHeader].filter(Boolean).forEach(element => observer.observe(element, { attributes:true,attributeFilter:["class","style"] }));
    }
    if (document.fonts) document.fonts.ready.then(() => schedule(true));
    schedule(true);
  }

  function init() {
    const section = document.querySelector("#domaines[data-domain-scroll]");
    if (section) mount(section);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
  else init();
})();
