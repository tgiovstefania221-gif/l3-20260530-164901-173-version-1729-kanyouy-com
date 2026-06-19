(function () {
  var hlsScriptUrl = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
  var hlsPromise = null;

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsPromise) {
      return hlsPromise;
    }
    hlsPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = hlsScriptUrl;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return hlsPromise;
  }

  function attachVideo(video, src) {
    if (video.dataset.ready === "true") {
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      return new Promise(function (resolve) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.dataset.ready = "true";
          video._hls = hls;
          resolve();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      });
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.dataset.ready = "true";
      return Promise.resolve();
    }

    return loadHls().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        return attachVideo(video, src);
      }
      video.src = src;
      video.dataset.ready = "true";
    }).catch(function () {
      video.src = src;
      video.dataset.ready = "true";
    });
  }

  function initPlayers() {
    var players = document.querySelectorAll(".js-player");
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".js-player-toggle");
      var src = player.getAttribute("data-src");
      if (!video || !button || !src) {
        return;
      }

      function start() {
        attachVideo(video, src).then(function () {
          var playResult = video.play();
          if (playResult && typeof playResult.catch === "function") {
            playResult.catch(function () {});
          }
          player.classList.add("is-playing");
        });
      }

      button.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        } else {
          video.pause();
        }
      });
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        player.classList.remove("is-playing");
      });
      video.addEventListener("ended", function () {
        player.classList.remove("is-playing");
      });
    });
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-mobile-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        startTimer();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        startTimer();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        startTimer();
      });
    });
    hero.addEventListener("mouseenter", stopTimer);
    hero.addEventListener("mouseleave", startTimer);
    show(0);
    startTimer();
  }

  function movieCard(movie) {
    return [
      '<a class="movie-card" href="' + escapeHtml(movie.url) + '">',
      '  <div class="poster-frame">',
      '    <img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="category-badge">' + escapeHtml(movie.category) + '</span>',
      '    <span class="duration-badge">' + escapeHtml(movie.year) + '</span>',
      '    <span class="play-symbol">▶</span>',
      '  </div>',
      '  <div class="card-content">',
      '    <h3>' + escapeHtml(movie.title) + '</h3>',
      '    <p>' + escapeHtml(movie.description || '') + '</p>',
      '    <div class="card-meta">',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '      <span>★ ' + escapeHtml(movie.rating) + '</span>',
      '    </div>',
      '  </div>',
      '</a>'
    ].join("\n");
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var status = document.querySelector("[data-search-status]");
    var form = document.querySelector("[data-search-form]");
    if (!results || !status || !window.SITE_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = form ? form.querySelector('input[name="q"]') : null;
    if (input) {
      input.value = query;
    }
    if (!query) {
      return;
    }
    var normalized = query.toLowerCase();
    var matched = window.SITE_MOVIES.filter(function (movie) {
      return [
        movie.title,
        movie.category,
        movie.type,
        movie.region,
        movie.year,
        movie.description,
        (movie.tags || []).join(" ")
      ].join(" ").toLowerCase().indexOf(normalized) !== -1;
    }).slice(0, 120);
    status.textContent = '搜索“' + query + '”找到 ' + matched.length + ' 个结果';
    if (!matched.length) {
      results.innerHTML = '<div class="search-status">没有找到匹配影片</div>';
      return;
    }
    results.innerHTML = matched.map(movieCard).join("\n");
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initPlayers();
    initSearchPage();
  });
})();
