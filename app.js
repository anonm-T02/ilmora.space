const SHOWS = [
  {
    slug: "attack-on-titan",
    en: "Attack on Titan",
    ru: "Атака титанов",
    genre: "Action"
  },
  {
    slug: "demon-slayer",
    en: "Demon Slayer",
    ru: "Клинок, рассекающий демонов",
    genre: "Action"
  },
  {
    slug: "jujutsu-kaisen",
    en: "Jujutsu Kaisen",
    ru: "Магическая битва",
    genre: "Fantasy"
  },
  {
    slug: "spy-x-family",
    en: "Spy x Family",
    ru: "Семья шпиона",
    genre: "Comedy"
  },
  {
    slug: "frieren",
    en: "Frieren",
    ru: "Фрирен",
    genre: "Fantasy"
  },
  {
    slug: "one-piece",
    en: "One Piece",
    ru: "Ван-Пис",
    genre: "Adventure"
  },
  {
    slug: "my-hero-academia",
    en: "My Hero Academia",
    ru: "Моя геройская академия",
    genre: "Action"
  },
  {
    slug: "haikyu",
    en: "Haikyu!!",
    ru: "Волейбол!!",
    genre: "Sports"
  },
  {
    slug: "your-lie-in-april",
    en: "Your Lie in April",
    ru: "Твоя апрельская ложь",
    genre: "Romance"
  },
  {
    slug: "dr-stone",
    en: "Dr. Stone",
    ru: "Доктор Стоун",
    genre: "Adventure"
  },
  {
    slug: "mob-psycho-100",
    en: "Mob Psycho 100",
    ru: "Моб Психо 100",
    genre: "Comedy"
  },
  {
    slug: "blue-lock",
    en: "Blue Lock",
    ru: "Синяя тюрьма",
    genre: "Sports"
  }
];

const FEATURED_SLUGS = ["jujutsu-kaisen", "demon-slayer", "frieren"];
const GENRES = ["All", "Action", "Fantasy", "Comedy", "Adventure", "Sports", "Romance"];

