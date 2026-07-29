/**
 * Cloudflare Worker: приймає заявку з communities.promedia.report/add,
 * сам додає новий запис ("status": "pending") у data/communities.json
 * через GitHub Contents API. Відвідувач сайту ніколи не бачить GitHub і
 * не потребує акаунту — секретний GitHub-токен живе тільки тут, як
 * зашифрований Worker secret (env.GITHUB_TOKEN), і ніколи не потрапляє
 * в браузер.
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

    if (!env.GITHUB_TOKEN) {
      return json({ ok: false, error: "server_misconfigured" }, 500);
    }

    const apiBase = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${DATA_PATH}`;
    const ghHeaders = {
      "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
      "Accept": "application/vnd.github+json",
      "User-Agent": "promedia-communities-worker",
      "X-GitHub-Api-Version": "2022-11-28"
    };

    let fileResp;
    try {
      fileResp = await fetch(`${apiBase}?ref=${BRANCH}`, { headers: ghHeaders });
    } catch (e) {
      return json({ ok: false, error: "github_unreachable" }, 502);
    }
    if (!fileResp.ok) return json({ ok: false, error: "github_read_failed" }, 502);

    const fileData = await fileResp.json();
    let list;
    try {
      list = JSON.parse(decodeBase64(fileData.content));
    } catch (e) {
      return json({ ok: false, error: "data_parse_failed" }, 502);
    }

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
      communityIdea: payload.communityIdea.trim(),
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

    list.push(entry);
    const newContentB64 = encodeBase64(JSON.stringify(list, null, 2) + "\n");

    const putResp = await fetch(apiBase, {
      method: "PUT",
      headers: { ...ghHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Нова заявка (pending): ${entry.name}`,
        content: newContentB64,
        sha: fileData.sha,
        branch: BRANCH
      })
    });

    if (!putResp.ok) {
      return json({ ok: false, error: "github_write_failed" }, 502);
    }

    return json({ ok: true, id });
  }
};

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
