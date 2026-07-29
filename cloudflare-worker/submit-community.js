/**
 * Cloudflare Worker: обслуговує два сценарії для communities.promedia.report:
 *
 * 1. Публічна заявка з /add — додає новий запис ("status": "pending") у
 *    data/communities.json через GitHub Contents API, опційно завантажує
 *    логотип у img/logos/. Відвідувач сайту ніколи не бачить GitHub і не
 *    потребує акаунту.
 * 2. Модерація з /admin — approve/reject/deactivate/reactivate за паролем
 *    (env.ADMIN_PASSWORD), без відкриття GitHub.
 *
 * Секретний GitHub-токен (env.GITHUB_TOKEN) і пароль адміна (env.ADMIN_PASSWORD)
 * живуть тільки тут, як зашифровані Worker secrets, і ніколи не потрапляють
 * у браузер.
 *
 * Деплой: див. cloudflare-worker/README.md у цьому репозиторії.
 */

const OWNER = "Ianitskyi";
const REPO = "promedia-communities";
const DATA_PATH = "data/communities.json";
const BRANCH = "main";

const OBLAST_LABELS_UK = {
  "cherkasy": "Черкаська область",
  "chernihiv": "Чернігівська область",
  "chernivtsi": "Чернівецька область",
  "crimea": "Автономна Республіка Крим",
  "dnipropetrovsk": "Дніпропетровська область",
  "donetsk": "Донецька область",
  "ivano-frankivsk": "Івано-Франківська область",
  "kharkiv": "Харківська область",
  "kherson": "Херсонська область",
  "khmelnytskyi": "Хмельницька область",
  "kirovohrad": "Кіровоградська область",
  "kyiv": "Київська область",
  "kyiv-city": "м. Київ",
  "luhansk": "Луганська область",
  "lviv": "Львівська область",
  "mykolaiv": "Миколаївська область",
  "odessa": "Одеська область",
  "poltava": "Полтавська область",
  "rivne": "Рівненська область",
  "sumy": "Сумська область",
  "ternopil": "Тернопільська область",
  "vinnytsia": "Вінницька область",
  "volyn": "Волинська область",
  "zakarpattia": "Закарпатська область",
  "zaporizhia": "Запорізька область",
  "zhytomyr": "Житомирська область"
};

const REQUIRED_FIELDS = ["name", "website", "communityUrl", "description", "city", "regionSlug"];
const ALLOWED_TAGS = ["investigative", "warJournalism", "culture"];
const ALLOWED_LOGO_TYPES = { "image/png": "png", "image/jpeg": "jpg", "image/svg+xml": "svg", "image/webp": "webp" };
const MAX_LOGO_BASE64_LENGTH = 2_800_000; // ~2MB бінарного файлу
const ALLOWED_MODERATION_STATUSES = ["approved", "disabled", "deleted"];

// Worker викликається з communities.promedia.report через workers.dev-адресу
// (крос-доменно), а не через Route на тій самій зоні — тож потрібні CORS-заголовки.
const ALLOWED_ORIGIN = "https://communities.promedia.report";
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
    if (request.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

    let payload;
    try {
      payload = await request.json();
    } catch (e) {
      return json({ ok: false, error: "invalid_json" }, 400);
    }

    if (!env.GITHUB_TOKEN) {
      return json({ ok: false, error: "server_misconfigured" }, 500);
    }

    const ghHeaders = {
      "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
      "Accept": "application/vnd.github+json",
      "User-Agent": "promedia-communities-worker",
      "X-GitHub-Api-Version": "2022-11-28"
    };

    if (payload.action === "moderate") {
      return handleModerate(payload, env, ghHeaders);
    }

    return handleSubmit(payload, ghHeaders);
  }
};