const I18N = {
  en: {
    skip: "Skip to catalog",
    menu: "Menu",
    navToggle: "Open navigation",
    navFeatured: "Featured",
    navCatalog: "Catalog",
    navDiscover: "Discover",
    navAbout: "About",
    lang: "RU",
    heroBadge: "Anime discovery",
    headline: "Discover your next obsession",
    intro:
      "Discover anime and visit official streaming platforms. Search in English or Russian.",
    browse: "Explore anime",
    surprise: "Surprise me",
    featuredTitle: "Featured",
    featuredSub: "Three titles worth opening first.",
    catalogTitle: "Discover anime",
    searchLabel: "Search anime",
    searchPlaceholder: "Search anime in Russian or English…",
    genresLabel: "Genres",
    detail: "Details",
    noResults: "No results",
    clearFilters: "Clear filters",
    disclaimer:
      "ILMORA ANIME is an independent discovery catalog. We don't host or stream copyrighted videos. Availability and languages depend on country and provider.",
    discoverTitle: "Worth discovering",
    discoverSub:
      "Browse the full directory and open official sources when you are ready to watch.",
    discoverCta: "Open catalog",
    adLabel: "Advertisement",
    privacy: "Privacy",
    terms: "Terms",
    about: "About",
    contact: "Contact",
    close: "Close",
    dialogNote: "Official sources only. Availability depends on your region.",
    crunchy: "Search on Crunchyroll",
    muse: "Muse Asia official YouTube channel",
    genreAll: "All",
    genreAction: "Action",
    genreFantasy: "Fantasy",
    genreComedy: "Comedy",
    genreAdventure: "Adventure",
    genreSports: "Sports",
    genreRomance: "Romance",
    watchNav: "Watch",
    watchTitle: "Watch official anime",
    watchIntro: "Full episodes and films from the publisher selection and owner-added sources.",
    watchSource: "Publisher's official selection",
    watchLoad: "Load player",
    watchUnload: "Unload player",
    watchOriginal: "Open original on YouTube",
    watchChoose: "Choose anime video",
    watchNote: "Availability and embedding depend on your country and the publisher. If playback is unavailable, open the original video.",
    watchLoading: "Loading videos…",
    watchEmpty: "No published videos yet.",
    watchError: "Could not load videos.",
    watchRetry: "Retry",
    watchMore: "Load more",
    watchSearching: "Searching…"
  },
  ru: {
    skip: "К каталогу",
    menu: "Меню",
    navToggle: "Открыть навигацию",
    navFeatured: "Избранное",
    navCatalog: "Каталог",
    navDiscover: "Открытия",
    navAbout: "О сайте",
    lang: "EN",
    heroBadge: "Открытие аниме",
    headline: "Найди своё следующее увлечение",
    intro:
      "Каталог аниме на русском и английском. Переходите к официальным платформам.",
    browse: "Смотреть каталог",
    surprise: "Удиви меня",
    featuredTitle: "Избранное",
    featuredSub: "Три тайтла, с которых стоит начать.",
    catalogTitle: "Каталог аниме",
    searchLabel: "Поиск аниме",
    searchPlaceholder: "Поиск аниме на русском и английском…",
    genresLabel: "Жанры",
    detail: "Подробнее",
    noResults: "Ничего не найдено",
    clearFilters: "Сбросить фильтры",
    disclaimer:
      "ILMORA ANIME — независимый каталог. Мы не размещаем и не транслируем аниме. Доступность и язык зависят от страны и сервиса.",
    discoverTitle: "Стоит открыть",
    discoverSub:
      "Просмотрите каталог и переходите к официальным источникам, когда будете готовы смотреть.",
    discoverCta: "Открыть каталог",
    adLabel: "Реклама",
    privacy: "Конфиденциальность",
    terms: "Условия",
    about: "О сайте",
    contact: "Контакты",
    close: "Закрыть",
    dialogNote: "Только официальные источники. Доступность зависит от региона.",
    crunchy: "Искать на Crunchyroll",
    muse: "Официальный канал Muse Asia на YouTube",
    genreAll: "Все",
    genreAction: "Экшен",
    genreFantasy: "Фэнтези",
    genreComedy: "Комедия",
    genreAdventure: "Приключения",
    genreSports: "Спорт",
    genreRomance: "Романтика",
    watchNav: "Смотреть",
    watchTitle: "Смотреть официальное аниме",
    watchIntro: "Полные серии и фильмы из подборки издателя и добавленных владельцем источников.",
    watchSource: "Официальная подборка издателя",
    watchLoad: "Открыть плеер",
    watchUnload: "Закрыть плеер",
    watchOriginal: "Открыть оригинал на YouTube",
    watchChoose: "Выберите видео",
    watchNote: "Доступность и встраивание зависят от страны и издателя. Если видео не воспроизводится, откройте оригинал.",
    watchLoading: "Загрузка видео…",
    watchEmpty: "Пока нет опубликованных видео.",
    watchError: "Не удалось загрузить видео.",
    watchRetry: "Повторить",
    watchMore: "Ещё",
    watchSearching: "Поиск…"
  }
};

const GENRE_I18N_KEY = {
  All: "genreAll",
  Action: "genreAction",
  Fantasy: "genreFantasy",
  Comedy: "genreComedy",
  Adventure: "genreAdventure",
  Sports: "genreSports",
  Romance: "genreRomance"
};

const state = {
  lang: "en",
  genre: "All",
  query: "",
  lastFocus: null
};

const $ = (sel, root = document) => root.querySelector(sel);

function t(key) {
  return I18N[state.lang][key] || I18N.en[key] || key;
}

function titleOf(show) {
  return state.lang === "ru" ? show.ru : show.en;
}

function posterPath(slug) {
  return `assets/${slug}.jpg`;
}

function isLocalHost() {
  const host = window.location.hostname;
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "[::1]" ||
    host === "" ||
    host === "0.0.0.0"
  );
}

function readParams() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  const genre = params.get("genre");
  const lang = params.get("lang");

  if (typeof q === "string") state.query = q;
  if (genre && GENRES.includes(genre)) state.genre = genre;
  if (lang === "ru" || lang === "en") state.lang = lang;
}

