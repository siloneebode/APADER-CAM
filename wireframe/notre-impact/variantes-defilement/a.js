(() => {
  "use strict";

  const section = document.querySelector("#chiffres-cles.ips-section");
  if (!section || section.dataset.ipsInitialized === "true") return;

  const steps = [...section.querySelectorAll("[data-ips-step]")];
  const photos = [...section.querySelectorAll("[data-ips-photo]")];
  const index = section.querySelector("[data-ips-index]");
  const legend = section.querySelector("[data-ips-legend]");
  if (!steps.length || steps.length !== photos.length) return;

  section.dataset.ipsInitialized = "true";
  const mobile = window.matchMedia("(max-width: 700px)");
  let active = -1;
  let frame = 0;

  function activate(next) {
    if (next === active) return;
    active = next;

    steps.forEach((step, position) => {
      step.classList.toggle("ips-is-active", position === next);
    });

    photos.forEach((photo, position) => {
      const isActive = position === next;
      photo.classList.toggle("ips-is-active", isActive);
      photo.setAttribute("aria-hidden", String(mobile.matches || !isActive));
    });

    if (index) index.textContent = String(next + 1).padStart(2, "0");
    if (legend) {
      const title = steps[next].querySelector(".ips-domain-title");
      legend.textContent = title ? title.textContent.trim() : "";
    }
  }

  function update() {
    frame = 0;
    // A step takes over when its heading reaches the upper half of the viewport.
    // Reading and scrolling remain native: no pinned scroll, click or focus changes.
    const threshold = window.innerHeight * 0.45;
    let next = 0;

    if (!mobile.matches) {
      steps.forEach((step, position) => {
        if (step.getBoundingClientRect().top <= threshold) next = position;
      });
    }

    activate(next);
  }

  function schedule() {
    if (!frame) frame = window.requestAnimationFrame(update);
  }

  function onModeChange() {
    active = -1;
    schedule();
  }

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("pageshow", schedule);

  if (typeof mobile.addEventListener === "function") {
    mobile.addEventListener("change", onModeChange);
  } else {
    mobile.addListener(onModeChange);
  }

  if (typeof ResizeObserver === "function") {
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(section);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(schedule);
  }

  update();
})();
