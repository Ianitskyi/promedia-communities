(function () {
  "use strict";

  var SUBMIT_URL = "https://promedia-submit-community.a-ianitskyi.workers.dev";
  var EDIT_URL = "https://github.com/Ianitskyi/promedia-communities/edit/main/data/communities.json";
  var PASSWORD_KEY = "promedia-admin-password";

  var allItems = [];

  function getPassword() {
    return localStorage.getItem(PASSWORD_KEY) || "";
  }

  var passwordInput = document.getElementById("admin-password-input");
  var passwordSaveBtn = document.getElementById("admin-password-save");
  var authStatus = document.getElementById("admin-auth-status");

  passwordInput.value = getPassword();
  passwordSaveBtn.addEventListener("click", function () {
    localStorage.setItem(PASSWORD_KEY, passwordInput.value);
    authStatus.textContent = t("admin.passwordSaved");
    setTimeout(function () { authStatus.textContent = ""; }, 2500);
  });

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

  function actionButtonsHtml(item) {
    var actions = "";
    if (item.status === "pending") {
      actions += '<button type="button" class="admin-action-btn approve" data-id="' + escapeAttr(item.id) + '" data-status="approved">' + escapeHtml(t("admin.approve")) + "</button>";
      actions += '<button type="button" class="admin-action-btn reject" data-id="' + escapeAttr(item.id) + '" data-status="deleted" data-confirm="1">' + escapeHtml(t("admin.reject")) + "</button>";
    } else if (item.status === "approved") {
      actions += '<button type="button" class="admin-action-btn deactivate" data-id="' + escapeAttr(item.id) + '" data-status="disabled">' + escapeHtml(t("admin.deactivate")) + "</button>";
      actions += '<button type="button" class="admin-action-btn reject" data-id="' + escapeAttr(item.id) + '" data-status="deleted" data-confirm="1">' + escapeHtml(t("admin.delete")) + "</button>";
    } else {
      actions += '<button type="button" class="admin-action-btn approve" data-id="' + escapeAttr(item.id) + '" data-status="approved">' + escapeHtml(t("admin.reactivate")) + "</button>";
      actions += '<button type="button" class="admin-action-btn reject" data-id="' + escapeAttr(item.id) + '" data-status="deleted" data-confirm="1">' + escapeHtml(t("admin.delete")) + "</button>";
    }
    return '<div class="admin-actions">' + actions + "</div>";
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
        actionButtonsHtml(item) +
        '<a class="add-btn edit-btn" href="' + EDIT_URL + '" target="_blank" rel="noopener">' + escapeHtml(t("admin.editOnGithub")) + "</a>";

      container.appendChild(card);
    });
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest(".admin-action-btn");
    if (!btn) return;
    var id = btn.getAttribute("data-id");
    var newStatus = btn.getAttribute("data-status");
    var requireConfirm = btn.getAttribute("data-confirm") === "1";
    moderate(id, newStatus, requireConfirm, btn);
  });

  function moderate(id, newStatus, requireConfirm, btn) {
    if (requireConfirm && !window.confirm(t("admin.confirmAction"))) return;

    var password = getPassword();
    if (!password) {
      window.alert(t("admin.passwordRequired"));
      return;
    }

    btn.disabled = true;

    fetch(SUBMIT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "moderate", password: password, id: id, newStatus: newStatus })
    })
      .then(function (r) {
        if (r.status === 401) throw new Error("unauthorized");
        if (!r.ok) throw new Error("failed");
        return r.json();
      })
      .then(function () {
        if (newStatus === "deleted") {
          allItems = allItems.filter(function (i) { return i.id !== id; });
        } else {
          var item = allItems.find(function (i) { return i.id === id; });
          if (item) item.status = newStatus;
        }
        render();
      })
      .catch(function (err) {
        btn.disabled = false;
        if (err.message === "unauthorized") {
          localStorage.removeItem(PASSWORD_KEY);
          passwordInput.value = "";
          window.alert(t("admin.wrongPassword"));
        } else {
          window.alert(t("admin.actionFailed"));
        }
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
