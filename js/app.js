(function () {
  "use strict";

  var BADGE_KEYS = ["recommended", "whitelist", "jti"];
  var TAG_KEYS = ["investigative", "warJournalism", "culture", "science"];
  var BADGE_EMOJI = { recommended: "🗺️", whitelist: "✅", jti: "🛡️" };
  var TRYZUB_SVG = '<svg class="tag-icon" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true"><path d="M5,14 L9,14 L4,2 Z M10,14 L14,14 L12,1 Z M15,14 L19,14 L20,2 Z M4,14 L20,14 L20,16 L4,16 Z M11,16 L13,16 L12,20 Z"/></svg>';
  var TAG_EMOJI = { investigative: "🔍", warJournalism: TRYZUB_SVG, culture: "🎨", science: "🔬" };
  // OBLAST_SLUGS — спільний глобальний масив, визначений у js/i18n.js

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
    return getLang() === "en" && item[enField] ? item[enField] : item[field];
  }

  var oblastPaths = {};
  var oblastLabels = {};

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
          title.textContent = tRaw("oblasts." + slug) || path.getAttribute("aria-label") || slug;
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
          '<p class="empty-state">' + escapeHtml(t("map.loadError")) + "</p>";
        console.error(err);
      });
  }

  function updateMapTitles() {
    Object.keys(oblastPaths).forEach(function (slug) {
      var title = oblastPaths[slug].querySelector("title");
      if (title) title.textContent = tRaw("oblasts." + slug) || slug;
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
      var hay = (item.name + " " + (item.nameEn || "") + " " + item.city + " " + item.region + " " + (item.cityEn || "") + " " + (item.regionEn || "")).toLowerCase();
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
      ? preRegion.filter(function (item) { return item.regionSlug === state.regionSlug; })
      : preRegion;

    renderMapCounts(preRegion);
    renderList();

    document.getElementById("results-count").textContent =
      t("results.count", { count: state.filtered.length, total: state.all.length });

    var heroStat = document.getElementById("hero-stat");
    if (heroStat) {
      heroStat.textContent = state.all.length
        ? t("hero.stat", { total: state.all.length })
        : "";
    }
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
        '<div class="media-card-top">' + logoHtml + '<div><h3><a href="media/?id=' + escapeAttr(item.id) + '">' + escapeHtml(name) + "</a></h3>" +
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

  function escapeAttr(str) {
    return escapeHtml(str);
  }

  (window.siteContentReady || Promise.resolve()).then(boot);
})();
