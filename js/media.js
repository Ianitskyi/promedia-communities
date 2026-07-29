(function () {
  "use strict";

  var BADGE_KEYS = ["recommended", "whitelist", "jti"];
  var TAG_KEYS = ["investigative", "warJournalism", "culture"];
  var BADGE_EMOJI = { recommended: "🗺️", whitelist: "✅", jti: "🛡️" };
  var TAG_EMOJI = { investigative: "🔍", warJournalism: "🎖️", culture: "🎨" };
  var BADGE_LINKS = {
    recommended: "https://map.detector.media/",
    whitelist: "https://imi.org.ua/doslidzhennya-standartiv",
    jti: "https://journalismtrustinitiative.org/"
  };

  var container = document.getElementById("media-detail");
  var currentItem = null;

  function getIdFromUrl() {
    var params = new URLSearchParams(window.location.search);
    return params.get("id") || "";
  }

  function render() {
    if (!currentItem) {
      container.innerHTML =
        '<p class="empty-state">' + escapeHtml(t("media.notFound")) + "</p>" +
        '<p><a href="../">' + escapeHtml(t("media.backToCatalog")) + "</a></p>";
      return;
    }

    var item = currentItem;
    document.title = item.name + " — " + t("media.titleSuffix");
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", item.description || item.name);

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
    var locationText = item.city === item.region ? item.city : item.city + ", " + item.region;

    container.innerHTML =
      '<div class="media-detail-card">' +
      '<div class="media-detail-top">' + logoHtml + '<div><h1>' + escapeHtml(item.name) + "</h1>" +
      '<div class="location">' + escapeHtml(locationText) + "</div></div></div>" +
      (badgesHtml ? '<div class="badge-row">' + badgesHtml + "</div>" : "") +
      (item.description ? '<p class="desc">' + escapeHtml(item.description) + "</p>" : "") +
      (item.communityIdea ? '<p class="idea">' + escapeHtml(item.communityIdea) + "</p>" : "") +
      '<div class="card-links">' +
      '<a class="primary" href="' + escapeAttr(item.communityUrl) + '" target="_blank" rel="noopener">' + escapeHtml(t("card.subscribe")) + "</a>" +
      '<a href="' + escapeAttr(item.website) + '" target="_blank" rel="noopener">' + escapeHtml(t("card.website")) + "</a>" +
      "</div></div>";
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
