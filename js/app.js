(function () {
  "use strict";

  var BADGE_LABELS = {
    recommended: "🗺️ Рекомендоване медіа",
    whitelist: "✅ Білий список ЗМІ",
    jti: "🛡️ JTI-сертифіковане"
  };

  var OBLAST_LABELS = {
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

  var state = {
    all: [],
    filtered: [],
    activeBadges: new Set(),
    search: "",
    regionSlug: "",
    activeId: null
  };

  var oblastPaths = {};
  var oblastLabels = {};

  populateRegionSelect();
  loadMap();
  loadData();

  function populateRegionSelect() {
    var select = document.getElementById("region-filter");
    var slugs = Object.keys(OBLAST_LABELS).sort(function (a, b) {
      return OBLAST_LABELS[a].localeCompare(OBLAST_LABELS[b], "uk");
    });
    slugs.forEach(function (slug) {
      var opt = document.createElement("option");
      opt.value = slug;
      opt.textContent = OBLAST_LABELS[slug];
      select.appendChild(opt);
    });
  }

  function loadMap() {
    fetch("img/ukraine-oblasts.svg")
      .then(function (r) { return r.text(); })
      .then(function (svgText) {
        var container = document.getElementById("oblast-map");
        container.innerHTML = svgText;
        var svg = container.querySelector("svg");
        svg.setAttribute("role", "img");
        Array.prototype.forEach.call(svg.querySelectorAll("path"), function (path) {
          var slug = path.id;
          path.classList.add("oblast");
          path.setAttribute("tabindex", "0");
          var title = document.createElementNS("http://www.w3.org/2000/svg", "title");
          title.textContent = OBLAST_LABELS[slug] || path.getAttribute("aria-label") || slug;
          path.appendChild(title);
          path.addEventListener("click", function () { toggleRegion(slug); });
          path.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleRegion(slug); }
          });
          oblastPaths[slug] = path;

          var bbox = path.getBBox();
          var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
          text.setAttribute("x", bbox.x + bbox.width / 2);
          text.setAttribute("y", bbox.y + bbox.height / 2);
          text.classList.add("oblast-count");
          svg.appendChild(text);
          oblastLabels[slug] = text;
        });
        render();
      })
      .catch(function (err) {
        document.getElementById("oblast-map").innerHTML =
          '<p class="empty-state">Не вдалося завантажити карту.</p>';
        console.error(err);
      });
  }

  function loadData() {
    fetch("data/communities.json")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        state.all = data.filter(function (item) { return item.status === "approved"; });
        render();
      })
      .catch(function (err) {
        document.getElementById("card-list").innerHTML =
          '<p class="empty-state">Не вдалося завантажити каталог. Спробуйте оновити сторінку.</p>';
        console.error(err);
      });
  }

  function toggleRegion(slug) {
    state.regionSlug = state.regionSlug === slug ? "" : slug;
    document.getElementById("region-filter").value = state.regionSlug;
    render();
  }

  function matchesSearchAndBadges(item) {
    var q = state.search.trim().toLowerCase();
    for (var b of state.activeBadges) {
      if (!item.badges || !item.badges[b]) return false;
    }
    if (q) {
      var hay = (item.name + " " + item.city + " " + item.region).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  }

  function render() {
    var preRegion = state.all.filter(matchesSearchAndBadges);
    state.filtered = state.regionSlug
      ? preRegion.filter(function (item) { return item.regionSlug === state.regionSlug; })
      : preRegion;

    renderMapCounts(preRegion);
    renderList();

    var count = state.filtered.length;
    document.getElementById("results-count").textContent = count + " з " + state.all.length + " медіа";
  }

  function renderMapCounts(preRegion) {
    if (!Object.keys(oblastPaths).length) return;
    var counts = {};
    preRegion.forEach(function (item) {
      counts[item.regionSlug] = (counts[item.regionSlug] || 0) + 1;
    });
    Object.keys(oblastPaths).forEach(function (slug) {
      var path = oblastPaths[slug];
      var count = counts[slug] || 0;
      path.classList.toggle("has-media", count > 0);
      path.classList.toggle("active", slug === state.regionSlug);
      var label = oblastLabels[slug];
      if (label) label.textContent = count > 0 ? count : "";
    });
  }

  function renderList() {
    var list = document.getElementById("card-list");
    list.innerHTML = "";
    if (!state.filtered.length) {
      list.innerHTML = '<p class="empty-state">Нічого не знайдено за такими фільтрами.</p>';
      return;
    }
    state.filtered.forEach(function (item) {
      var card = document.createElement("div");
      card.className = "media-card" + (item.id === state.activeId ? " active" : "");
      card.dataset.id = item.id;

      var badgesHtml = "";
      if (item.badges) {
        Object.keys(BADGE_LABELS).forEach(function (key) {
          if (item.badges[key]) {
            badgesHtml += '<span class="badge ' + key + '">' + BADGE_LABELS[key] + "</span>";
          }
        });
      }
      if (item.example) {
        badgesHtml += '<span class="badge example">приклад — уточнюється</span>';
      }

      card.innerHTML =
        '<div class="media-card-top"><div><h3>' + escapeHtml(item.name) + "</h3>" +
        '<div class="location">' + escapeHtml(item.city) + ", " + escapeHtml(item.region) + "</div></div></div>" +
        (badgesHtml ? '<div class="badge-row">' + badgesHtml + "</div>" : "") +
        '<p class="desc">' + escapeHtml(item.description) + "</p>" +
        '<p class="idea">' + escapeHtml(item.communityIdea) + "</p>" +
        '<div class="card-links">' +
        '<a class="primary" href="' + escapeAttr(item.communityUrl) + '" target="_blank" rel="noopener">Підписатися →</a>' +
        '<a href="' + escapeAttr(item.website) + '" target="_blank" rel="noopener">Сайт медіа</a>' +
        "</div>";

      card.addEventListener("click", function (e) {
        if (e.target.tagName === "A") return;
        setActive(item.id);
      });

      list.appendChild(card);
    });
  }

  function setActive(id) {
    state.activeId = id;
    var item = state.all.find(function (i) { return i.id === id; });
    if (item && oblastPaths[item.regionSlug]) {
      var path = oblastPaths[item.regionSlug];
      path.classList.add("pulse");
      path.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      setTimeout(function () { path.classList.remove("pulse"); }, 1200);
    }
    Array.from(document.querySelectorAll(".media-card")).forEach(function (el) {
      el.classList.toggle("active", el.dataset.id === id);
    });
  }

  document.getElementById("search").addEventListener("input", function (e) {
    state.search = e.target.value;
    render();
  });

  document.getElementById("region-filter").addEventListener("change", function (e) {
    state.regionSlug = e.target.value;
    render();
  });

  Array.from(document.querySelectorAll(".badge-toggle")).forEach(function (btn) {
    btn.addEventListener("click", function () {
      var badge = btn.dataset.badge;
      if (state.activeBadges.has(badge)) {
        state.activeBadges.delete(badge);
        btn.classList.remove("active");
      } else {
        state.activeBadges.add(badge);
        btn.classList.add("active");
      }
      render();
    });
  });

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function escapeAttr(str) {
    return escapeHtml(str);
  }
})();
