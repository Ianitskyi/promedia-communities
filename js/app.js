(function () {
  "use strict";

  var BADGE_KEYS = ["recommended", "whitelist", "jti"];
  var TAG_KEYS = ["investigative", "warJournalism"];
  // OBLAST_SLUGS — спільний глобальний масив, визначений у js/i18n.js

  var state = {
    all: [],
    filtered: [],
    search: "",
    regionSlug: "",
    activeId: null
  };

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
      var hay = (item.name + " " + item.city + " " + item.region).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  }

  function render() {
    var preRegion = state.all.filter(matchesSearch);
    state.filtered = state.regionSlug
      ? preRegion.filter(function (item) { return item.regionSlug === state.regionSlug; })
      : preRegion;

    renderMapCounts(preRegion);
    renderList();

    document.getElementById("results-count").textContent =
      t("results.count", { count: state.filtered.length, total: state.all.length });
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
            badgesHtml += '<span class="badge ' + key + '">' + tRaw("badges." + key) + "</span>";
          }
        });
      }
      if (item.tags) {
        item.tags.forEach(function (tag) {
          if (TAG_KEYS.indexOf(tag) !== -1) {
            badgesHtml += '<span class="badge tag">' + tRaw("tags." + tag) + "</span>";
          }
        });
      }
      if (item.example) {
        badgesHtml += '<span class="badge example">' + escapeHtml(t("card.example")) + "</span>";
      }

      var logoHtml = item.logo
        ? '<img class="media-logo" src="' + escapeAttr(item.logo) + '" alt="" loading="lazy" onerror="this.remove()" />'
        : "";
      var locationText = item.city === item.region ? item.city : item.city + ", " + item.region;

      card.innerHTML =
        '<div class="media-card-top">' + logoHtml + '<div><h3>' + escapeHtml(item.name) + "</h3>" +
        '<div class="location">' + escapeHtml(locationText) + "</div></div></div>" +
        (badgesHtml ? '<div class="badge-row">' + badgesHtml + "</div>" : "") +
        (item.description ? '<p class="desc">' + escapeHtml(item.description) + "</p>" : "") +
        (item.communityIdea ? '<p class="idea">' + escapeHtml(item.communityIdea) + "</p>" : "") +
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
