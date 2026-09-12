(function () {
  "use strict";

  var BADGE_KEYS = ["recommended", "whitelist", "jti"];
  var TAG_KEYS = ["investigative", "warJournalism", "culture", "science"];
  var BADGE_EMOJI = { recommended: "🗺️", whitelist: "✅", jti: "🛡️" };
  var TRYZUB_SVG = '<svg class="tag-icon" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true"><path d="M5,14 L9,14 L4,2 Z M10,14 L14,14 L12,1 Z M15,14 L19,14 L20,2 Z M4,14 L20,14 L20,16 L4,16 Z M11,16 L13,16 L12,20 Z"/></svg>';
  var TAG_EMOJI = { investigative: "🔍", warJournalism: TRYZUB_SVG, culture: "🎨", science: "🔬" };
  // OBLAST_SLUGS — спільний глобальний масив, визначений у js/i18n.js

  // Послідовна одноколірна шкала (світлий -> темний синій) для теплової карти.
  // Ті самі відтінки, що й у легенді в css/style.css (.map-legend-bar).
  var HEATMAP_RAMP = [
    [0xcd, 0xe2, 0xfb], [0xb7, 0xd3, 0xf6], [0x9e, 0xc5, 0xf4], [0x86, 0xb6, 0xef],
    [0x6d, 0xa7, 0xec], [0x55, 0x98, 0xe7], [0x39, 0x87, 0xe5], [0x2a, 0x78, 0xd6],
    [0x25, 0x6a, 0xbf], [0x1c, 0x5c, 0xab], [0x18, 0x4f, 0x95], [0x10, 0x42, 0x81],
    [0x0d, 0x36, 0x6b]
  ];

  function heatColor(t) {
    var clamped = Math.max(0, Math.min(1, t));
    var pos = clamped * (HEATMAP_RAMP.length - 1);
    var i = Math.min(HEATMAP_RAMP.length - 2, Math.floor(pos));
    var frac = pos - i;
    var a = HEATMAP_RAMP[i], b = HEATMAP_RAMP[i + 1];
    var rgb = [
      Math.round(a[0] + (b[0] - a[0]) * frac),
      Math.round(a[1] + (b[1] - a[1]) * frac),
      Math.round(a[2] + (b[2] - a[2]) * frac)
    ];
    return rgb;
  }

  var state = {
    all: [],
    filtered: [],
    search: "",
    regionSlug: "",
    activeId: null,
    activeFilters: {}
  };

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

  function mediaLink(id) {
    return "/media/?id=" + encodeURIComponent(id) + (getLang() === "en" ? "&lang=en" : "");
  }

  function itemRegionSlugs(item) {
    return item.regionSlugs && item.regionSlugs.length ? item.regionSlugs : [item.regionSlug];
  }

  var oblastPaths = {};
  var oblastLabels = {};

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

  function boot() {
    populateRegionSelect();
    loadMap();
    loadData();
    bindEvents();
  }

  function populateRegionSelect() {
    var select = document.getElementById("region-filter");
    var current = state.regionSlug;
    select.innerHTML = "";
    var allOpt = document.createElement("option");
    allOpt.value = "";
    allOpt.textContent = t("controls.allRegions");
    select.appendChild(allOpt);

    var slugs = OBLAST_SLUGS.slice().sort(function (a, b) {
      return tRaw("oblasts." + a).localeCompare(tRaw("oblasts." + b), getLang());
    });
    slugs.forEach(function (slug) {
      var opt = document.createElement("option");
      opt.value = slug;
      opt.textContent = tRaw("oblasts." + slug);
      select.appendChild(opt);
    });
    select.value = current;
  }

  function loadMap() {
    fetch("/img/ukraine-oblasts.svg")
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
          title.textContent = tRaw("oblasts." + slug) || path.getAttribute("aria-label") || slug;
          path.appendChild(title);
          path.addEventListener("click", function () { toggleRegion(slug); });
          path.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleRegion(slug); }
          });
          oblastPaths[slug] = path;

          var svgNS = "http://www.w3.org/2000/svg";
          var bbox = path.getBBox();
          var cx = bbox.x + bbox.width / 2;
          var cy = bbox.y + bbox.height / 2;

          var badge = document.createElementNS(svgNS, "g");
          badge.classList.add("oblast-badge");
          var bg = document.createElementNS(svgNS, "rect");
          bg.classList.add("oblast-badge-bg");
          var text = document.createElementNS(svgNS, "text");
          text.classList.add("oblast-count");
          text.setAttribute("x", cx);
          text.setAttribute("y", cy);
          badge.appendChild(bg);
          badge.appendChild(text);
          // Вставляємо бейдж одразу після path (а не в кінець svg), щоб
          // CSS-селектор `path.oblast:hover + .oblast-badge` бив у ціль.
          path.parentNode.insertBefore(badge, path.nextSibling);

          oblastLabels[slug] = { text: text, bg: bg, cx: cx, cy: cy };
        });
        buildMapLegend();
        render();
      })
      .catch(function (err) {
        document.getElementById("oblast-map").innerHTML =
          '<p class="empty-state">' + escapeHtml(t("map.loadError")) + "</p>";
        console.error(err);
      });
  }

  function buildMapLegend() {
    if (document.querySelector(".map-legend")) return;
    var hint = document.getElementById("map-hint");
    if (!hint || !hint.parentNode) return;

    var legend = document.createElement("div");
    legend.className = "map-legend";

    var less = document.createElement("span");
    less.className = "map-legend-label";
    less.dataset.i18n = "map.legendLess";
    less.textContent = t("map.legendLess");

    var bar = document.createElement("span");
    bar.className = "map-legend-bar";
    bar.setAttribute("aria-hidden", "true");

    var more = document.createElement("span");
    more.className = "map-legend-label";
    more.dataset.i18n = "map.legendMore";
    more.textContent = t("map.legendMore");

    legend.appendChild(less);
    legend.appendChild(bar);
    legend.appendChild(more);
    hint.parentNode.insertBefore(legend, hint);
  }

  function updateMapTitles() {
    Object.keys(oblastPaths).forEach(function (slug) {
      var title = oblastPaths[slug].querySelector("title");
      if (title) title.textContent = tRaw("oblasts." + slug) || slug;
    });
  }

  function loadData() {
    fetch("/data/communities.json?t=" + Date.now())
      .then(function (r) { return r.json(); })
      .then(function (data) {
        state.all = data.filter(function (item) { return item.status === "approved"; });
        render();
      })
      .catch(function (err) {
        document.getElementById("card-list").innerHTML =
          '<p class="empty-state">' + escapeHtml(t("list.loadError")) + "</p>";
        console.error(err);
      });
  }

  function toggleRegion(slug) {
    state.regionSlug = state.regionSlug === slug ? "" : slug;
    document.getElementById("region-filter").value = state.regionSlug;
    render();
  }

  function matchesSearch(item) {
    var q = state.search.trim().toLowerCase();
    if (q) {
      var hay = [
        item.name,
        item.nameEn || "",
        localized(item, "name"),
        item.city,
        item.cityEn || "",
        localized(item, "city"),
        item.region,
        item.regionEn || "",
        localized(item, "region")
      ].join(" ").toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  }

  function matchesFilters(item) {
    return Object.keys(state.activeFilters).every(function (key) {
      if (!state.activeFilters[key]) return true;
      var parts = key.split(":");
      var kind = parts[0], val = parts[1];
      if (kind === "badge") return !!(item.badges && item.badges[val]);
      if (kind === "tag") return !!(item.tags && item.tags.indexOf(val) !== -1);
      return true;
    });
  }

  function render() {
    var preRegion = state.all.filter(matchesSearch).filter(matchesFilters);
    state.filtered = state.regionSlug
      ? preRegion.filter(function (item) { return itemRegionSlugs(item).indexOf(state.regionSlug) !== -1; })
      : preRegion;

    renderMapCounts(preRegion);
    renderList();

    document.getElementById("results-count").textContent =
      t("results.count", { count: state.filtered.length, total: state.all.length });

    var heroStat = document.getElementById("hero-stat");
    if (heroStat) {
      heroStat.textContent = state.all.length
        ? tPlural("hero.stat", state.all.length)
        : "";
    }
  }

  function renderMapCounts(preRegion) {
    if (!Object.keys(oblastPaths).length) return;
    var counts = {};
    preRegion.forEach(function (item) {
      itemRegionSlugs(item).forEach(function (slug) {
        counts[slug] = (counts[slug] || 0) + 1;
      });
    });
    var maxCount = 0;
    Object.keys(counts).forEach(function (slug) {
      if (counts[slug] > maxCount) maxCount = counts[slug];
    });
    Object.keys(oblastPaths).forEach(function (slug) {
      var path = oblastPaths[slug];
      var count = counts[slug] || 0;
      path.classList.toggle("has-media", count > 0);
      path.classList.toggle("active", slug === state.regionSlug);
      var label = oblastLabels[slug];
      if (count > 0) {
        // sqrt стискає розкид, щоб один регіон-виняток (напр. Київ) не
        // "з'їдав" усю шкалу, залишаючи решту областей ледь відмінними.
        var t = maxCount > 0 ? Math.sqrt(count / maxCount) : 0;
        var rgb = heatColor(t);
        path.style.setProperty("--heat-fill", "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")");
      } else {
        path.style.removeProperty("--heat-fill");
      }
      if (label) {
        if (count > 0) {
          label.text.textContent = count;
          sizeBadge(label);
        } else {
          label.text.textContent = "";
          label.bg.setAttribute("width", 0);
          label.bg.setAttribute("height", 0);
        }
      }
    });
  }

  function sizeBadge(label) {
    var padX = 7, padY = 4;
    var box = label.text.getBBox();
    var width = box.width + padX * 2;
    var height = box.height + padY * 2;
    label.bg.setAttribute("x", label.cx - width / 2);
    label.bg.setAttribute("y", label.cy - height / 2);
    label.bg.setAttribute("width", width);
    label.bg.setAttribute("height", height);
    label.bg.setAttribute("rx", height / 2);
  }

  function renderList() {
    var list = document.getElementById("card-list");
    list.innerHTML = "";
    if (!state.filtered.length) {
      list.innerHTML = '<p class="empty-state">' + escapeHtml(t("list.empty")) + "</p>";
      return;
    }
    state.filtered.forEach(function (item) {
      var card = document.createElement("div");
      card.className = "media-card" + (item.id === state.activeId ? " active" : "");
      card.dataset.id = item.id;

      var badgesHtml = "";
      if (item.badges) {
        BADGE_KEYS.forEach(function (key) {
          if (item.badges[key]) {
            badgesHtml += '<span class="badge ' + key + '" title="' + escapeAttr(tRaw("badges." + key)) + '">' + BADGE_EMOJI[key] + "</span>";
          }
        });
      }
      if (item.tags) {
        item.tags.forEach(function (tag) {
          if (TAG_KEYS.indexOf(tag) !== -1) {
            badgesHtml += '<span class="badge tag" title="' + escapeAttr(tRaw("tags." + tag)) + '">' + TAG_EMOJI[tag] + "</span>";
          }
        });
      }
      if (item.example) {
        badgesHtml += '<span class="badge example">' + escapeHtml(t("card.example")) + "</span>";
      }

      var logoHtml = item.logo
        ? '<img class="media-logo" src="' + escapeAttr(item.logo) + '" alt="" loading="lazy" onerror="this.remove()" />'
        : "";
      var locCity = localized(item, "city");
      var locRegion = localized(item, "region");
      var locationText = locCity === locRegion ? locCity : locCity + ", " + locRegion;
      var name = localized(item, "name");
      var description = localized(item, "description");
      var communityIdea = localized(item, "communityIdea");

      card.innerHTML =
        '<div class="media-card-top">' + logoHtml + '<div><h3><a href="' + mediaLink(item.id) + '">' + escapeHtml(name) + "</a></h3>" +
        '<div class="location">' + escapeHtml(locationText) + "</div></div></div>" +
        (badgesHtml ? '<div class="badge-row">' + badgesHtml + "</div>" : "") +
        (description ? '<p class="desc">' + escapeHtml(description) + "</p>" : "") +
        (communityIdea ? '<p class="idea">' + escapeHtml(communityIdea) + "</p>" : "") +
        '<div class="card-links">' +
        '<a class="primary" href="' + escapeAttr(item.communityUrl) + '" target="_blank" rel="noopener">' + escapeHtml(t("card.subscribe")) + "</a>" +
        '<a href="' + escapeAttr(item.website) + '" target="_blank" rel="noopener">' + escapeHtml(t("card.website")) + "</a>" +
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
    if (item) {
      itemRegionSlugs(item).forEach(function (slug) {
        var path = oblastPaths[slug];
        if (!path) return;
        path.classList.add("pulse");
        setTimeout(function () { path.classList.remove("pulse"); }, 1200);
      });
      var firstPath = oblastPaths[itemRegionSlugs(item)[0]];
      if (firstPath) firstPath.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }
    Array.from(document.querySelectorAll(".media-card")).forEach(function (el) {
      el.classList.toggle("active", el.dataset.id === id);
    });
  }

  function bindEvents() {
    document.getElementById("search").addEventListener("input", function (e) {
      state.search = e.target.value;
      render();
    });

    document.getElementById("region-filter").addEventListener("change", function (e) {
      state.regionSlug = e.target.value;
      render();
    });

    var legend = document.getElementById("badge-legend");
    if (legend) {
      legend.addEventListener("click", function (e) {
        var btn = e.target.closest && e.target.closest(".legend-filter-btn");
        if (!btn) return;
        e.preventDefault();
        var key = btn.dataset.filter;
        if (state.activeFilters[key]) {
          delete state.activeFilters[key];
          btn.classList.remove("active");
        } else {
          state.activeFilters[key] = true;
          btn.classList.add("active");
        }
        render();
      });
    }

    window.onLangChange = function () {
      populateRegionSelect();
      updateMapTitles();
      render();
    };
  }

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

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

  function escapeAttr(str) {
    return escapeHtml(str);
  }

  (window.siteContentReady || Promise.resolve()).then(boot);
})();
