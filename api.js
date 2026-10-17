/* Shared same-origin API helper for public watch and /admin. */
(function (global) {
  const ERROR_MESSAGES = {
    AUTH_REQUIRED: 'Sessiya tugadi. Qayta kiring.',
    CSRF_REJECTED: 'Xavfsizlik tekshiruvi muvaffaqiyatsiz. Sahifani yangilang.',
    ORIGIN_REJECTED: 'So‘rov rad etildi.',
    INVALID_CREDENTIALS: 'Parol noto‘g‘ri.',
    SETUP_REJECTED: 'O‘rnatish kaliti noto‘g‘ri yoki allaqachon ishlatilgan.',
    SETUP_ALREADY_COMPLETED: 'O‘rnatish allaqachon tugallangan.',
    PASSWORD_LENGTH: 'Parol 14–128 belgi bo‘lishi kerak.',
    TOO_MANY_ATTEMPTS: 'Juda ko‘p urinish. Keyinroq qayta urinib ko‘ring.',
    DUPLICATE_VIDEO: 'Bu video allaqachon mavjud.',
    VERSION_CONFLICT: 'Boshqa o‘zgarish saqlangan. Qayta yuklang yoki o‘zgarishlaringizni saqlang.',
    VIDEO_NOT_FOUND: 'Video topilmadi.',
    SOURCE_TYPE_IMMUTABLE: 'Manba turini o‘zgartirib bo‘lmaydi.',
    UPLOAD_NOT_READY: 'Yuklash tugallanmagan.',
    UPLOAD_STORAGE_UNAVAILABLE: 'Fayl saqlash hozircha mavjud emas.',
    UPLOAD_NOT_ACTIVE: 'Yuklash faol emas.',
    UPLOAD_SIZE_MISMATCH: 'Yuklangan fayl hajmi mos kelmadi.',
    MISSING_PARTS: 'Yuklash qismlari to‘liq emas.',
    INVALID_MP4: 'Faqat haqiqiy MP4 fayl qabul qilinadi.',
    INVALID_PART: 'Yuklash qismi noto‘g‘ri.',
    PART_SIZE_MISMATCH: 'Qism hajmi mos kelmadi.',
    TOO_MANY_UPLOADS: 'Juda ko‘p faol yuklash. Keyinroq urinib ko‘ring.',
    INVALID_YOUTUBE_URL: 'YouTube havolasi HTTPS va youtube.com / youtu.be bo‘lishi kerak.',
    INVALID_KIND: 'Manba turi noto‘g‘ri.',
    INVALID_PUBLISHED: 'Nashr holati noto‘g‘ri.',
    INVALID_EPISODE: 'Qism raqami butun son bo‘lishi kerak.',
    INVALID_SORT: 'Tartib raqami 0–10000 oralig‘ida bo‘lishi kerak.',
    INVALID_TITLEEN: 'Inglizcha sarlavha majburiy (max 200).',
    INVALID_TITLERU: 'Ruscha sarlavha juda uzun.',
    INVALID_SERIES: 'Seriya nomi juda uzun.',
    INVALID_LANGUAGE: 'Til maydoni juda uzun.',
    INVALID_UPLOADID: 'Yuklash identifikatori kerak.',
    INVALID_FILENAME: 'Fayl nomi noto‘g‘ri.',
    INVALID_VERSION: 'Versiya raqami noto‘g‘ri.',
    DATABASE_UNAVAILABLE: 'Ma’lumotlar bazasi mavjud emas. Keyinroq urinib ko‘ring.',
    BODY_TOO_LARGE: 'So‘rov juda katta.',
    JSON_REQUIRED: 'JSON talab qilinadi.',
    INVALID_JSON: 'JSON noto‘g‘ri.',
    NOT_FOUND: 'Topilmadi.',
    METHOD_NOT_ALLOWED: 'Usul qo‘llab-quvvatlanmaydi.',
    INTERNAL_ERROR: 'Ichki xato. Keyinroq urinib ko‘ring.'
  };

  function friendlyError(code, status) {
    if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
    if (status === 401) return ERROR_MESSAGES.AUTH_REQUIRED;
    if (status === 403) return 'Ruxsat rad etildi.';
    if (status === 409) return 'Konflikt. Qayta urinib ko‘ring.';
    if (status === 429) return ERROR_MESSAGES.TOO_MANY_ATTEMPTS;
    if (status === 503) return 'Xizmat vaqtincha mavjud emas. Qayta urinib ko‘ring.';
    return 'So‘rov bajarilmadi. Qayta urinib ko‘ring.';
  }

  class ApiError extends Error {
    constructor(status, code, message) {
      super(message || friendlyError(code, status));
      this.name = 'ApiError';
      this.status = status;
      this.code = code || 'INTERNAL_ERROR';
    }
  }

  async function parseBody(res) {
    const text = await res.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  async function apiRequest(path, options = {}) {
    const {
      method = 'GET',
      body,
      csrfToken,
      signal,
      rawBody,
      headers: extraHeaders
    } = options;

    const headers = Object.assign({}, extraHeaders);
    if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

    const init = {
      method,
      credentials: 'same-origin',
      signal,
      headers
    };

    if (rawBody !== undefined) {
      init.body = rawBody;
    } else if (body !== undefined) {
      headers['content-type'] = 'application/json';
      init.body = JSON.stringify(body);
    }

    let res;
    try {
      res = await fetch(path, init);
    } catch (err) {
      if (err && err.name === 'AbortError') throw err;
      throw new ApiError(0, 'NETWORK_ERROR', 'Tarmoq xatosi. Qayta urinib ko‘ring.');
    }

    const data = await parseBody(res);
    if (!res.ok) {
      const code = data && data.error ? data.error : 'INTERNAL_ERROR';
      throw new ApiError(res.status, code, friendlyError(code, res.status));
    }
    return data;
  }

  global.IlmoraApi = {
    ApiError,
    friendlyError,
    request: apiRequest,
    ERROR_MESSAGES
  };
})(typeof window !== 'undefined' ? window : globalThis);