function writeParams() {
  const params = new URLSearchParams();
  if (state.query.trim()) params.set("q", state.query.trim());
  if (state.genre !== "All") params.set("genre", state.genre);
  if (state.lang !== "en") params.set("lang", state.lang);

  const next = params.toString();
  const url = (next ? `${window.location.pathname}?${next}` : window.location.pathname) + window.location.hash;
  window.history.replaceState(null, "", url);
}

function applyStaticI18n() {
  document.documentElement.lang = state.lang;
  document.title = state.lang === 'ru' ? 'ILMORA ANIME — Каталог аниме' : 'ILMORA ANIME — Discover anime';
  $('.site-nav')?.setAttribute('aria-label', state.lang === 'ru' ? 'Основная навигация' : 'Primary navigation');
  $('.footer-nav')?.setAttribute('aria-label', state.lang === 'ru' ? 'Информация о сайте' : 'Site information');
  $('.ad-region')?.setAttribute('aria-label', t('adLabel'));

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key) el.textContent = t(key);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (key) el.setAttribute("placeholder", t(key));
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria");
    if (key) el.setAttribute("aria-label", t(key));
  });

  const langBtn = $("#lang");
  if (langBtn) {
    langBtn.textContent = t("lang");
    langBtn.setAttribute("aria-pressed", state.lang === "ru" ? "true" : "false");
  }

  const genres = $("#genres");
  if (genres) genres.setAttribute("aria-label", t("genresLabel"));

  const closeBtn = $(".dialog-close");
  if (closeBtn) closeBtn.setAttribute("aria-label", t("close"));
}

function filteredShows() {
  const q = state.query.trim().toLowerCase();
  return SHOWS.filter((show) => {
    const genreOk = state.genre === "All" || show.genre === state.genre;
    if (!genreOk) return false;
    if (!q) return true;
    return (
      show.en.toLowerCase().includes(q) || show.ru.toLowerCase().includes(q)
    );
  });
}

function cardMarkup(show) {
  const title = titleOf(show);
  const detailLabel = t("detail");
  return `
    <article class="card">
      <div class="card-poster">
        <img src="${posterPath(show.slug)}" alt="" width="300" height="450" loading="lazy" decoding="async">
      </div>
      <div class="card-info">
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(t(GENRE_I18N_KEY[show.genre]))}</p>
        <button type="button" class="card-action" data-watch="${escapeAttr(show.en)}" aria-label="${escapeAttr(detailLabel + ": " + title)}">${escapeHtml(detailLabel)}</button>
      </div>
    </article>
  `;
}

