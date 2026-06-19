(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    const button = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector("[data-nav-links]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    const stage = document.querySelector("[data-hero-stage]");
    if (!stage) {
      return;
    }
    const slides = Array.from(stage.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    let current = 0;
    let timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
    function play() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    function reset() {
      if (timer) {
        window.clearInterval(timer);
      }
      play();
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        reset();
      });
    });
    show(0);
    play();
  }

  function initSearchFilter() {
    const input = document.querySelector("[data-filter-input]");
    const cards = Array.from(document.querySelectorAll("[data-title]"));
    if (!input || !cards.length) {
      return;
    }
    function filter() {
      const query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        const text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year")
        ].join(" ").toLowerCase();
        card.style.display = !query || text.indexOf(query) !== -1 ? "" : "none";
      });
    }
    const params = new URLSearchParams(window.location.search);
    const preset = params.get("q");
    if (preset) {
      input.value = preset;
    }
    input.addEventListener("input", filter);
    filter();
  }

  onReady(function () {
    initMenu();
    initHero();
    initSearchFilter();
  });
})();
