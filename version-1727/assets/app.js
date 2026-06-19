(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-hero-card]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!cards.length) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + cards.length) % cards.length;
      cards.forEach(function (card, cardIndex) {
        card.classList.toggle("active", cardIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === active);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(index);
        play();
      });
    });

    show(0);
    play();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilters() {
    var searchInput = document.querySelector("[data-filter-search]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var regionSelect = document.querySelector("[data-filter-region]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var empty = document.querySelector("[data-empty-state]");
    if (!cards.length || (!searchInput && !yearSelect && !regionSelect)) {
      return;
    }

    function apply() {
      var keyword = normalize(searchInput ? searchInput.value : "");
      var year = yearSelect ? yearSelect.value : "";
      var region = regionSelect ? regionSelect.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.textContent
        ].join(" "));
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = !year || card.getAttribute("data-year") === year;
        var matchRegion = !region || card.getAttribute("data-region") === region;
        var matched = matchKeyword && matchYear && matchRegion;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }

    [searchInput, yearSelect, regionSelect].forEach(function (el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });
    apply();
  }

  function initSearchPage() {
    var input = document.querySelector("[data-site-search]");
    var result = document.querySelector("[data-search-results]");
    if (!input || !result || !window.MOVIE_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function render() {
      var keyword = normalize(input.value);
      var list = window.MOVIE_INDEX.filter(function (movie) {
        var pool = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.oneLine
        ].join(" "));
        return !keyword || pool.indexOf(keyword) !== -1;
      }).slice(0, 120);

      result.innerHTML = list.map(function (movie) {
        return [
          '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-year="' + movie.year + '" data-region="' + escapeHtml(movie.region) + '" data-genre="' + escapeHtml(movie.genre) + '">',
          '  <a class="poster-wrap" href="' + movie.detail + '">',
          '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '    <span class="play-dot">▶</span>',
          '  </a>',
          '  <div class="movie-card-body">',
          '    <h3><a href="' + movie.detail + '">' + escapeHtml(movie.title) + '</a></h3>',
          '    <p>' + escapeHtml(movie.oneLine) + '</p>',
          '    <div class="meta-line"><span>' + movie.year + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
          '    <div class="tag-row">' + movie.tags.slice(0, 4).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
          '  </div>',
          '</article>'
        ].join('');
      }).join('');
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    input.addEventListener("input", render);
    render();
  }

  function initPlayer() {
    var playerBox = document.querySelector("[data-player-box]");
    if (!playerBox) {
      return;
    }
    var video = playerBox.querySelector("video");
    var overlay = playerBox.querySelector("[data-player-overlay]");
    var playButton = playerBox.querySelector("[data-play-button]");
    if (!video) {
      return;
    }
    var src = video.getAttribute("data-src");
    var loaded = false;

    function loadSource() {
      if (loaded || !src) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else {
        video.src = src;
      }
    }

    function start() {
      loadSource();
      if (overlay) {
        overlay.classList.add("hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          video.setAttribute("controls", "controls");
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    if (playButton) {
      playButton.addEventListener("click", function (event) {
        event.stopPropagation();
        start();
      });
    }
    video.addEventListener("click", loadSource, { once: true });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initSearchPage();
    initPlayer();
  });
})();
