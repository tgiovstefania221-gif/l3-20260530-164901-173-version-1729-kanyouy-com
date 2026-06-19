(function () {
  function onReady(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) return;
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (!slides.length) return;
    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function numberFromText(text) {
    var match = String(text || "").match(/\d{4}/);
    return match ? Number(match[0]) : 0;
  }

  function setupFilters() {
    var scopes = document.querySelectorAll("[data-search-scope]");
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var year = scope.querySelector("[data-filter-year]");
      var region = scope.querySelector("[data-filter-region]");
      var category = scope.querySelector("[data-filter-category]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      if (!cards.length) return;

      function apply() {
        var q = input ? input.value.trim().toLowerCase() : "";
        var minYear = year && year.value ? Number(year.value) : 0;
        var regionValue = region ? region.value : "";
        var categoryValue = category ? category.value : "";

        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-category")
          ].join(" ").toLowerCase();
          var cardYear = numberFromText(card.getAttribute("data-year"));
          var matchesText = !q || text.indexOf(q) !== -1;
          var matchesYear = !minYear || cardYear >= minYear;
          var matchesRegion = !regionValue || text.indexOf(regionValue.toLowerCase()) !== -1;
          var matchesCategory = !categoryValue || text.indexOf(categoryValue.toLowerCase()) !== -1;
          card.classList.toggle("is-hidden", !(matchesText && matchesYear && matchesRegion && matchesCategory));
        });
      }

      [input, year, region, category].forEach(function (el) {
        if (!el) return;
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      });
    });
  }

  function setupPlayers() {
    var boxes = document.querySelectorAll("[data-video-box]");
    boxes.forEach(function (box) {
      var video = box.querySelector("video");
      var trigger = box.querySelector("[data-video-trigger]");
      var stream = box.getAttribute("data-stream");
      var attached = false;
      var player = null;
      if (!video || !stream) return;

      function attachStream() {
        if (attached) return;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          attached = true;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          player = new window.Hls({ enableWorker: true });
          player.loadSource(stream);
          player.attachMedia(video);
          attached = true;
          return;
        }
        video.src = stream;
        attached = true;
      }

      function start() {
        attachStream();
        box.classList.add("is-playing");
        if (trigger) {
          trigger.setAttribute("aria-hidden", "true");
        }
        var playResult = video.play();
        if (playResult && typeof playResult.catch === "function") {
          playResult.catch(function () {});
        }
      }

      if (trigger) {
        trigger.addEventListener("click", start);
      }

      video.addEventListener("click", function () {
        if (!attached || video.paused) {
          start();
        }
      });

      window.addEventListener("pagehide", function () {
        if (player && typeof player.destroy === "function") {
          player.destroy();
        }
      });
    });
  }

  onReady(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