async function handleSubmit(payload, ghHeaders) {
  // Honeypot: приховане поле, яке заповнюють лише боти. Людям його не видно.
  if (payload.company) {
    return json({ ok: true, id: "ok" });
  }

  for (const key of REQUIRED_FIELDS) {
    if (!payload[key] || typeof payload[key] !== "string" || !payload[key].trim()) {
      return json({ ok: false, error: "missing_field", field: key }, 400);
    }
  }

  if (!OBLAST_LABELS_UK[payload.regionSlug]) {
    return json({ ok: false, error: "invalid_region" }, 400);
  }

  let file;
  try {
    file = await readCommunitiesFile(ghHeaders);
  } catch (e) {
    return json({ ok: false, error: e.message }, 502);
  }
  const list = file.list;

  let id = slugify(payload.name) || ("community-" + Date.now());
  if (list.some((item) => item.id === id)) id = id + "-" + Math.random().toString(36).slice(2, 6);

  const tags = Array.isArray(payload.tags)
    ? payload.tags.filter((tag) => ALLOWED_TAGS.indexOf(tag) !== -1)
    : [];

  const entry = {
    id,
    name: payload.name.trim(),
    region: OBLAST_LABELS_UK[payload.regionSlug],
    regionSlug: payload.regionSlug,
    city: payload.city.trim(),
    website: payload.website.trim(),
    description: payload.description.trim(),
    communityIdea: (payload.communityIdea || "").trim(),
    communityUrl: payload.communityUrl.trim(),
    platform: "other",
    badges: {
      recommended: !!(payload.badges && payload.badges.recommended),
      whitelist: !!(payload.badges && payload.badges.whitelist),
      jti: !!(payload.badges && payload.badges.jti)
    },
    tags: tags,
    status: "pending",
    example: false
  };
  if (payload.contact && String(payload.contact).trim()) {
    entry.contact = String(payload.contact).trim();
  }

  entry.logo = await uploadLogoIfProvided(payload, id, ghHeaders) || faviconUrl(entry.website);

  list.push(entry);

  const ok = await writeCommunitiesFile(file.apiBase, ghHeaders, list, file.sha, `Нова заявка (pending): ${entry.name}`);
  if (!ok) return json({ ok: false, error: "github_write_failed" }, 502);

  return json({ ok: true, id });
}

async function handleModerate(payload, env, ghHeaders) {
  if (!env.ADMIN_PASSWORD || payload.password !== env.ADMIN_PASSWORD) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }
  if (!payload.id || typeof payload.id !== "string") {
    return json({ ok: false, error: "missing_id" }, 400);
  }
  if (ALLOWED_MODERATION_STATUSES.indexOf(payload.newStatus) === -1) {
    return json({ ok: false, error: "invalid_status" }, 400);
  }

  let file;
  try {
    file = await readCommunitiesFile(ghHeaders);
  } catch (e) {
    return json({ ok: false, error: e.message }, 502);
  }
  const list = file.list;

  const idx = list.findIndex((item) => item.id === payload.id);
  if (idx === -1) return json({ ok: false, error: "not_found" }, 404);

  const name = list[idx].name || payload.id;
  let message;
  if (payload.newStatus === "deleted") {
    list.splice(idx, 1);
    message = `Видалено запис: ${name}`;
  } else {
    list[idx].status = payload.newStatus;
    message = `Змінено статус на "${payload.newStatus}": ${name}`;
  }

  const ok = await writeCommunitiesFile(file.apiBase, ghHeaders, list, file.sha, message);
  if (!ok) return json({ ok: false, error: "github_write_failed" }, 502);

  return json({ ok: true });
}

async function readCommunitiesFile(ghHeaders) {
  const apiBase = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${DATA_PATH}`;
  let fileResp;
  try {
    fileResp = await fetch(`${apiBase}?ref=${BRANCH}`, { headers: ghHeaders });
  } catch (e) {
    throw new Error("github_unreachable");
  }
  if (!fileResp.ok) throw new Error("github_read_failed");

  const fileData = await fileResp.json();
  let list;
  try {
    list = JSON.parse(decodeBase64(fileData.content));
  } catch (e) {
    throw new Error("data_parse_failed");
  }
  return { list, sha: fileData.sha, apiBase };
}

async function writeCommunitiesFile(apiBase, ghHeaders, list, sha, message) {
  const newContentB64 = encodeBase64(JSON.stringify(list, null, 2) + "\n");
  const putResp = await fetch(apiBase, {
    method: "PUT",
    headers: { ...ghHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ message, content: newContentB64, sha, branch: BRANCH })
  });
  return putResp.ok;
}

async function uploadLogoIfProvided(payload, id, ghHeaders) {
  if (!payload.logoBase64 || !payload.logoMimeType) return null;
  const ext = ALLOWED_LOGO_TYPES[payload.logoMimeType];
  if (!ext) return null;
  if (typeof payload.logoBase64 !== "string" || payload.logoBase64.length > MAX_LOGO_BASE64_LENGTH) return null;

  const path = `img/logos/${id}.${ext}`;
  try {
    const resp = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`, {
      method: "PUT",
      headers: { ...ghHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Лого для заявки: ${payload.name ? String(payload.name).trim() : id}`,
        content: payload.logoBase64.replace(/\s/g, ""),
        branch: BRANCH
      })
    });
    return resp.ok ? path : null;
  } catch (e) {
    return null;
  }
}

function faviconUrl(website) {
  try {
    const host = new URL(website).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=128`;
  } catch (e) {
    return null;
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS }
  });
}

function decodeBase64(b64) {
  const binary = atob(b64.replace(/\n/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder("utf-8").decode(bytes);
}

function encodeBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary);
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}
