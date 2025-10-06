$(function () {
    'use strict';
    cover();
    pagination(true);
    player();
    heroCarousel();
    // responsiveNavigation(); // Removed custom navigation logic
});

function cover() {
    'use strict';

    var image = $('.cover-image');
    if (!image) return;

    image.imagesLoaded(function () {
        $('.site-cover').addClass('initialized');
    });
}

function player() {
    'use strict';
    var player = jQuery('.player');
    var playerAudio = jQuery('.player-audio');
    var playerProgress = jQuery('.player-progress');
    var timeCurrent = jQuery('.player-time-current');
    var timeDuration = jQuery('.player-time-duration');
    var playButton = jQuery('.button-play');
    var backwardButton = jQuery('.player-backward');
    var forwardButton = jQuery('.player-forward');
    var playerSpeed = 1;
    var speedButton = jQuery('.player-speed');

    jQuery('.site').on('click', '.js-play', function () {
        var clicked = jQuery(this);

        if (clicked.hasClass('post-play')) {
            var episode = clicked.closest('.post');
            if (player.attr('data-playing') !== episode.attr('data-id')) {
                playerAudio.attr('src', episode.attr('data-url'));
                jQuery('.post[data-id="' + player.attr('data-playing') + '"]').find('.post-play').removeClass('playing');
                player.attr('data-playing', episode.attr('data-id'));
                player.find('.post-image').attr('src', episode.find('.post-image').attr('src'));
                player.find('.post-title').text(episode.find('.post-title').text());
                player.find('.post-meta time').attr('datetime', episode.find('.post-meta-date time').attr('datetime'));
                player.find('.post-meta time').text(episode.find('.post-meta-date time').text());
            }
        }

        if (playerAudio[0].paused) {
            var playPromise = playerAudio[0].play();
            if (playPromise !== undefined) {
                playPromise
                    .then(function () {
                        clicked.addClass('playing');
                        playButton.addClass('playing');
                        jQuery('.post[data-id="' + player.attr('data-playing') + '"]').find('.post-play').addClass('playing');
                        jQuery('body').addClass('player-opened');
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            }
        } else {
            playerAudio[0].pause();
            clicked.removeClass('playing');
            playButton.removeClass('playing');
            jQuery('.post[data-id="' + player.attr('data-playing') + '"]').find('.post-play').removeClass('playing');
        }
    });

    playerAudio.on('timeupdate', function () {
        const duration = isNaN(playerAudio[0].duration) ? 0 : playerAudio[0].duration;
        timeDuration.text(
            new Date(duration * 1000).toISOString().substring(11, 19)
        );
        playerAudio[0].addEventListener('timeupdate', function (e) {
            timeCurrent.text(
                new Date(e.target.currentTime * 1000)
                    .toISOString()
                    .substring(11, 19)
            );
            playerProgress.css(
                'width',
                (e.target.currentTime / playerAudio[0].duration) * 100 + '%'
            );
        });
    });

    backwardButton.on('click', function () {
        playerAudio[0].currentTime = playerAudio[0].currentTime - 10;
    });

    forwardButton.on('click', function () {
        playerAudio[0].currentTime = playerAudio[0].currentTime + 30;
    });

    speedButton.on('click', function () {
        if (playerSpeed < 2) {
            playerSpeed += 0.5;
        } else {
            playerSpeed = 1;
        }

        playerAudio[0].playbackRate = playerSpeed;
        speedButton.text(playerSpeed + 'x');
    });
}

function heroCarousel() {
    'use strict';

    var carousels = document.querySelectorAll('.hero-bg-carousel');
    if (!carousels.length) {
        return;
    }

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    carousels.forEach(function (carousel) {
        var manifestWrapper = carousel.querySelector('.hero-bg-carousel__manifest');
        if (!manifestWrapper) {
            return;
        }

        var manifestScript = manifestWrapper.querySelector('script[type="application/json"]');
        if (!manifestScript) {
            return;
        }

        var manifest;
        try {
            manifest = JSON.parse(manifestScript.textContent.trim());
        } catch (err) {
            console.warn('Unable to parse hero carousel manifest:', err);
            return;
        }

        var mediaItems = Array.isArray(manifest.media) ? manifest.media : [];
        if (!mediaItems.length) {
            return;
        }

        var defaultDuration = Number(carousel.dataset.defaultDuration) || 8;
        var defaultFade = Number(carousel.dataset.defaultFade) || 1.2;
        var durationSeconds = Number(manifest.durationSeconds) || defaultDuration;
        var fadeSeconds = Number(manifest.fadeSeconds) || defaultFade;

        if (prefersReducedMotion) {
            fadeSeconds = 0;
        }

        carousel.style.setProperty('--hero-carousel-fade', fadeSeconds + 's');

        var slidesContainer = carousel.querySelector('.hero-bg-carousel__slides');
        var slides = [];

        mediaItems.forEach(function (item) {
            if (!item || (!item.src && !item.sources)) {
                return;
            }

            var slide = document.createElement('div');
            slide.className = 'hero-bg-carousel__slide';

            if (item.href) {
                slide.dataset.href = item.href;
            }

            if (item.focalPoint) {
                slide.style.backgroundPosition = item.focalPoint;
            }

            if (item.type === 'video') {
                var video = document.createElement('video');
                video.className = 'hero-bg-carousel__video';
                video.setAttribute('playsinline', '');
                video.setAttribute('muted', '');
                video.muted = true;
                video.preload = 'auto';
                video.loop = false;
                video.autoplay = false;

                if (item.poster) {
                    video.poster = item.poster;
                }

                var sources = Array.isArray(item.sources) ? item.sources : [];
                if (item.src) {
                    sources.push({ src: item.src, type: item.typeHint || 'video/mp4' });
                }

                sources.forEach(function (sourceConfig) {
                    if (!sourceConfig || !sourceConfig.src) {
                        return;
                    }
                    var source = document.createElement('source');
                    source.src = sourceConfig.src;
                    if (sourceConfig.type) {
                        source.type = sourceConfig.type;
                    }
                    video.appendChild(source);
                });

                slide.appendChild(video);
            } else {
                var imageUrl = item.src || item.url;
                if (imageUrl) {
                    slide.style.backgroundImage = "url('" + imageUrl + "')";
                    if (item.alt) {
                        slide.setAttribute('aria-label', item.alt);
                    }
                }
            }

            slidesContainer.appendChild(slide);
            slides.push({ element: slide, config: item });
        });

        if (!slides.length) {
            return;
        }

        var activeIndex = 0;
        var timerId;

        function stopSlide(slideObj) {
            if (!slideObj) {
                return;
            }
            var video = slideObj.element.querySelector('video');
            if (video) {
                video.pause();
                video.currentTime = 0;
            }
        }

        function startSlide(slideObj) {
            if (!slideObj) {
                return;
            }
            var video = slideObj.element.querySelector('video');
            if (video) {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function (err) {
                        console.warn('Hero carousel video failed to play:', err);
                    });
                }
            }
        }

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            if (index === activeIndex) {
                scheduleNext();
                return;
            }

            stopSlide(slides[activeIndex]);
            slides[activeIndex].element.classList.remove('is-active');

            activeIndex = index;
            slides[activeIndex].element.classList.add('is-active');
            startSlide(slides[activeIndex]);

            scheduleNext();
        }

        function scheduleNext() {
            clearTimeout(timerId);
            if (prefersReducedMotion) {
                return;
            }
            timerId = window.setTimeout(function () {
                var nextIndex = (activeIndex + 1) % slides.length;
                showSlide(nextIndex);
            }, durationSeconds * 1000);
        }

        slides[activeIndex].element.classList.add('is-active');
        startSlide(slides[activeIndex]);
        scheduleNext();

        carousel.addEventListener('click', function (event) {
            if (event.defaultPrevented) {
                return;
            }

            if (event.target !== carousel) {
                return;
            }

            var href = slides[activeIndex].element.dataset.href;
            if (href) {
                window.location.href = href;
            }
        });

        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                clearTimeout(timerId);
                stopSlide(slides[activeIndex]);
            } else {
                startSlide(slides[activeIndex]);
                scheduleNext();
            }
        });
    });
}
