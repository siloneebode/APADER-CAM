(() => {
  'use strict';

  document.querySelectorAll('[data-motif-carousel]').forEach(carousel => {
    const track = carousel.querySelector('[data-motif-track]');
    if (!track) return;

    const slides = [...track.querySelectorAll('[data-motif-slide]')];
    if (!slides.length) return;

    const previous = carousel.querySelector('[data-motif-prev]');
    const next = carousel.querySelector('[data-motif-next]');
    const choices = [...carousel.querySelectorAll('[data-motif-go]')];
    const choicesBar = carousel.querySelector('.motif-context-choices');
    const counter = carousel.querySelector('[data-motif-counter]');
    const scenarios = slides.map(slide => slide.querySelector('.motif-scenario'));
    let index = 0;
    let scrollTimer;
    let resizeFrame;
    let heightFrame;
    let lastTrackWidth = track.getBoundingClientRect().width;

    const positionOf = slide =>
      slide.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft - track.clientLeft;

    const updateHeight = () => {
      const scenario = scenarios[index];
      if (!scenario) return;
      const style = getComputedStyle(track);
      const borders = (parseFloat(style.borderTopWidth) || 0) + (parseFloat(style.borderBottomWidth) || 0);
      const height = `${Math.ceil(scenario.offsetHeight + borders)}px`;
      if (track.style.height !== height) track.style.height = height;
    };
    const scheduleHeight = () => {
      cancelAnimationFrame(heightFrame);
      heightFrame = requestAnimationFrame(updateHeight);
    };

    const render = () => {
      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === index;
        slide.inert = !active;
        slide.setAttribute('aria-hidden', String(!active));
      });
      choices.forEach(choice => {
        choice.setAttribute('aria-pressed', String(Number(choice.dataset.motifGo) === index));
      });
      const activeChoice = choices.find(choice => Number(choice.dataset.motifGo) === index);
      if (choicesBar && activeChoice) {
        const item = activeChoice.getBoundingClientRect();
        const bar = choicesBar.getBoundingClientRect();
        if (item.right > bar.right) choicesBar.scrollBy({left: item.right - bar.right + 8, behavior: 'auto'});
        else if (item.left < bar.left) choicesBar.scrollBy({left: item.left - bar.left - 8, behavior: 'auto'});
      }
      if (previous) previous.disabled = index === 0;
      if (next) next.disabled = index === slides.length - 1;
      if (counter) {
        counter.textContent = `${index + 1} / ${slides.length} · ${slides[index].dataset.slideLabel || ''}`;
      }
      updateHeight();
    };

    const goTo = (nextIndex, animate = true) => {
      index = Math.max(0, Math.min(slides.length - 1, nextIndex));
      render();
      track.scrollTo({
        left: positionOf(slides[index]),
        behavior: animate && document.documentElement.dataset.motion === 'on' ? 'smooth' : 'auto'
      });
    };

    const syncFromScroll = () => {
      clearTimeout(scrollTimer);
      let nearest = 0;
      let distance = Infinity;
      slides.forEach((slide, slideIndex) => {
        const candidateDistance = Math.abs(positionOf(slide) - track.scrollLeft);
        if (candidateDistance < distance) {
          nearest = slideIndex;
          distance = candidateDistance;
        }
      });
      if (nearest !== index) {
        index = nearest;
        render();
      }
    };

    previous?.addEventListener('click', () => goTo(index - 1));
    next?.addEventListener('click', () => goTo(index + 1));
    choices.forEach(choice => {
      choice.addEventListener('click', () => goTo(Number(choice.dataset.motifGo)));
    });

    track.addEventListener('keydown', event => {
      // Links and buttons inside a slide keep their normal keyboard behavior.
      if (event.target !== track) return;
      const destinations = {
        ArrowLeft: index - 1,
        ArrowRight: index + 1,
        Home: 0,
        End: slides.length - 1
      };
      if (!(event.key in destinations)) return;
      event.preventDefault();
      goTo(destinations[event.key]);
    });

    track.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(syncFromScroll, 140);
    }, {passive: true});
    track.addEventListener('scrollend', syncFromScroll);

    const restoreAfterResize = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        clearTimeout(scrollTimer);
        goTo(index, false);
      });
    };
    if (typeof ResizeObserver !== 'undefined') {
      // Changing the track height must not trigger another resize/reposition cycle.
      new ResizeObserver(() => {
        const width = track.getBoundingClientRect().width;
        if (Math.abs(width - lastTrackWidth) > .5) {
          lastTrackWidth = width;
          restoreAfterResize();
        }
      }).observe(track);
      const scenarioObserver = new ResizeObserver(scheduleHeight);
      scenarios.forEach(scenario => { if (scenario) scenarioObserver.observe(scenario); });
    } else {
      window.addEventListener('resize', restoreAfterResize, {passive: true});
    }
    track.querySelectorAll('img').forEach(image => image.addEventListener('load', scheduleHeight));
    document.fonts?.ready.then(scheduleHeight);

    render();
  });
})();
