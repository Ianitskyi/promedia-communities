(function () {
  "use strict";

  var BADGE_LABELS = {
    recommended: "🗺️ Рекомендоване медіа",
    whitelist: "✅ Білий список ЗМІ",
    jti: "🛡️ JTI-сертифіковане"
  };

  var state = {
    all: [],
    filtered: [],
    activeBadges: new Set(),
    search: "",
    region: "",
    markers: {},
    activeId: null
  };

  var map = L.map("map", { scrollWheelZoom: false }).setView([48.7, 31.3], 6);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 18
  }).addTo(map);

  var markerIcon = L.divIcon({
    className: "media-marker",
    html: '<span style="display:block;width:14px;height:14px;border-radius:50%;background:#0d0c5c;border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></span>',
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });

  fetch("data/communities.json")
    .then(function (r) { return r.json(); })
    .then(function (data) {
      state.all = data.filter(function (item) { return item.status === "approved"; });
      populateRegions(state.all);
      render();
    })
    .catch(function (err) {
      document.getElementById("card-list").innerHTML =
        '<p class="empty-state">Не вдалося завантажити каталог. Спробуйте оновити сторінку.</p>';
      console.error(err);
    });

  function populateRegions(items) {
    var regions = Array.from(new Set(items.map(function (i) { return i.region; }))).sort();
    var select = document.getElementById("region-filter");
    regions.forEach(function (r) {
      var opt = document.createElement("option");
      opt.value = r;
      opt.textContent = r;
      select.appendChild(opt);
    });
  }

  function applyFilters() {
    var q = state.search.trim().toLowerCase();
    state.filtered = state.all.filter(function (item) {
      if (state.region && item.region !== state.region) return false;
      for (var b of state.activeBadges) {
        if (!item.badges || !item.badges[b]) return false;
      }
      if (q) {
        var hay = (item.name + " " + item.city + " " + item.region).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function render() {
    applyFilters();
    renderMarkers();
    renderList();
    document.getElementById("results-count").textContent =
      state.filtered.length + " з " + state.all.length + " медіа";
  }

  function renderMarkers() {
    Object.values(state.markers).forEach(function (m) { map.removeLayer(m); });
    state.markers = {};
    state.filtered.forEach(function (item) {
      var marker = L.marker([item.lat, item.lng], { icon: markerIcon }).addTo(map);
      marker.bindPopup(popupHtml(item));
      marker.on("click", function () { setActive(item.id); });
      state.markers[item.id] = marker;
    });
  }

  function popupHtml(item) {
    return (
      '<div class="popup-title">' + escapeHtml(item.name) + "</div>" +
      '<p class="popup-desc">' + escapeHtml(item.description) + "</p>" +
      '<a class="popup-link" href="' + escapeAttr(item.website) + '" target="_blank" rel="noopener">Перейти на сайт →</a>'
    );
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
    if (item) {
      map.flyTo([item.lat, item.lng], 10, { duration: 0.6 });
      var marker = state.markers[id];
      if (marker) marker.openPopup();
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
    state.region = e.target.value;
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
