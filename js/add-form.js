(function () {
  "use strict";

  var ISSUE_URL = "https://github.com/Ianitskyi/promedia-communities/issues/new?template=add-community.yml";

  var platformSelect = document.getElementById("f-platform");
  var regionSelect = document.getElementById("f-region");

  function populatePlatformOptions() {
    var current = platformSelect.value;
    Array.prototype.forEach.call(platformSelect.options, function (opt) {
      var label = tRaw("addForm.platformOptions." + opt.value);
      if (label) opt.textContent = label;
    });
    platformSelect.value = current;
  }

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

  populatePlatformOptions();
  populateRegionOptions();

  var prevOnLangChange = window.onLangChange;
  window.onLangChange = function () {
    if (typeof prevOnLangChange === "function") prevOnLangChange();
    populatePlatformOptions();
    populateRegionOptions();
    document.querySelector('#f-region option[value=""]').textContent = t("addForm.region.placeholder");
  };

  document.getElementById("community-form").addEventListener("submit", function (e) {
    e.preventDefault();

    var fields = {
      name: document.getElementById("f-name").value.trim(),
      website: document.getElementById("f-website").value.trim(),
      "community-url": document.getElementById("f-community-url").value.trim(),
      platform: platformSelect.value,
      description: document.getElementById("f-description").value.trim(),
      "community-idea": document.getElementById("f-community-idea").value.trim(),
      city: document.getElementById("f-city").value.trim(),
      region: regionSelect.value,
      contact: document.getElementById("f-contact").value.trim()
    };

    var required = ["name", "website", "community-url", "description", "community-idea", "city", "region"];
    var missing = required.some(function (key) { return !fields[key]; });
    var errorEl = document.getElementById("form-error");
    if (missing) {
      errorEl.hidden = false;
      errorEl.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    errorEl.hidden = true;

    // GitHub Issue Forms очікують значення dropdown "Область" українською —
    // саме тими рядками, що прописані в add-community.yml, незалежно від
    // поточної мови інтерфейсу цієї сторінки.
    var regionLabelUk = I18N.uk.oblasts[fields.region] || fields.region;

    var params = new URLSearchParams();
    params.set("name", fields.name);
    params.set("website", fields.website);
    params.set("community-url", fields["community-url"]);
    params.set("platform", fields.platform);
    params.set("description", fields.description);
    params.set("community-idea", fields["community-idea"]);
    params.set("city", fields.city);
    params.set("region", regionLabelUk);
    if (fields.contact) params.set("contact", fields.contact);

    var url = ISSUE_URL + "&" + params.toString();
    window.open(url, "_blank", "noopener");

    var note = document.querySelector(".form-note");
    if (note) {
      note.textContent = t("addForm.note");
      note.classList.add("form-note-highlight");
    }
  });
})();
