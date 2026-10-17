(function () {
  const api = window.IlmoraApi;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const MAX_UPLOAD = 2 * 1024 * 1024 * 1024;
  const PAGE_SIZE = 12;

  const state = {
    configured: false,
    authenticated: false,
    csrfToken: null,
    uploadsAvailable: false,
    maxUploadBytes: MAX_UPLOAD,
    partSize: 5 * 1024 * 1024,
    setupKey: null,
    q: '',
    archived: '0',
    offset: 0,
    total: 0,
    items: [],
    selectedId: null,
    editing: null,
    dirty: false,
    listAbort: null,
    searchTimer: null,
    upload: null,
    pendingDraft: null
  };

  const els = {
    status: $('#status'),
    headerActions: $('#header-actions'),
    loading: $('#view-loading'),
    sessionError: $('#view-session-error'),
    sessionErrorText: $('#session-error-text'),
    setup: $('#view-setup'),
    login: $('#view-login'),
    app: $('#view-app'),
    libraryList: $('#library-list'),
    libraryEmpty: $('#library-empty'),
    libraryMeta: $('#library-meta'),
    libraryQ: $('#library-q'),
    libraryArchived: $('#library-archived'),
    btnPrev: $('#btn-prev'),
    btnNext: $('#btn-next'),
    formVideo: $('#form-video'),
    formPassword: $('#form-password'),
    editorLead: $('#editor-lead'),
    editorTitle: $('#editor-title'),
    kind: $('#video-kind'),
    youtube: $('#video-youtube'),
    file: $('#video-file'),
    fieldYoutube: $('#field-youtube'),
    fieldMp4: $('#field-mp4'),
    uploadHint: $('#upload-hint'),
    uploadProgress: $('#upload-progress'),
    uploadProgressText: $('#upload-progress-text'),
    uploadBar: $('#upload-bar'),
    uploadReady: $('#upload-ready'),
    btnUploadCancel: $('#btn-upload-cancel'),
    btnUploadRetry: $('#btn-upload-retry'),
    btnArchive: $('#btn-archive'),
    btnRestore: $('#btn-restore'),
    btnReloadConflict: $('#btn-reload-conflict'),
    btnSave: $('#btn-save'),
    formError: $('#form-error'),
    confirmDialog: $('#confirm-dialog'),
    confirmTitle: $('#confirm-title'),
    confirmMessage: $('#confirm-message'),
    confirmOk: $('#confirm-ok')
  };

  function setStatus(message, kind) {
    els.status.textContent = message || '';
    els.status.classList.remove('is-success', 'is-error', 'is-warning');
    if (kind) els.status.classList.add('is-' + kind);
  }

  function showView(name) {
    els.loading.hidden = name !== 'loading';
    els.sessionError.hidden = name !== 'session-error';
    els.setup.hidden = name !== 'setup';
    els.login.hidden = name !== 'login';
    els.app.hidden = name !== 'app';
    els.headerActions.hidden = name !== 'app';
  }

  function setBusy(btn, busy, label) {
    if (!btn) return;
    btn.disabled = !!busy;
    btn.setAttribute('aria-busy', busy ? 'true' : 'false');
    if (label) btn.textContent = label;
  }

  function clearFieldErrors(scope) {
    $$(scope ? scope + ' .field-error' : '.field-error').forEach((el) => {
      el.hidden = true;
      el.textContent = '';
    });
  }

  function showFieldError(id, message) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = message;
    el.hidden = !message;
  }

  function readSetupKeyFromHash() {
    const hash = location.hash || '';
    const match = hash.match(/^#setup=([^&]+)/);
    if (!match) return null;
    const key = decodeURIComponent(match[1]);
    history.replaceState(null, '', location.pathname + location.search);
    return key;
  }

  function passwordChecks(password, confirm) {
    if (typeof password !== 'string' || password.length < 14 || password.length > 128) {
      return { ok: false, error: 'Parol 14–128 belgi bo‘lishi kerak.', field: 'password' };
    }
    if (password !== confirm) {
      return { ok: false, error: 'Parollar mos kelmadi.', field: 'confirm' };
    }
    return { ok: true };
  }

  function youtubeUrlValid(value) {
    let u;
    try {
      u = new URL(value);
    } catch {
      return false;
    }
    if (u.protocol !== 'https:' || u.username || u.password || u.port) return false;
    const host = u.hostname.toLowerCase();
    if (host === 'youtu.be') return /^\/[a-zA-Z0-9_-]{11}/.test(u.pathname);
    if (!['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(host)) return false;
    if (u.pathname === '/watch') return !!u.searchParams.get('v');
    return /^\/(embed|shorts|live)\/[a-zA-Z0-9_-]{11}/.test(u.pathname);
  }

  function statusLabel(item) {
    if (item.deletedAt) return 'Arxivlangan';
    if (item.published) return 'Nashr qilingan';
    return 'Qoralama';
  }

  function statusClass(item) {
    if (item.deletedAt) return 'is-archived';
    if (item.published) return 'is-published';
    return 'is-draft';
  }

  function titleOf(item) {
    return item.titleEn || item.titleRu || 'Videosiz';
  }

  function metaLine(item) {
    const bits = [item.kind === 'mp4' ? 'MP4' : 'YouTube'];
    if (item.series) bits.push(item.series);
    if (item.episode) bits.push('Qism ' + item.episode);
    if (item.language) bits.push(item.language);
    return bits.join(' · ');
  }

  async function confirmDialog(title, message, okLabel) {
    els.confirmTitle.textContent = title;
    els.confirmMessage.textContent = message;
    els.confirmOk.textContent = okLabel || 'Tasdiqlash';
    const dialog = els.confirmDialog;
    if (typeof dialog.showModal !== 'function') return false;
    dialog.returnValue = '';
    dialog.showModal();
    return await new Promise((resolve) => {
      const onClose = () => {
        dialog.removeEventListener('close', onClose);
        resolve(dialog.returnValue === 'confirm');
      };
      dialog.addEventListener('close', onClose);
    });
  }

  function captureDraft() {
    if (els.formVideo.hidden) return null;
    return {
      id: $('#video-id').value || null,
      version: $('#video-version').value || null,
      kind: els.kind.value,
      youtubeUrl: els.youtube.value,
      titleEn: $('#video-title-en').value,
      titleRu: $('#video-title-ru').value,
      series: $('#video-series').value,
      episode: $('#video-episode').value,
      language: $('#video-language').value,
      sortOrder: $('#video-sort').value,
      published: $('#video-published').checked,
      uploadId: state.upload && state.upload.completedId ? state.upload.completedId : null,
      uploadFileName: state.upload && state.upload.fileName ? state.upload.fileName : null
    };
  }

  function applyDraft(draft) {
    if (!draft) return;
    openEditor({
      id: draft.id,
      version: draft.version ? Number(draft.version) : null,
      kind: draft.kind,
      youtubeId: null,
      titleEn: draft.titleEn,
      titleRu: draft.titleRu,
      series: draft.series,
      episode: draft.episode === '' ? null : Number(draft.episode),
      language: draft.language,
      sortOrder: Number(draft.sortOrder) || 100,
      published: !!draft.published,
      deletedAt: null,
      mediaUrl: null
    }, { youtubeUrl: draft.youtubeUrl, restoreUpload: draft });
    state.dirty = true;
  }

  async function loadSession() {
    showView('loading');
    setStatus('Sessiya tekshirilmoqda…');
    try {
      const data = await api.request('/api/admin/session');
      state.configured = !!data.configured;
      state.authenticated = !!data.authenticated;
      state.csrfToken = data.csrfToken || null;
      state.uploadsAvailable = !!data.uploadsAvailable;
      state.maxUploadBytes = data.maxUploadBytes || MAX_UPLOAD;
      state.partSize = data.partSize || state.partSize;
      setStatus('');
      if (!state.configured) {
        showView('setup');
        if (!state.setupKey) {
          showFieldError('setup-key-error', 'O‘rnatish kaliti yo‘q. Maxfiy #setup=… havolasidan foydalaning.');
        }
        $('#setup-password').focus();
        return;
      }
      if (!state.authenticated) {
        showView('login');
        if (state.pendingDraft) setStatus('Sessiya tugadi. Qoralama xotirada saqlangan — qayta kiring.', 'warning');
        $('#login-password').focus();
        return;
      }
      showView('app');
      if (state.pendingDraft) {
        applyDraft(state.pendingDraft);
        state.pendingDraft = null;
        setStatus('Sessiya tiklandi. Saqlanmagan o‘zgarishlar qaytarildi.', 'warning');
      } else {
        resetEditor();
      }
      await loadLibrary();
    } catch (err) {
      showView('session-error');
      els.sessionErrorText.textContent = err.message || 'Sessiyani yuklab bo‘lmadi.';
      setStatus(err.message || 'Xato', 'error');
    }
  }

  async function handleAuthFailure(err) {
    if (err && err.status === 401) {
      state.pendingDraft = captureDraft();
      state.authenticated = false;
      state.csrfToken = null;
      showView('login');
      setStatus('Sessiya tugadi. Qayta kiring — saqlanmagan maydonlar xotirada.', 'warning');
      $('#login-password').focus();
      return true;
    }
    return false;
  }

  async function loadLibrary() {
    if (state.listAbort) state.listAbort.abort();
    const controller = new AbortController();
    state.listAbort = controller;
    els.libraryMeta.textContent = 'Yuklanmoqda…';
    els.libraryEmpty.hidden = true;
    els.libraryList.replaceChildren();
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(state.offset),
        archived: state.archived,
        q: state.q
      });
      const data = await api.request('/api/admin/videos?' + params.toString(), {
        signal: controller.signal
      });
      if (controller.signal.aborted) return;
      state.items = data.items || [];
      state.total = data.total || 0;
      state.offset = data.offset || 0;
      renderLibrary();
    } catch (err) {
      if (err.name === 'AbortError') return;
      if (await handleAuthFailure(err)) return;
      els.libraryMeta.textContent = '';
      els.libraryEmpty.hidden = false;
      els.libraryEmpty.replaceChildren();
      const p = document.createElement('p');
      p.textContent = err.message || 'Ro‘yxatni yuklab bo‘lmadi.';
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.className = 'btn btn-secondary btn-compact';
      retry.textContent = 'Qayta urinish';
      retry.addEventListener('click', () => loadLibrary());
      els.libraryEmpty.append(p, retry);
      setStatus(err.message || 'Xato', 'error');
    }
  }

  function renderLibrary() {
    const from = state.total === 0 ? 0 : state.offset + 1;
    const to = Math.min(state.offset + state.items.length, state.total);
    els.libraryMeta.textContent = state.total
      ? from + '–' + to + ' / ' + state.total
      : '';
    els.btnPrev.disabled = state.offset <= 0;
    els.btnNext.disabled = state.offset + PAGE_SIZE >= state.total;

    if (!state.items.length) {
      els.libraryEmpty.hidden = false;
      els.libraryEmpty.textContent = state.q
        ? 'Qidiruv bo‘yicha hech narsa topilmadi.'
        : state.archived === '1'
          ? 'Arxiv bo‘sh.'
          : 'Hali video yo‘q. Yangi video qo‘shing.';
      els.libraryList.replaceChildren();
      return;
    }

    els.libraryEmpty.hidden = true;
    els.libraryList.replaceChildren(
      ...state.items.map((item) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'admin-list-item' + (item.id === state.selectedId ? ' is-active' : '');
        btn.setAttribute('role', 'listitem');
        const badge = document.createElement('span');
        badge.className = 'admin-badge ' + statusClass(item);
        badge.textContent = statusLabel(item);
        const strong = document.createElement('strong');
        strong.textContent = titleOf(item);
        const meta = document.createElement('span');
        meta.textContent = metaLine(item);
        btn.append(badge, strong, meta);
        btn.addEventListener('click', () => selectVideo(item));
        return btn;
      })
    );
  }

  function resetEditor() {
    state.editing = null;
    state.selectedId = null;
    state.dirty = false;
    els.formVideo.hidden = true;
    els.formPassword.hidden = true;
    els.editorTitle.textContent = 'Video tahriri';
    els.editorLead.hidden = false;
    els.editorLead.textContent = 'Ro‘yxatdan video tanlang yoki yangisini yarating.';
    els.btnReloadConflict.hidden = true;
    clearUploadState(true);
    clearFieldErrors('#form-video');
    renderLibrary();
  }

  function openEditor(item, opts) {
    opts = opts || {};
    els.formPassword.hidden = true;
    els.formVideo.hidden = false;
    els.editorLead.hidden = true;
    state.editing = item;
    state.selectedId = item.id || null;
    state.dirty = false;
    els.btnReloadConflict.hidden = true;
    clearFieldErrors('#form-video');
    showFieldError('form-error', '');

    const isNew = !item.id;
    const isArchived = !!item.deletedAt;
    els.editorTitle.textContent = isNew ? 'Yangi video' : isArchived ? 'Arxivdagi video' : 'Videoni tahrirlash';

    $('#video-id').value = item.id || '';
    $('#video-version').value = item.version != null ? String(item.version) : '';
    els.kind.value = item.kind || 'youtube';
    els.kind.disabled = !isNew;
    els.youtube.value = opts.youtubeUrl || (item.youtubeId ? 'https://www.youtube.com/watch?v=' + item.youtubeId : '');
    $('#video-title-en').value = item.titleEn || '';
    $('#video-title-ru').value = item.titleRu || '';
    $('#video-series').value = item.series || '';
    $('#video-episode').value = item.episode != null ? String(item.episode) : '';
    $('#video-language').value = item.language || '';
    $('#video-sort').value = item.sortOrder != null ? String(item.sortOrder) : '100';
    $('#video-published').checked = isNew ? false : !!item.published;

    els.btnArchive.hidden = isNew || isArchived;
    els.btnRestore.hidden = isNew || !isArchived;
    els.btnSave.hidden = isArchived;
    $('#btn-cancel-edit').hidden = false;

    if (!opts.restoreUpload) clearUploadState(true);
    updateKindFields();
    updateUploadAvailability();

    if (opts.restoreUpload && opts.restoreUpload.uploadId) {
      state.upload = {
        completedId: opts.restoreUpload.uploadId,
        fileName: opts.restoreUpload.uploadFileName || 'yuklangan.mp4',
        running: false
      };
      els.uploadReady.hidden = false;
      els.uploadReady.textContent = 'Yuklash tayyor: ' + state.upload.fileName;
    }

    if (item.kind === 'mp4' && item.id && !isNew) {
      els.uploadReady.hidden = false;
      els.uploadReady.textContent = 'Mavjud MP4 saqlanadi. Yangi fayl kerak emas.';
      els.file.disabled = true;
    } else if (els.kind.value === 'mp4') {
      els.file.disabled = !state.uploadsAvailable;
    }

    renderLibrary();
  }

  function updateKindFields() {
    const kind = els.kind.value;
    els.fieldYoutube.hidden = kind !== 'youtube';
    els.fieldMp4.hidden = kind !== 'mp4';
  }

  function updateUploadAvailability() {
    if (!state.uploadsAvailable) {
      els.uploadHint.textContent = 'Fayl saqlash (R2) hozircha mavjud emas. MP4 yuklab bo‘lmaydi — faqat YouTube qo‘shing yoki keyinroq urinib ko‘ring.';
      els.file.disabled = true;
    } else {
      els.uploadHint.textContent = 'Maksimal 2 GiB. Video saqlashdan oldin yuklash tugashi shart. Qismlar ketma-ket yuboriladi.';
      if (!(state.editing && state.editing.id && state.editing.kind === 'mp4')) {
        els.file.disabled = false;
      }
    }
  }

  function clearUploadState(silent) {
    if (state.upload && state.upload.controller) {
      state.upload.controller.abort();
    }
    state.upload = null;
    els.file.value = '';
    els.uploadProgress.hidden = true;
    els.uploadReady.hidden = true;
    els.uploadReady.textContent = '';
    els.btnUploadRetry.hidden = true;
    els.uploadBar.value = 0;
    els.uploadProgressText.textContent = '';
    if (!silent) showFieldError('file-error', '');
  }

  async function abortUploadOnServer(uploadId, csrf) {
    if (!uploadId || !csrf) return;
    try {
      await api.request('/api/admin/uploads/' + uploadId + '/abort', {
        method: 'POST',
        csrfToken: csrf,
        body: {}
      });
    } catch (_) {
      /* best-effort */
    }
  }

  async function ensureCanDiscardUpload() {
    if (!state.upload || !state.upload.running) return true;
    const ok = await confirmDialog(
      'Yuklash bekor qilinsinmi?',
      'Davom etayotgan MP4 yuklash yo‘qoladi.',
      'Bekor qilish'
    );
    if (!ok) return false;
    await cancelUpload(true);
    return true;
  }

  async function cancelUpload(fromSwitch) {
    const up = state.upload;
    if (!up) return;
    if (up.controller) up.controller.abort();
    up.running = false;
    await abortUploadOnServer(up.uploadId, state.csrfToken);
    clearUploadState(true);
    if (!fromSwitch) setStatus('Yuklash bekor qilindi.', 'warning');
  }

  async function startUpload(file) {
    if (!state.uploadsAvailable) {
      showFieldError('file-error', 'Fayl saqlash mavjud emas.');
      return;
    }
    if (!file || !/\.mp4$/i.test(file.name)) {
      showFieldError('file-error', 'Faqat .mp4 fayl qabul qilinadi.');
      return;
    }
    if (file.type && !['video/mp4', 'application/mp4', 'application/octet-stream'].includes(file.type)) {
      showFieldError('file-error', 'Fayl video/mp4 bo‘lishi kerak.');
      return;
    }
    if (!file || file.size < 12 || file.size > state.maxUploadBytes) {
      showFieldError('file-error', 'Fayl 12 baytdan 2 GiB gacha bo‘lishi kerak.');
      return;
    }

    showFieldError('file-error', '');
    els.uploadProgress.hidden = false;
    els.uploadReady.hidden = true;
    els.btnUploadRetry.hidden = true;
    els.uploadBar.value = 0;
    els.uploadProgressText.textContent = 'Yuklash boshlanmoqda…';

    const controller = new AbortController();
    state.upload = {
      running: true,
      file,
      fileName: file.name,
      controller,
      uploadId: null,
      completedId: null,
      partSize: state.partSize,
      totalParts: 0,
      sent: 0
    };

    try {
      const created = await api.request('/api/admin/uploads', {
        method: 'POST',
        csrfToken: state.csrfToken,
        body: { filename: file.name, size: file.size },
        signal: controller.signal
      });
      state.upload.uploadId = created.uploadId;
      state.upload.partSize = created.partSize || state.partSize;
      state.upload.totalParts = created.totalParts;
      await uploadParts(state.upload);
      const done = await api.request('/api/admin/uploads/' + state.upload.uploadId + '/complete', {
        method: 'POST',
        csrfToken: state.csrfToken,
        body: {},
        signal: controller.signal
      });
      state.upload.running = false;
      state.upload.completedId = done.uploadId;
      els.uploadProgress.hidden = true;
      els.uploadReady.hidden = false;
      els.uploadReady.textContent = 'Yuklash tugadi: ' + file.name + '. Endi videoni saqlashingiz mumkin.';
      setStatus('MP4 yuklandi.', 'success');
    } catch (err) {
      if (err.name === 'AbortError') return;
      if (await handleAuthFailure(err)) return;
      state.upload.running = false;
      els.uploadProgressText.textContent = err.message || 'Yuklash muvaffaqiyatsiz.';
      els.btnUploadRetry.hidden = false;
      setStatus(err.message || 'Yuklash xatosi', 'error');
      showFieldError('file-error', err.message || 'Yuklash xatosi. Faylni qayta tanlang yoki qayta urining.');
    }
  }

  async function uploadParts(up) {
    const total = up.totalParts;
    for (let n = 1; n <= total; n++) {
      if (up.controller.signal.aborted) throw new DOMException('Aborted', 'AbortError');
      const start = (n - 1) * up.partSize;
      const end = Math.min(up.file.size, start + up.partSize);
      const blob = up.file.slice(start, end);
      let attempt = 0;
      while (true) {
        try {
          await api.request('/api/admin/uploads/' + up.uploadId + '/parts/' + n, {
            method: 'PUT',
            csrfToken: state.csrfToken,
            rawBody: blob,
            signal: up.controller.signal
          });
          break;
        } catch (err) {
          if (err.name === 'AbortError') throw err;
          if (await handleAuthFailure(err)) throw err;
          attempt += 1;
          if (attempt > 2) throw err;
          els.uploadProgressText.textContent = 'Qism ' + n + ' qayta urinilmoqda (' + attempt + '/2)…';
        }
      }
      up.sent = end;
      const pct = Math.round((end / up.file.size) * 100);
      els.uploadBar.value = pct;
      els.uploadProgressText.textContent = 'Yuklanmoqda: ' + pct + '% (qism ' + n + '/' + total + ')';
    }
  }

  function selectVideo(item) {
    if (state.dirty) {
      confirmDialog('Saqlanmagan o‘zgarishlar', 'Boshqa videoga o‘tsangiz joriy o‘zgarishlar yo‘qoladi.', 'O‘tish').then((ok) => {
        if (ok) openEditor(item);
      });
      return;
    }
    openEditor(item);
  }

  function validateVideoForm() {
    clearFieldErrors('#form-video');
    showFieldError('form-error', '');
    const kind = els.kind.value;
    const titleEn = $('#video-title-en').value.trim();
    if (!titleEn || titleEn.length > 200) {
      showFieldError('title-en-error', 'Inglizcha sarlavha majburiy (max 200).');
      return null;
    }
    const titleRu = $('#video-title-ru').value.trim();
    if (titleRu.length > 200) {
      showFieldError('title-ru-error', 'Ruscha sarlavha juda uzun.');
      return null;
    }
    const episodeRaw = $('#video-episode').value.trim();
    let episode = null;
    if (episodeRaw !== '') {
      episode = Number(episodeRaw);
      if (!Number.isInteger(episode) || episode < 1 || episode > 10000) {
        showFieldError('episode-error', 'Qism raqami 1–10000 oralig‘ida butun son bo‘lsin.');
        return null;
      }
    }
    const sortOrder = Number($('#video-sort').value);
    if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 10000) {
      showFieldError('sort-error', 'Tartib 0–10000 oralig‘ida bo‘lishi kerak.');
      return null;
    }
    const payload = {
      kind,
      titleEn,
      titleRu,
      series: $('#video-series').value.trim(),
      episode,
      language: $('#video-language').value.trim(),
      published: $('#video-published').checked,
      sortOrder
    };
    if (kind === 'youtube') {
      const youtubeUrl = els.youtube.value.trim();
      if (!youtubeUrlValid(youtubeUrl)) {
        showFieldError('youtube-error', 'To‘g‘ri HTTPS YouTube havolasini kiriting.');
        return null;
      }
      payload.youtubeUrl = youtubeUrl;
    } else {
      const isNew = !$('#video-id').value;
      if (isNew) {
        if (!state.uploadsAvailable) {
          showFieldError('file-error', 'Fayl saqlash mavjud emas.');
          return null;
        }
        if (!state.upload || !state.upload.completedId) {
          showFieldError('file-error', 'Avval MP4 yuklashni tugating.');
          return null;
        }
        payload.uploadId = state.upload.completedId;
      }
    }
    if ($('#video-id').value) {
      payload.version = Number($('#video-version').value);
    }
    return payload;
  }

  async function saveVideo(ev) {
    ev.preventDefault();
    const payload = validateVideoForm();
    if (!payload) return;
    if (state.upload && state.upload.running) {
      showFieldError('file-error', 'Yuklash tugaguncha kuting yoki bekor qiling.');
      return;
    }
    setBusy(els.btnSave, true, 'Saqlanmoqda…');
    els.btnReloadConflict.hidden = true;
    try {
      const id = $('#video-id').value;
      const data = id
        ? await api.request('/api/admin/videos/' + id, {
            method: 'PUT',
            csrfToken: state.csrfToken,
            body: payload
          })
        : await api.request('/api/admin/videos', {
            method: 'POST',
            csrfToken: state.csrfToken,
            body: payload
          });
      state.dirty = false;
      clearUploadState(true);
      setStatus(id ? 'Video yangilandi.' : 'Video yaratildi.', 'success');
      state.selectedId = data.video.id;
      await loadLibrary();
      openEditor(data.video);
    } catch (err) {
      if (await handleAuthFailure(err)) return;
      if (err.status === 503) {
        setStatus(err.message, 'error');
        showFieldError('form-error', err.message);
        return;
      }
      if (err.code === 'VERSION_CONFLICT') {
        state.dirty = true;
        els.btnReloadConflict.hidden = false;
        showFieldError('form-error', err.message);
        setStatus(err.message, 'warning');
        return;
      }
      if (err.code === 'DUPLICATE_VIDEO') {
        showFieldError('form-error', err.message);
        if (payload.kind === 'youtube') showFieldError('youtube-error', err.message);
        setStatus(err.message, 'error');
        return;
      }
      showFieldError('form-error', err.message || 'Saqlab bo‘lmadi.');
      setStatus(err.message || 'Xato', 'error');
    } finally {
      setBusy(els.btnSave, false, 'Saqlash');
    }
  }

  async function archiveVideo() {
    const item = state.editing;
    if (!item || !item.id) return;
    const ok = await confirmDialog(
      'Arxivlash',
      '«' + titleOf(item) + '» arxivlanadi. Keyin qayta tiklash mumkin. Fayl o‘chirilmaydi.',
      'Arxivlash'
    );
    if (!ok) return;
    try {
      await api.request('/api/admin/videos/' + item.id, {
        method: 'DELETE',
        csrfToken: state.csrfToken
      });
      setStatus('Video arxivlandi.', 'success');
      state.dirty = false;
      resetEditor();
      await loadLibrary();
    } catch (err) {
      if (await handleAuthFailure(err)) return;
      setStatus(err.message || 'Arxivlab bo‘lmadi.', 'error');
    }
  }

  async function restoreVideo() {
    const item = state.editing;
    if (!item || !item.id) return;
    try {
      await api.request('/api/admin/videos/' + item.id + '/restore', {
        method: 'POST',
        csrfToken: state.csrfToken,
        body: {}
      });
      setStatus('Video qayta tiklandi.', 'success');
      state.archived = '0';
      els.libraryArchived.value = '0';
      await loadLibrary();
      const refreshed = state.items.find((v) => v.id === item.id);
      if (refreshed) openEditor(refreshed);
      else {
        resetEditor();
      }
    } catch (err) {
      if (await handleAuthFailure(err)) return;
      setStatus(err.message || 'Tiklab bo‘lmadi.', 'error');
    }
  }

  async function reloadConflict() {
    const id = $('#video-id').value;
    if (!id) return;
    try {
      const params = new URLSearchParams({ limit: '50', offset: '0', archived: state.archived, q: '' });
      const data = await api.request('/api/admin/videos?' + params.toString());
      const found = (data.items || []).find((v) => v.id === id);
      if (!found) {
        const other = state.archived === '0' ? '1' : '0';
        const data2 = await api.request('/api/admin/videos?limit=50&offset=0&archived=' + other);
        const found2 = (data2.items || []).find((v) => v.id === id);
        if (!found2) {
          setStatus('Serverdagi video topilmadi.', 'error');
          return;
        }
        openEditor(found2);
      } else {
        openEditor(found);
      }
      setStatus('Serverdagi joriy versiya yuklandi.', 'success');
    } catch (err) {
      if (await handleAuthFailure(err)) return;
      setStatus(err.message || 'Yangilab bo‘lmadi.', 'error');
    }
  }

  function bindEvents() {
    $('#btn-session-retry').addEventListener('click', loadSession);

    $('#form-setup').addEventListener('submit', async (ev) => {
      ev.preventDefault();
      clearFieldErrors('#form-setup');
      const password = $('#setup-password').value;
      const confirm = $('#setup-confirm').value;
      const check = passwordChecks(password, confirm);
      if (!check.ok) {
        showFieldError(check.field === 'confirm' ? 'setup-confirm-error' : 'setup-password-error', check.error);
        return;
      }
      if (!state.setupKey) {
        showFieldError('setup-key-error', 'O‘rnatish kaliti yo‘q.');
        return;
      }
      setBusy($('#btn-setup'), true, 'Saqlanmoqda…');
      try {
        const data = await api.request('/api/admin/setup', {
          method: 'POST',
          body: { setupKey: state.setupKey, password }
        });
        state.setupKey = null;
        state.configured = true;
        state.authenticated = true;
        state.csrfToken = data.csrfToken;
        $('#setup-password').value = '';
        $('#setup-confirm').value = '';
        setStatus('O‘rnatish tugadi.', 'success');
        showView('app');
        resetEditor();
        await loadLibrary();
      } catch (err) {
        setStatus(err.message || 'O‘rnatish muvaffaqiyatsiz.', 'error');
        showFieldError('setup-password-error', err.message || '');
      } finally {
        setBusy($('#btn-setup'), false, 'O‘rnatishni tugatish');
      }
    });

    $('#form-login').addEventListener('submit', async (ev) => {
      ev.preventDefault();
      clearFieldErrors('#form-login');
      const password = $('#login-password').value;
      if (!password) {
        showFieldError('login-password-error', 'Parolni kiriting.');
        return;
      }
      setBusy($('#btn-login'), true, 'Kirilmoqda…');
      try {
        const data = await api.request('/api/admin/login', {
          method: 'POST',
          body: { password }
        });
        $('#login-password').value = '';
        state.authenticated = true;
        state.csrfToken = data.csrfToken;
        showView('app');
        if (state.pendingDraft) {
          applyDraft(state.pendingDraft);
          state.pendingDraft = null;
          setStatus('Kirildi. Saqlanmagan o‘zgarishlar qaytarildi.', 'warning');
        } else {
          resetEditor();
          setStatus('Xush kelibsiz.', 'success');
        }
        await loadLibrary();
      } catch (err) {
        showFieldError('login-password-error', err.message || 'Kirib bo‘lmadi.');
        setStatus(err.message || 'Xato', 'error');
      } finally {
        setBusy($('#btn-login'), false, 'Kirish');
      }
    });

    $('#btn-logout').addEventListener('click', async () => {
      try {
        await api.request('/api/admin/logout', {
          method: 'POST',
          csrfToken: state.csrfToken,
          body: {}
        });
      } catch (_) {
        /* still clear local session */
      }
      state.authenticated = false;
      state.csrfToken = null;
      state.pendingDraft = null;
      clearUploadState(true);
      showView('login');
      setStatus('Chiqildi.', 'success');
      $('#login-password').focus();
    });

    $('#btn-password').addEventListener('click', () => {
      els.formVideo.hidden = true;
      els.formPassword.hidden = false;
      els.editorLead.hidden = true;
      els.editorTitle.textContent = 'Parolni almashtirish';
      clearFieldErrors('#form-password');
      $('#pw-current').value = '';
      $('#pw-new').value = '';
      $('#pw-confirm').value = '';
      $('#pw-current').focus();
    });

    $('#btn-pw-cancel').addEventListener('click', () => {
      els.formPassword.hidden = true;
      if (state.editing) openEditor(state.editing);
      else resetEditor();
    });

    $('#form-password').addEventListener('submit', async (ev) => {
      ev.preventDefault();
      clearFieldErrors('#form-password');
      const currentPassword = $('#pw-current').value;
      const password = $('#pw-new').value;
      const confirm = $('#pw-confirm').value;
      if (!currentPassword) {
        showFieldError('pw-current-error', 'Joriy parolni kiriting.');
        return;
      }
      const check = passwordChecks(password, confirm);
      if (!check.ok) {
        showFieldError(check.field === 'confirm' ? 'pw-confirm-error' : 'pw-new-error', check.error);
        return;
      }
      setBusy($('#btn-pw-save'), true, 'Saqlanmoqda…');
      try {
        await api.request('/api/admin/password', {
          method: 'POST',
          csrfToken: state.csrfToken,
          body: { currentPassword, password }
        });
        state.authenticated = false;
        state.csrfToken = null;
        $('#pw-current').value = '';
        $('#pw-new').value = '';
        $('#pw-confirm').value = '';
        showView('login');
        setStatus('Parol yangilandi. Qayta kiring.', 'success');
        $('#login-password').focus();
      } catch (err) {
        if (await handleAuthFailure(err)) return;
        showFieldError('pw-current-error', err.message || 'Parolni almashtirib bo‘lmadi.');
        setStatus(err.message || 'Xato', 'error');
      } finally {
        setBusy($('#btn-pw-save'), false, 'Parolni saqlash');
      }
    });

    $('#btn-new').addEventListener('click', async () => {
      if (state.dirty) {
        const ok = await confirmDialog('Saqlanmagan o‘zgarishlar', 'Yangi video yaratilsa joriy o‘zgarishlar yo‘qoladi.', 'Davom etish');
        if (!ok) return;
      }
      if (!(await ensureCanDiscardUpload())) return;
      openEditor({
        kind: 'youtube',
        titleEn: '',
        titleRu: '',
        series: '',
        episode: null,
        language: '',
        sortOrder: 100,
        published: false
      });
      state.dirty = false;
      $('#video-title-en').focus();
    });

    $('#btn-cancel-edit').addEventListener('click', async () => {
      if (state.dirty) {
        const ok = await confirmDialog('Bekor qilish', 'Saqlanmagan o‘zgarishlar yo‘qoladi.', 'Bekor qilish');
        if (!ok) return;
      }
      if (!(await ensureCanDiscardUpload())) return;
      resetEditor();
    });

    els.formVideo.addEventListener('submit', saveVideo);
    els.formVideo.addEventListener('input', () => {
      state.dirty = true;
    });
    els.formVideo.addEventListener('change', () => {
      state.dirty = true;
    });

    els.kind.addEventListener('change', async () => {
      if (!(await ensureCanDiscardUpload())) {
        els.kind.value = els.kind.value === 'youtube' ? 'mp4' : 'youtube';
        return;
      }
      clearUploadState(true);
      updateKindFields();
      updateUploadAvailability();
    });

    els.file.addEventListener('change', async () => {
      const file = els.file.files && els.file.files[0];
      if (!file) return;
      if (!(await ensureCanDiscardUpload())) {
        els.file.value = '';
        return;
      }
      if (state.upload && state.upload.uploadId && !state.upload.completedId) {
        await abortUploadOnServer(state.upload.uploadId, state.csrfToken);
      }
      clearUploadState(true);
      await startUpload(file);
    });

    els.btnUploadCancel.addEventListener('click', () => cancelUpload(false));
    els.btnUploadRetry.addEventListener('click', async () => {
      const file = state.upload && state.upload.file;
      if (!file) {
        showFieldError('file-error', 'Qayta urinish uchun faylni qayta tanlang.');
        els.file.value = '';
        els.file.focus();
        return;
      }
      if (state.upload && state.upload.uploadId) {
        await abortUploadOnServer(state.upload.uploadId, state.csrfToken);
      }
      await startUpload(file);
    });

    els.btnArchive.addEventListener('click', archiveVideo);
    els.btnRestore.addEventListener('click', restoreVideo);
    els.btnReloadConflict.addEventListener('click', reloadConflict);

    els.libraryQ.addEventListener('input', () => {
      const value = els.libraryQ.value.trim();
      if (state.searchTimer) clearTimeout(state.searchTimer);
      state.searchTimer = setTimeout(() => {
        state.q = value;
        state.offset = 0;
        loadLibrary();
      }, 300);
    });

    els.libraryArchived.addEventListener('change', () => {
      state.archived = els.libraryArchived.value;
      state.offset = 0;
      loadLibrary();
    });

    els.btnPrev.addEventListener('click', () => {
      state.offset = Math.max(0, state.offset - PAGE_SIZE);
      loadLibrary();
    });
    els.btnNext.addEventListener('click', () => {
      state.offset = state.offset + PAGE_SIZE;
      loadLibrary();
    });
  }

  state.setupKey = readSetupKeyFromHash();
  bindEvents();
  loadSession();
})();
