(function () {
  "use strict";

  var BADGE_KEYS = ["recommended", "whitelist", "jti", "registered"];
  var TAG_KEYS = ["investigative", "warJournalism", "culture", "science"];
  var BADGE_EMOJI = { recommended: "🗺️", whitelist: "✅", jti: "🛡️", registered: "🏛️" };
  var TRYZUB_SVG = '<svg class="tag-icon" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true"><path d="M5,14 L9,14 L4,2 Z M10,14 L14,14 L12,1 Z M15,14 L19,14 L20,2 Z M4,14 L20,14 L20,16 L4,16 Z M11,16 L13,16 L12,20 Z"/></svg>';
  var TAG_EMOJI = { investigative: "🔍", warJournalism: TRYZUB_SVG, culture: "🎨", science: "🔬" };
  var BADGE_LINKS = {
    recommended: "https://map.detector.media/",
    whitelist: "https://imi.org.ua/doslidzhennya-standartiv",
    jti: "https://journalismtrustinitiative.org/",
    registered: "https://webportal.nrada.gov.ua/derzhavnyj-reyestr-sub-yektiv-informatsijnoyi-diyalnosti-u-sferi-telebachennya-i-radiomovlennya/"
  };

  var NEWS_API_URL = "https://news.promedia.report/api/articles";

  // Той самий фолбек, що й у js/app.js (каталог) — щоб медіа без явного
  // nameEn/cityEn однаково коректно показувались англійською і тут.
  var NAME_OVERRIDES_EN = {
    "МикВісті": "MykVisti",
    "Суспільне Новини": "Suspilne News",
    "Громадське": "Hromadske",
    "Громадське радіо": "Hromadske Radio",
    "Українська правда": "Ukrainska Pravda",
    "Східний Варіант": "Skhidnyi Variant",
    "Думская": "Dumskaya",
    "ЛЮК": "Liuk",
    "Полтавська хвиля": "Poltavska Khvylia",
    "Вільне радіо": "Vilne Radio",
    "Слобідський край": "Slobidskyi Krai",
    "Перший Криворізький": "Pershyi Kryvorizkyi",
    "Сєвєродонецьк онлайн": "Sievierodonetsk Online",
    "Точка доступу": "Tochka Dostupu"
  };

  var CITY_OVERRIDES_EN = {
    "Київ": "Kyiv",
    "Львів": "Lviv",
    "Одеса": "Odesa",
    "Харків": "Kharkiv"
  };

  function transliterateUkrainian(value) {
    var map = {
      "А": "A", "Б": "B", "В": "V", "Г": "H", "Ґ": "G", "Д": "D", "Е": "E", "Є": "Ye",
      "Ж": "Zh", "З": "Z", "И": "Y", "І": "I", "Ї": "Yi", "Й": "Y", "К": "K", "Л": "L",
      "М": "M", "Н": "N", "О": "O", "П": "P", "Р": "R", "С": "S", "Т": "T", "У": "U",
      "Ф": "F", "Х": "Kh", "Ц": "Ts", "Ч": "Ch", "Ш": "Sh", "Щ": "Shch", "Ь": "",
      "Ю": "Yu", "Я": "Ya",
      "а": "a", "б": "b", "в": "v", "г": "h", "ґ": "g", "д": "d", "е": "e", "є": "ie",
      "ж": "zh", "з": "z", "и": "y", "і": "i", "ї": "i", "й": "i", "к": "k", "л": "l",
      "м": "m", "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
      "ф": "f", "х": "kh", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "shch", "ь": "",
      "ю": "iu", "я": "ia"
    };
    return String(value || "").replace(/[А-ЩЬЮЯҐЄІЇа-щьюяґєії]/g, function (char) {
      return Object.prototype.hasOwnProperty.call(map, char) ? map[char] : char;
    });
  }

  var container = document.getElementById("media-detail");
  var currentItem = null;
  var newsItems = null;
  var newsRequested = false;

  function getIdFromUrl() {
    var params = new URLSearchParams(window.location.search);
    return params.get("id") || "";
  }

  function localized(item, field) {
    var enField = field + "En";
    if (getLang() === "en") {
      if (item[enField]) return item[enField];
      if (field === "name") return NAME_OVERRIDES_EN[item.name] || transliterateUkrainian(item.name);
      if (field === "city") return CITY_OVERRIDES_EN[item.city] || transliterateUkrainian(item.city);
      if (field === "region") return tRaw("oblasts." + item.regionSlug) || transliterateUkrainian(item.region);
    }
    return item[field];
  }

  function render() {
    if (!currentItem) {
      container.innerHTML =
        '<p class="empty-state">' + escapeHtml(t("media.notFound")) + "</p>" +
        '<p><a href="../">' + escapeHtml(t("media.backToCatalog")) + "</a></p>";
      return;
    }

    var item = currentItem;
    var name = localized(item, "name");
    var description = localized(item, "description");
    var communityIdea = localized(item, "communityIdea");
    var atlasUrl = item.registryInfo && item.registryInfo.mediaId
      ? "https://atlas.promedia.report/" + (getLang() === "en" ? "en/" : "") + "?search=" + encodeURIComponent(item.registryInfo.mediaId)
      : BADGE_LINKS.registered;
    document.title = name + " — " + t("media.titleSuffix");
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", description || name);

    var badgesHtml = "";
    if (item.badges) {
      BADGE_KEYS.forEach(function (key) {
        if (item.badges[key]) {
          var badgeLink = key === "registered" ? atlasUrl : BADGE_LINKS[key];
          badgesHtml += '<a class="badge ' + key + '" href="' + badgeLink + '" target="_blank" rel="noopener">' +
            BADGE_EMOJI[key] + " " + escapeHtml(tRaw("badges." + key)) + "</a>";
        }
      });
    }
    if (item.tags) {
      item.tags.forEach(function (tag) {
        if (TAG_KEYS.indexOf(tag) !== -1) {
          badgesHtml += '<span class="badge tag">' + TAG_EMOJI[tag] + " " + escapeHtml(tRaw("tags." + tag)) + "</span>";
        }
      });
    }
    if (item.example) {
      badgesHtml += '<span class="badge example">' + escapeHtml(t("card.example")) + "</span>";
    }

    var logoHtml = item.logo
      ? '<img class="media-detail-logo" src="' + escapeAttr(item.logo) + '" alt="" loading="lazy" onerror="this.remove()" />'
      : "";
    var locCity = localized(item, "city");
    var locRegion = localized(item, "region");
    var locationText = locCity === locRegion ? locCity : locCity + ", " + locRegion;

    container.innerHTML =
      '<div class="media-detail-card">' +
      '<div class="media-detail-top">' + logoHtml + '<div><h1>' + escapeHtml(name) + "</h1>" +
      '<div class="location">' + escapeHtml(locationText) + "</div></div></div>" +
      (badgesHtml ? '<div class="badge-row">' + badgesHtml + "</div>" : "") +
      (description ? '<p class="desc">' + escapeHtml(description) + "</p>" : "") +
      (communityIdea ? '<p class="idea">' + escapeHtml(communityIdea) + "</p>" : "") +
      '<div class="card-links">' +
      '<a class="primary" href="' + escapeAttr(item.communityUrl) + '" target="_blank" rel="noopener">' + escapeHtml(t("card.subscribe")) + "</a>" +
      '<a href="' + escapeAttr(item.website) + '" target="_blank" rel="noopener">' + escapeHtml(t("card.website")) + "</a>" +
      "</div>" +
      renderRegistryInfo(item) +
      "</div>" +
      renderNewsSection();

    if (!newsRequested) {
      newsRequested = true;
      loadNews(item.id);
    }
  }

  function renderRegistryInfo(item) {
    if (!item.badges || !item.badges.registered || !item.registryInfo) return "";
    var info = item.registryInfo;
    var rows = [];
    if (info.legalName) rows.push([t("media.registry.legalName"), info.legalName]);
    if (info.edrpou) rows.push([t("media.registry.edrpou"), info.edrpou]);
    if (info.mediaId) rows.push([t("media.registry.mediaId"), info.mediaId]);
    if (info.activity) rows.push([t("media.registry.activity"), info.activity]);
    if (info.email) rows.push([t("media.registry.email"), info.email]);
    if (!rows.length) return "";
    var rowsHtml = rows.map(function (pair) {
      return '<div class="registry-row"><span class="registry-label">' + escapeHtml(pair[0]) + "</span>" +
        '<span class="registry-value">' + escapeHtml(pair[1]) + "</span></div>";
    }).join("");
    return '<div class="registry-info">' +
      '<h2>' + escapeHtml(t("media.registry.title")) + "</h2>" +
      rowsHtml +
      '<a class="registry-source" href="' + escapeAttr(item.registryInfo.mediaId ? "https://atlas.promedia.report/" + (getLang() === "en" ? "en/" : "") + "?search=" + encodeURIComponent(item.registryInfo.mediaId) : BADGE_LINKS.registered) + '" target="_blank" rel="noopener">' +
      escapeHtml(getLang() === "en" ? "Verify in Media Atlas ↗" : "Перевірити в Атласі Медіа ↗") + "</a>" +
      "</div>";
  }

  function formatNewsDate(value) {
    if (!value) return "";
    var date = new Date(value);
    if (isNaN(date.getTime())) return "";
    var isEnglish = getLang() === "en";
    return new Intl.DateTimeFormat(isEnglish ? "en-GB" : "uk-UA", {
      day: "2-digit", month: "2-digit", year: "numeric"
    }).format(date);
  }

  function renderNewsSection() {
    if (newsItems === null) return "";
    if (!newsItems.length) return "";
    var itemsHtml = newsItems.map(function (n) {
      var title = getLang() === "en" && n.titleEn ? n.titleEn : n.title;
      var dateText = formatNewsDate(n.publishedAt);
      var dateHtml = dateText ? '<span class="media-news-date">' + escapeHtml(dateText) + "</span>" : "";
      return '<li class="media-news-item">' + dateHtml +
        '<a href="' + escapeAttr(n.url) + '" target="_blank" rel="noopener">' + escapeHtml(title) + "</a></li>";
    }).join("");
    return '<div class="media-news"><h2>' + escapeHtml(t("media.newsTitle")) + "</h2>" +
      '<ul class="media-news-list">' + itemsHtml + "</ul></div>";
  }

  function loadNews(id) {
    fetch(NEWS_API_URL + "?mediaId=" + encodeURIComponent(id) + "&limit=6")
      .then(function (r) { return r.ok ? r.json() : { items: [] }; })
      .then(function (data) {
        newsItems = (data && data.items) || [];
        if (currentItem && currentItem.id === id) render();
      })
      .catch(function () {
        newsItems = [];
      });
  }

  function load() {
    var id = getIdFromUrl();
    fetch("../data/communities.json?t=" + Date.now())
      .then(function (r) { return r.json(); })
      .then(function (data) {
        currentItem = data.find(function (i) { return i.id === id && i.status === "approved"; }) || null;
        render();
      })
      .catch(function (err) {
        container.innerHTML = '<p class="empty-state">' + escapeHtml(t("media.loadError")) + "</p>";
        console.error(err);
      });
  }

  window.onLangChange = function () {
    render();
  };

  (window.siteContentReady || Promise.resolve()).then(load);

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function escapeAttr(str) {
    return escapeHtml(str);
  }
})();
