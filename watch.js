// Public Watch: loads published videos from GET /api/videos. No static fallback on failure.
Object.assign(I18N.en, {
  watchNav: 'Watch',
  watchTitle: 'Watch official anime',
  watchIntro: 'Full episodes and films from the publisher selection and owner-added sources.',
  watchSource: "Publisher's official selection",
  watchLoad: 'Load player',
  watchUnload: 'Unload player',
  watchOriginal: 'Open original on YouTube',
  watchChoose: 'Choose anime video',
  watchNote: 'Availability and embedding depend on your country and the publisher. If playback is unavailable, open the original video.',
  watchLoading: 'Loading videos…',
  watchEmpty: 'No published videos yet.',
  watchError: 'Could not load videos.',
  watchRetry: 'Retry',
  watchMore: 'Load more',
  watchSearching: 'Searching…'
});
Object.assign(I18N.ru, {
  watchNav: 'Смотреть',
  watchTitle: 'Смотреть официальное аниме',
  watchIntro: 'Полные серии и фильмы из подборки издателя и добавленных владельцем источников.',
  watchSource: 'Официальная подборка издателя',
  watchLoad: 'Открыть плеер',
  watchUnload: 'Закрыть плеер',
  watchOriginal: 'Открыть оригинал на YouTube',
  watchChoose: 'Выберите видео',
  watchNote: 'Доступность и встраивание зависят от страны и издателя. Если видео не воспроизводится, откройте оригинал.',
  watchLoading: 'Загрузка видео…',
  watchEmpty: 'Пока нет опубликованных видео.',
  watchError: 'Не удалось загрузить видео.',
  watchRetry: 'Повторить',
  watchMore: 'Ещё',
  watchSearching: 'Поиск…'
});

const WATCH_PAGE = 24;
const watchState = {
  items: [],
  total: 0,
  offset: 0,
  q: '',
  loading: false,
  error: null,
  selected: null,
  playerMounted: false,
  abort: null,
  searchTimer: null
};

function watchTitle(video) {
  if (!video) return '';
  return state.lang === 'ru' ? (video.titleRu || video.titleEn) : (video.titleEn || video.titleRu);
}

function watchMeta(video) {
  if (!video) return '';
  const bits = [];
  if (video.series) bits.push(video.series);
  if (video.episode != null) bits.push(state.lang === 'ru' ? ('Серия ' + video.episode) : ('Episode ' + video.episode));
  if (video.language) bits.push(video.language);
  if (!bits.length) {
    bits.push(video.kind === 'mp4' ? 'MP4' : 'YouTube');
  }
  return bits.join(' · ');
}

function stopWatchPlayer() {
  const stage = $('#watch-stage');
  const videoEl = stage && stage.querySelector('video');
  if (videoEl) {
    try {
      videoEl.pause();
      videoEl.removeAttribute('src');
      videoEl.load();
    } catch (_) {
      /* ignore */
    }
  }
  const iframe = stage && stage.querySelector('iframe');
  if (iframe) iframe.src = 'about:blank';
}

function unloadWatchPlayer() {
  stopWatchPlayer();
  watchState.playerMounted = false;
  const button = document.createElement('button');
  button.className = 'btn btn-primary';
  button.type = 'button';
  button.id = 'load-player';
  button.textContent = t('watchLoad');
  button.addEventListener('click', mountWatchPlayer);
  $('#watch-stage').replaceChildren(button);
  $('#unload-player').hidden = true;
  button.focus();
}

function mountWatchPlayer() {
  const video = watchState.selected;
  if (!video) return;
  stopWatchPlayer();
  const stage = $('#watch-stage');
  if (video.kind === 'mp4') {
    const el = document.createElement('video');
    el.controls = true;
    el.playsInline = true;
    el.setAttribute('playsinline', '');
    el.preload = 'metadata';
    el.src = video.mediaUrl || ('/media/' + video.id);
    el.title = watchTitle(video);
    stage.replaceChildren(el);
  } else {
    const frame = document.createElement('iframe');
    const url = new URL('https://www.youtube.com/embed/' + video.youtubeId);
    url.search = new URLSearchParams({
      playsinline: '1',
      rel: '0',
      cc_lang_pref: 'en',
      cc_load_policy: '1',
      hl: state.lang,
      origin: location.origin
    });
    frame.src = url.href;
    frame.title = watchTitle(video);
    frame.allow = 'encrypted-media; fullscreen; picture-in-picture';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    stage.replaceChildren(frame);
  }
  watchState.playerMounted = true;
  $('#unload-player').hidden = false;
  renderWatchChrome();
}

function renderWatchChrome() {
  const video = watchState.selected;
  $('#watch-selected').textContent = watchTitle(video);
  const original = $('#watch-original');
  if (video && video.kind === 'youtube' && video.youtubeId) {
    original.hidden = false;
    original.href = 'https://www.youtube.com/watch?v=' + video.youtubeId;
    original.textContent = t('watchOriginal');
  } else {
    original.hidden = true;
    original.removeAttribute('href');
  }
  $('#watch-note').textContent = t('watchNote');
  $('#unload-player').textContent = t('watchUnload');
  const loadBtn = $('#load-player');
  if (loadBtn) loadBtn.textContent = t('watchLoad');
  if (watchState.playerMounted) {
    const iframe = $('#watch-stage iframe');
    if (iframe) iframe.title = watchTitle(video);
    const native = $('#watch-stage video');
    if (native) native.title = watchTitle(video);
  }
}

