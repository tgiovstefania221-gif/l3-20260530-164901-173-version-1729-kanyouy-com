(function () {
    window.initMoviePlayer = function (source, poster) {
        var video = document.getElementById('movie-player');
        var cover = document.getElementById('player-cover');
        var hls = null;
        var ready = false;

        if (!video || !source) {
            return;
        }

        if (poster) {
            video.setAttribute('poster', poster);
        }

        function attachStream() {
            if (ready) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                ready = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                ready = true;
            }
        }

        function startPlayback() {
            attachStream();

            if (cover) {
                cover.classList.add('is-hidden');
            }

            var playAttempt = video.play();

            if (playAttempt && typeof playAttempt.catch === 'function') {
                playAttempt.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', startPlayback);
        }

        video.addEventListener('click', function () {
            if (!ready) {
                startPlayback();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
}());
