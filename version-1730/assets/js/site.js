(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        if (dotIndex === index) {
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.removeAttribute('aria-current');
        }
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    start();
  }

  const filterForms = Array.from(document.querySelectorAll('[data-filter-form]'));

  filterForms.forEach(function (form) {
    const input = form.querySelector('[data-filter-input]');
    const typeSelect = form.querySelector('[data-filter-type]');
    const yearSelect = form.querySelector('[data-filter-year]');
    const regionSelect = form.querySelector('[data-filter-region]');
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
    const emptyState = document.querySelector('[data-empty-state]');
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';

    if (input && query) {
      input.value = query;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      const text = normalize(input ? input.value : '');
      const typeValue = normalize(typeSelect ? typeSelect.value : '');
      const yearValue = normalize(yearSelect ? yearSelect.value : '');
      const regionValue = normalize(regionSelect ? regionSelect.value : '');
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.category
        ].join(' '));
        const typeMatch = !typeValue || normalize(card.dataset.type).includes(typeValue);
        const regionMatch = !regionValue || normalize(card.dataset.region).includes(regionValue);
        const yearMatch = !yearValue || normalize(card.dataset.year).includes(yearValue);
        const textMatch = !text || haystack.includes(text);
        const matched = typeMatch && regionMatch && yearMatch && textMatch;

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, typeSelect, yearSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  });

  const players = Array.from(document.querySelectorAll('.video-player[data-hls]'));

  players.forEach(function (video) {
    const source = video.getAttribute('data-hls');
    const shell = video.closest('.player-shell');
    const triggers = shell ? Array.from(shell.querySelectorAll('.play-trigger')) : [];
    let loaded = false;
    let hls = null;

    function attach() {
      if (loaded || !source) {
        return;
      }

      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function play() {
      attach();
      const promise = video.play();
      if (promise && typeof promise.then === 'function') {
        promise.then(function () {
          if (shell) {
            shell.classList.add('is-playing');
          }
        }).catch(function () {
          if (shell) {
            shell.classList.add('is-playing');
          }
        });
      } else if (shell) {
        shell.classList.add('is-playing');
      }
    }

    triggers.forEach(function (button) {
      button.addEventListener('click', play);
    });

    video.addEventListener('play', function () {
      if (shell) {
        shell.classList.add('is-playing');
      }
    });

    video.addEventListener('pause', function () {
      if (shell) {
        shell.classList.remove('is-playing');
      }
    });

    video.addEventListener('loadedmetadata', function () {
      if (video.autoplay) {
        play();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