function renderWatchChoices() {
  const group = $('#watch-choices');
  group.setAttribute('aria-label', t('watchChoose'));
  group.replaceChildren(
    ...watchState.items.map((video) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'watch-choice';
      button.dataset.videoId = video.id;
      button.setAttribute('aria-pressed', String(video === watchState.selected));
      const title = document.createElement('strong');
      title.textContent = watchTitle(video);
      const label = document.createElement('span');
      label.textContent = watchMeta(video);
      button.append(title, label);
      button.addEventListener('click', () => {
        const wasMounted = watchState.playerMounted;
        const same = watchState.selected && watchState.selected.id === video.id;
        if (same) {
          renderWatch();
          document.querySelector(`[data-video-id="${video.id}"]`)?.focus();
          return;
        }
        if (wasMounted) stopWatchPlayer();
        watchState.selected = video;
        if (wasMounted) mountWatchPlayer();
        renderWatch();
        document.querySelector(`[data-video-id="${video.id}"]`)?.focus();
      });
      return button;
    })
  );
}

function renderWatchStatus() {
  const status = $('#watch-status');
  const empty = $('#watch-empty');
  const more = $('#watch-more');
  if (!status || !empty || !more) return;

  if (watchState.loading && !watchState.items.length) {
    status.textContent = t('watchLoading');
    empty.hidden = true;
    more.hidden = true;
    return;
  }

  if (watchState.error && !watchState.items.length) {
    status.textContent = '';
    empty.hidden = false;
    empty.replaceChildren();
    const p = document.createElement('p');
    p.textContent = t('watchError');
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'btn btn-secondary btn-compact';
    retry.textContent = t('watchRetry');
    retry.addEventListener('click', () => loadWatchVideos({ reset: true }));
    empty.append(p, retry);
    more.hidden = true;
    return;
  }

  if (!watchState.loading && !watchState.items.length) {
    status.textContent = '';
    empty.hidden = false;
    empty.textContent = t('watchEmpty');
    more.hidden = true;
    return;
  }

  empty.hidden = true;
  status.textContent = watchState.error ? t('watchError') : watchState.loading ? t('watchLoading') : '';
  const hasMore = watchState.offset + watchState.items.length < watchState.total;
  more.hidden = !hasMore;
  more.disabled = !!watchState.loading;
  more.textContent = t('watchMore');
}

function renderWatch() {
  renderWatchChoices();
  renderWatchChrome();
  renderWatchStatus();
}

async function loadWatchVideos(opts) {
  opts = opts || {};
  if (watchState.abort) watchState.abort.abort();
  const controller = new AbortController();
  watchState.abort = controller;
  if (opts.reset) {
    watchState.offset = 0;
    watchState.items = [];
    watchState.selected = null;
    if (watchState.playerMounted) unloadWatchPlayer();
  }
  watchState.loading = true;
  watchState.error = null;
  renderWatchStatus();

  try {
    const params = new URLSearchParams({
      limit: String(WATCH_PAGE),
      offset: String(opts.append ? watchState.items.length : watchState.offset),
      q: watchState.q
    });
    const data = await IlmoraApi.request('/api/videos?' + params.toString(), {
      signal: controller.signal
    });
    if (controller.signal.aborted) return;
    const items = data.items || [];
    watchState.total = data.total || 0;
    if (opts.append) {
      watchState.items = watchState.items.concat(items);
    } else {
      watchState.items = items;
      watchState.offset = data.offset || 0;
      if (!watchState.selected && items.length) watchState.selected = items[0];
      if (watchState.selected) {
        const still = watchState.items.find((v) => v.id === watchState.selected.id);
        watchState.selected = still || items[0] || null;
      }
      if (!watchState.playerMounted) {
        const stage = $('#watch-stage');
        if (stage && !stage.querySelector('#load-player') && !stage.querySelector('iframe') && !stage.querySelector('video')) {
          unloadWatchPlayer();
        } else if (stage && stage.querySelector('#load-player')) {
          $('#load-player').textContent = t('watchLoad');
        }
      }
    }
    watchState.loading = false;
    renderWatch();
  } catch (err) {
    if (err.name === 'AbortError') return;
    watchState.loading = false;
    watchState.error = err.message || t('watchError');
    if (!opts.append) {
      watchState.items = [];
      watchState.selected = null;
      if (watchState.playerMounted) unloadWatchPlayer();
    }
    renderWatch();
  }
}

function bindWatch() {
  const loadBtn = $('#load-player');
  if (loadBtn) loadBtn.addEventListener('click', mountWatchPlayer);
  $('#unload-player').addEventListener('click', unloadWatchPlayer);
  $('#lang').addEventListener('click', () => {
    renderWatch();
  });
  const more = $('#watch-more');
  if (more) {
    more.addEventListener('click', () => {
      if (watchState.loading) return;
      loadWatchVideos({ append: true });
    });
  }
  window.addEventListener('pagehide', stopWatchPlayer);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      /* keep element but pause native video */
      const videoEl = $('#watch-stage video');
      if (videoEl) {
        try { videoEl.pause(); } catch (_) {}
      }
    }
  });
}

bindWatch();
render();
loadWatchVideos({ reset: true });
