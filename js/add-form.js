(function () {
  "use strict";

  var SUBMIT_URL = "https://promedia-submit-community.a-ianitskyi.workers.dev";

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
  var logoInput = document.getElementById("f-logo");

  var ALLOWED_LOGO_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
  var MAX_LOGO_BYTES = 2 * 1024 * 1024;

  function readLogoAsBase64() {
    return new Promise(function (resolve, reject) {
      var file = logoInput && logoInput.files && logoInput.files[0];
      if (!file) return resolve(null);
      if (ALLOWED_LOGO_TYPES.indexOf(file.type) === -1) return reject(new Error("logo_invalid_type"));
      if (file.size > MAX_LOGO_BYTES) return reject(new Error("logo_too_large"));

      var reader = new FileReader();
      reader.onload = function () {
        var result = String(reader.result);
        var comma = result.indexOf(",");
        resolve({ mimeType: file.type, base64: result.slice(comma + 1) });
      };
      reader.onerror = function () { reject(new Error("logo_read_failed")); };
      reader.readAsDataURL(file);
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    errorEl.hidden = true;
    successEl.hidden = true;

    readLogoAsBase64().then(function (logo) {
      var fields = {
        name: document.getElementById("f-name").value.trim(),
        website: document.getElementById("f-website").value.trim(),
        communityUrl: document.getElementById("f-community-url").value.trim(),
        description: document.getElementById("f-description").value.trim(),
        communityIdea: "",
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

      if (logo) {
        fields.logoBase64 = logo.base64;
        fields.logoMimeType = logo.mimeType;
      }

      if (document.getElementById("f-tag-investigative").checked) fields.tags.push("investigative");
      if (document.getElementById("f-tag-war").checked) fields.tags.push("warJournalism");
      if (document.getElementById("f-tag-culture").checked) fields.tags.push("culture");

      var required = ["name", "website", "communityUrl", "description", "city", "regionSlug"];
      var missing = required.some(function (key) { return !fields[key]; });

      if (missing) {
        errorEl.textContent = t("addForm.requiredError");
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
    }).catch(function (err) {
      var key = err && err.message === "logo_too_large" ? "addForm.logo.tooLarge"
        : err && err.message === "logo_invalid_type" ? "addForm.logo.invalidType"
        : "addForm.submitError";
      errorEl.textContent = t(key);
      errorEl.hidden = false;
      errorEl.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
})();