function featureMarkup(show) {
  const title = titleOf(show);
  const detailLabel = t("detail");
  return `
    <article class="feature-card">
      <div class="feature-poster">
        <img src="${posterPath(show.slug)}" alt="" width="96" height="144" loading="lazy" decoding="async">
      </div>
      <div class="feature-body">
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(t(GENRE_I18N_KEY[show.genre]))}</p>
        <button type="button" class="card-action" data-watch="${escapeAttr(show.en)}" aria-label="${escapeAttr(detailLabel + ": " + title)}">${escapeHtml(detailLabel)}</button>
      </div>
    </article>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

function renderGenres() {
  const root = $("#genres");
  if (!root) return;
  const focused = root.contains(document.activeElement) ? document.activeElement.dataset.genre : null;

  root.innerHTML = GENRES.map((genre) => {
    const pressed = state.genre === genre;
    const label = t(GENRE_I18N_KEY[genre]);
    return `<button type="button" class="genre-btn" data-genre="${genre}" aria-pressed="${pressed ? "true" : "false"}">${escapeHtml(label)}</button>`;
  }).join("");
  if (focused) root.querySelector(`[data-genre="${focused}"]`)?.focus();
}

function renderFeatured() {
  const root = $("#featured-grid");
  if (!root) return;
  const items = FEATURED_SLUGS.map((slug) => SHOWS.find((s) => s.slug === slug)).filter(Boolean);
  root.innerHTML = items.map(featureMarkup).join("");
}

function renderGrid() {
  const grid = $("#grid");
  const empty = $("#empty");
  if (!grid || !empty) return;

  const search = $("#search");
  const keepFocus = document.activeElement === search;
  const selectionStart = keepFocus ? search.selectionStart : null;
  const selectionEnd = keepFocus ? search.selectionEnd : null;

  const items = filteredShows();
  grid.innerHTML = items.map(cardMarkup).join("");
  empty.hidden = items.length > 0;
  $('#result-status').textContent = state.lang === 'ru' ? `Найдено аниме: ${items.length}` : `${items.length} anime found`;

  if (keepFocus && search) {
    search.focus();
    if (selectionStart != null && selectionEnd != null) {
      try {
        search.setSelectionRange(selectionStart, selectionEnd);
      } catch (_) {
        /* ignore unsupported selection ranges */
      }
    }
  }
}

function render() {
  applyStaticI18n();
  renderGenres();
  renderFeatured();
  renderGrid();
  writeParams();
}

function openDetails(englishTitle) {
  const dialog = $("#details");
  const chosen = $("#chosen");
  const crunchy = $("#crunchy");
  if (!dialog || !chosen || !crunchy) return;

  const show = SHOWS.find((s) => s.en === englishTitle);
  state.lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  chosen.textContent = show ? titleOf(show) : englishTitle;
  crunchy.href =
    "https://www.crunchyroll.com/search?q=" + encodeURIComponent(englishTitle);

  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }

  const closeBtn = $(".dialog-close", dialog);
  if (closeBtn) closeBtn.focus();
}

function closeDetails() {
  const dialog = $("#details");
  if (!dialog) return;
  if (typeof dialog.close === "function") {
    dialog.close();
  } else {
    dialog.removeAttribute("open");
  }
}

function restoreFocus() {
  if (state.lastFocus && document.contains(state.lastFocus)) {
    state.lastFocus.focus();
  }
  state.lastFocus = null;
}

function surprise() {
  const pick = SHOWS[Math.floor(Math.random() * SHOWS.length)];
  openDetails(pick.en);
}

function clearFilters() {
  state.query = "";
  state.genre = "All";
  const search = $("#search");
  if (search) search.value = "";
  render();
  if (search) search.focus();
}

const ADSENSE_CLIENT = "ca-pub-9510066374957209";
const ADSENSE_SCRIPT =
  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" +
  ADSENSE_CLIENT;

function pushAdSenseSlot() {
  const slot = document.querySelector("#ad-slot ins.adsbygoogle");
  if (!slot) return;
  if (slot.dataset.adInit === "1") return;
  if (slot.getAttribute("data-adsbygoogle-status")) return;
  slot.dataset.adInit = "1";
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch (_) {
    /* ignore ad push errors (extensions / blocked network) */
    slot.dataset.adInit = "0";
  }
}

function loadAdsProductionOnly() {
  if (isLocalHost()) return;
  if (!document.querySelector("#ad-slot ins.adsbygoogle")) return;

  const existing = document.querySelector(
    'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]'
  );
  if (existing) {
    // Head snippet is preferred; push once DOM is ready.
    pushAdSenseSlot();
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = ADSENSE_SCRIPT;
  script.crossOrigin = "anonymous";
  script.addEventListener("load", pushAdSenseSlot, { once: true });
  document.head.appendChild(script);
}

function bindEvents() {
  const search = $("#search");
  if (search) {
    search.value = state.query;
    search.addEventListener("input", () => {
      state.query = search.value;
      renderGrid();
      writeParams();
    });
  }

  $("#lang")?.addEventListener("click", () => {
    state.lang = state.lang === "en" ? "ru" : "en";
    render();
  });

  $("#surprise")?.addEventListener("click", surprise);
  $("#clear-filters")?.addEventListener("click", clearFilters);

  $("#genres")?.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-genre]");
    if (!btn) return;
    state.genre = btn.getAttribute("data-genre") || "All";
    render();
  });

  document.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-watch]");
    if (!btn) return;
    openDetails(btn.getAttribute("data-watch") || "");
  });

  const dialog = $("#details");
  dialog?.addEventListener("close", restoreFocus);
  dialog?.addEventListener("cancel", () => {
    /* Escape is handled natively; focus restored on close */
  });

  const navToggle = $("#nav-toggle");
  const siteNav = $("#site-nav");
  navToggle?.addEventListener("click", () => {
    const open = siteNav?.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  siteNav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });
}

function init() {
  readParams();
  bindEvents();
  render();
  loadAdsProductionOnly();
}

init();
