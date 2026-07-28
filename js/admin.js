(function () {
  "use strict";

  var EDIT_URL = "https://github.com/Ianitskyi/promedia-communities/edit/main/data/communities.json";

  var allItems = [];

  function load() {
    fetch("../data/communities.json?t=" + Date.now())
      .then(function (r) { return r.json(); })
      .then(function (data) {
        allItems = data;
        render();
      })
      .catch(function (err) {
        ["pending-list", "approved-list", "other-list"].forEach(function (id) {
          document.getElementById(id).innerHTML = '<p class="empty-state">' + escapeHtml(t("admin.loadError")) + "</p>";
        });
        console.error(err);
      });
  }

  function render() {
    var pending = allItems.filter(function (i) { return i.status === "pending"; });
    var approved = allItems.filter(function (i) { return i.status === "approved"; });
    var other = allItems.filter(function (i) { return i.status !== "pending" && i.status !== "approved"; });

    renderList("pending-list", pending);
    renderList("approved-list", approved);
    renderList("other-list", other);
  }

  function renderList(containerId, items) {
    var container = document.getElementById(containerId);
    container.innerHTML = "";
    if (!items.length) {
      container.innerHTML = '<p class="empty-state">' + escapeHtml(t("admin.empty")) + "</p>";
      return;
    }
    items.forEach(function (item) {
      var card = document.createElement("div");
      card.className = "admin-card";

      var statusKey = item.status === "approved" ? "admin.statusApproved" : (item.status === "pending" ? "admin.statusPending" : null);
      var statusLabel = statusKey ? t(statusKey) : item.status;

      var badgesHtml = "";
      if (item.badges) {
        Object.keys(item.badges).forEach(function (k) {
          if (item.badges[k]) badgesHtml += '<span class="badge ' + k + '">' + k + "</span>";
        });
      }
      if (item.tags) {
        item.tags.forEach(function (tag) {
          badgesHtml += '<span class="badge tag">' + escapeHtml(tag) + "</span>";
        });
      }
      if (item.example) {
        badgesHtml += '<span class="badge example">' + escapeHtml(t("admin.example")) + "</span>";
      }

      card.innerHTML =
        '<div class="admin-card-top">' +
        '<h3>' + escapeHtml(item.name || item.id) + "</h3>" +
        '<span class="status-pill status-' + escapeAttr(item.status || "unknown") + '">' + escapeHtml(statusLabel) + "</span>" +
        "</div>" +
        '<div class="location">' + escapeHtml(item.city || "") + ", " + escapeHtml(item.region || "") + " · id: <code>" + escapeHtml(item.id || "") + "</code></div>" +
        (badgesHtml ? '<div class="badge-row">' + badgesHtml + "</div>" : "") +
        '<p class="desc">' + escapeHtml(item.description || "") + "</p>" +
        '<div class="card-links">' +
        '<a href="' + escapeAttr(item.website || "#") + '" target="_blank" rel="noopener">' + escapeHtml(item.website || "") + "</a>" +
        (item.sourceIssueUrl ? ' <a href="' + escapeAttr(item.sourceIssueUrl) + '" target="_blank" rel="noopener">' + escapeHtml(t("admin.sourceIssue")) + " #" + escapeHtml(String(item.sourceIssue || "")) + "</a>" : "") +
        "</div>" +
        '<a class="add-btn edit-btn" href="' + EDIT_URL + '" target="_blank" rel="noopener">' + escapeHtml(t("admin.editOnGithub")) + "</a>";

      container.appendChild(card);
    });
  }

  var prevOnLangChange = window.onLangChange;
  window.onLangChange = function () {
    if (typeof prevOnLangChange === "function") prevOnLangChange();
    render();
  };

  load();

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function escapeAttr(str) {
    return escapeHtml(str);
  }
})();
