(function () {
  "use strict";

  var BADGE_KEYS = ["recommended", "whitelist", "jti"];
  var TAG_KEYS = ["investigative", "warJournalism", "culture", "science"];
  var BADGE_EMOJI = { recommended: "🗺️", whitelist: "✅", jti: "🛡️" };
  var TRYZUB_SVG = '<svg class="tag-icon" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true"><path d="M5,14 L9,14 L4,2 Z M10,14 L14,14 L12,1 Z M15,14 L19,14 L20,2 Z M4,14 L20,14 L20,16 L4,16 Z M11,16 L13,16 L12,20 Z"/></svg>';
  var TAG_EMOJI = { investigative: "🔍", warJournalism: TRYZUB_SVG, culture: "🎨", science: "🔬" };
  var BADGE_LINKS = {
    recommended: "https://map.detector.media/",
    whitelist: "https://imi.org.ua/doslidzhennya-standartiv",
    jti: "https://journalismtrustinitiative.org/"
  };

  var NEWS_API_URL = "https://news.promedia.report/api/articles";

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
    return getLang() === "en" && item[enField] ? item[enField] : item[field];
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
    document.title = name + " — " + t("media.titleSuffix");
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", description || name);

    var badgesHtml = "";
    if (item.badges) {
      BADGE_KEYS.forEach(function (key) {
        if (item.badges[key]) {
          badgesHtml += '<a class="badge ' + key + '" href="' + BADGE_LINKS[key] + '" target="_blank" rel="noopener">' +
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
      "</div></div>" +
      renderNewsSection();

    if (!newsRequested) {
      newsRequested = true;
      loadNews(item.id);
    }
  }

  function renderNewsSection() {
    if (newsItems === null) return "";
    if (!newsItems.length) return "";
    var itemsHtml = newsItems.map(function (n) {
      var title = getLang() === "en" && n.titleEn ? n.titleEn : n.title;
      return '<li class="media-news-item"><a href="' + escapeAttr(n.url) + '" target="_blank" rel="noopener">' +
        escapeHtml(title) + "</a></li>";
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
    fetch("../data/communities.json")
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
