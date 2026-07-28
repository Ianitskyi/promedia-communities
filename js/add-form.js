(function () {
  "use strict";

  var SUBMIT_URL = "/api/submit-community";

  var regionSelect = document.getElementById("f-region");

  function populateRegionOptions() {
    var current = regionSelect.value;
    var placeholder = regionSelect.querySelector('option[value=""]');
    regionSelect.innerHTML = "";
    if (placeholder) regionSelect.appendChild(placeholder);
    else {
      var opt0 = document.createElement("option");
      opt0.value = "";
      regionSelect.appendChild(opt0);
    }
    var slugs = OBLAST_SLUGS.slice().sort(function (a, b) {
      return tRaw("oblasts." + a).localeCompare(tRaw("oblasts." + b), getLang());
    });
    slugs.forEach(function (slug) {
      var opt = document.createElement("option");
      opt.value = slug;
      opt.textContent = tRaw("oblasts." + slug);
      regionSelect.appendChild(opt);
    });
    regionSelect.value = current;
  }

  populateRegionOptions();

  var prevOnLangChange = window.onLangChange;
  window.onLangChange = function () {
    if (typeof prevOnLangChange === "function") prevOnLangChange();
    populateRegionOptions();
    document.querySelector('#f-region option[value=""]').textContent = t("addForm.region.placeholder");
  };

  var form = document.getElementById("community-form");
  var submitBtn = document.getElementById("submit-btn");
  var errorEl = document.getElementById("form-error");
  var successEl = document.getElementById("form-success");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var fields = {
      name: document.getElementById("f-name").value.trim(),
      website: document.getElementById("f-website").value.trim(),
      communityUrl: document.getElementById("f-community-url").value.trim(),
      description: document.getElementById("f-description").value.trim(),
      communityIdea: document.getElementById("f-community-idea").value.trim(),
      city: document.getElementById("f-city").value.trim(),
      regionSlug: regionSelect.value,
      contact: document.getElementById("f-contact").value.trim(),
      badges: {
        recommended: document.getElementById("f-badge-recommended").checked,
        whitelist: document.getElementById("f-badge-whitelist").checked,
        jti: document.getElementById("f-badge-jti").checked
      },
      tags: [],
      company: document.getElementById("f-company").value // honeypot
    };

    if (document.getElementById("f-tag-investigative").checked) fields.tags.push("investigative");
    if (document.getElementById("f-tag-war").checked) fields.tags.push("warJournalism");

    var required = ["name", "website", "communityUrl", "description", "communityIdea", "city", "regionSlug"];
    var missing = required.some(function (key) { return !fields[key]; });

    errorEl.hidden = true;
    successEl.hidden = true;

    if (missing) {
      errorEl.hidden = false;
      errorEl.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    submitBtn.disabled = true;
    var originalLabel = submitBtn.textContent;
    submitBtn.textContent = t("addForm.submitting");

    fetch(SUBMIT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields)
    })
      .then(function (r) {
        if (!r.ok) throw new Error("submit_failed");
        return r.json();
      })
      .then(function () {
        successEl.hidden = false;
        successEl.scrollIntoView({ behavior: "smooth", block: "center" });
        form.reset();
        submitBtn.textContent = originalLabel;
        submitBtn.disabled = false;
      })
      .catch(function (err) {
        console.error(err);
        errorEl.textContent = t("addForm.submitError");
        errorEl.hidden = false;
        errorEl.scrollIntoView({ behavior: "smooth", block: "center" });
        submitBtn.textContent = originalLabel;
        submitBtn.disabled = false;
      });
  });
})();
