(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  var hlsLoading = null;

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    if (!hlsLoading) {
      hlsLoading = new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    hlsLoading.then(callback).catch(function () {
      callback();
    });
  }

  function startPlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play]');
    var source = video ? video.getAttribute('data-src') : '';

    if (!video || !source) {
      return;
    }

    function play() {
      if (button) {
        button.classList.add('is-hidden');
      }
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    if (video.getAttribute('data-ready') === 'true') {
      play();
      return;
    }

    video.setAttribute('data-ready', 'true');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', play, { once: true });
      video.load();
      return;
    }

    loadHls(function () {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, play);
      } else {
        video.src = source;
        video.addEventListener('loadedmetadata', play, { once: true });
        video.load();
      }
    });
  }

  players.forEach(function (shell) {
    var button = shell.querySelector('[data-play]');
    var video = shell.querySelector('video');

    if (button) {
      button.addEventListener('click', function () {
        startPlayer(shell);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        startPlayer(shell);
      });
    }
  });
})();
