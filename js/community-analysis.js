(function () {
  "use strict";

  var STORAGE_KEY = "promedia-community-analysis-v1";
  var PDFMAKE_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.12/pdfmake.min.js";
  var PDFMAKE_FONTS_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.12/vfs_fonts.js";
  var QUESTION_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6", "q7"];

  var TEXT = {
    uk: {
      nav: {
        analysis: "Аналіз спільноти"
      },
      analysis: {
        eyebrow: "Практикум",
        title: "Сім питань для аналізу спільноти медіа",
        lede: "Заповніть відповіді та завантажте PDF.",
        fields: {
          name: {
            label: "Назва медіа або спільноти",
            placeholder: "Наприклад: спільнота читачів місцевого медіа"
          }
        },
        questions: {
          q1: "Якою є ціннісна пропозиція? Чому існує ця спільнота? Яка спільна ідея об'єднує її учасників?",
          q2: "Яким є рівень формалізації спільноти? Чи є чіткі правила, процедури, розподіл ролей? Чи є спеціальний менеджер, який займається спільнотою?",
          q3: "Якими є внески учасників? Які ресурси інвестують члени спільноти у її розбудову? Це можуть бути гроші, час, контент або досвід.",
          q4: "Яким є рівень взаємодії всередині спільноти? Наскільки учасники спільноти залучені?",
          q5: "Якими є спільні практики: повторювані ритуали, події, процедури, символи та традиції, що формують унікальну культуру спільноти?",
          q6: "Якими є ціннісно-емоційні фактори залучення? Почуття солідарності, визнання, приналежності до певної соціальної групи тощо.",
          q7: "Якими є практичні та когнітивні переваги? Йдеться про раціональні переваги членства в спільноті від нових знань та знайомств до подарунків."
        },
        actions: {
          download: "Завантажити PDF",
          reset: "Очистити"
        },
        status: {
          autosave: "Чернетка автоматично зберігається у цьому браузері.",
          empty: "Заповніть принаймні назву спільноти або одну відповідь.",
          building: "Формую PDF...",
          downloaded: "PDF сформовано. Якщо файл не відкрився автоматично, перевірте завантаження браузера.",
          printFallback: "Не вдалося сформувати PDF автоматично, відкриваю версію для друку.",
          popupBlocked: "Браузер заблокував вікно друку. Дозвольте спливні вікна для цього сайту.",
          reset: "Форму очищено."
        },
        pdf: {
          title: "Сім питань для аналізу спільноти",
          communityLabel: "Спільнота",
          dateLabel: "Дата",
          untitled: "Без назви",
          emptyAnswer: "Не заповнено",
          footer: "Підготовлено за допомогою інструмента ГО «ПроМедіа»",
          filePrefix: "analiz-spilnoty"
        }
      }
    },
    en: {
      nav: {
        analysis: "Community analysis"
      },
      analysis: {
        eyebrow: "Worksheet",
        title: "Seven Questions for Media Community Analysis",
        lede: "Fill in your answers and download the PDF.",
        fields: {
          name: {
            label: "Media outlet or community name",
            placeholder: "For example: a local media reader community"
          }
        },
        questions: {
          q1: "What is the value proposition? Why does this community exist? What shared idea brings its members together?",
          q2: "How formalized is the community? Are there clear rules, procedures, and roles? Is there a dedicated community manager?",
          q3: "What do members contribute? Which resources do they invest in building the community: money, time, content, expertise, or something else?",
          q4: "What is the level of interaction inside the community? How engaged are the community members?",
          q5: "What shared practices shape the community: recurring rituals, events, procedures, symbols, and traditions that form its unique culture?",
          q6: "Which value-based and emotional factors drive engagement: solidarity, recognition, belonging to a social group, and similar motivations?",
          q7: "What practical and cognitive benefits does the community provide: from new knowledge and connections to tangible perks?"
        },
        actions: {
          download: "Download PDF",
          reset: "Clear"
        },
        status: {
          autosave: "Your draft is saved automatically in this browser.",
          empty: "Add at least the community name or one answer.",
          building: "Building the PDF...",
          downloaded: "The PDF is ready. If it did not open automatically, check your browser downloads.",
          printFallback: "Automatic PDF generation failed, so I am opening a print-ready version.",
          popupBlocked: "The browser blocked the print window. Allow pop-ups for this site.",
          reset: "The form has been cleared."
        },
        pdf: {
          title: "Seven Questions for Community Analysis",
          communityLabel: "Community",
          dateLabel: "Date",
          untitled: "Untitled",
          emptyAnswer: "Not filled in",
          footer: "Prepared with the NGO ProMedia tool",
          filePrefix: "community-analysis"
        }
      }
    }
  };

  var els = {};
  var pdfMakePromise = null;
  var logoSvgPromise = null;

  function boot() {
    els.form = document.getElementById("community-analysis-form");
    if (!els.form) return;

    els.name = document.getElementById("analysis-community-name");
    els.status = document.getElementById("analysis-status");
    els.download = document.getElementById("analysis-download-pdf");
    els.reset = document.getElementById("analysis-reset");
    els.textareas = Array.prototype.slice.call(els.form.querySelectorAll("textarea"));

    restoreDraft();
    renderText();
    bindEvents();
    wrapLanguageChange();
    autosizeAll();
  }

  function lang() {
    return typeof getLang === "function" ? getLang() : "uk";
  }

  function readText(path) {
    var dict = TEXT[lang()] || TEXT.uk;
    return path.split(".").reduce(function (obj, key) {
      return obj && obj[key] != null ? obj[key] : undefined;
    }, dict) || path;
  }

  function renderText() {
    document.querySelectorAll("[data-analysis-i18n]").forEach(function (el) {
      var value = readText(el.dataset.analysisI18n);
      if (value != null) el.textContent = value;
    });

    document.querySelectorAll("[data-analysis-i18n-placeholder]").forEach(function (el) {
      var value = readText(el.dataset.analysisI18nPlaceholder);
      if (value != null) el.setAttribute("placeholder", value);
    });

    if (els.status && !els.status.dataset.customStatus) {
      setStatus(readText("analysis.status.autosave"));
    }
  }

  function wrapLanguageChange() {
    var previous = window.onLangChange;
    window.onLangChange = function () {
      if (typeof previous === "function") previous();
      renderText();
    };
  }

  function bindEvents() {
    els.form.addEventListener("input", function (event) {
      saveDraft();
      if (event.target.tagName === "TEXTAREA") resizeTextarea(event.target);
      setStatus(readText("analysis.status.autosave"));
    });

    els.download.addEventListener("click", downloadPdf);

    els.reset.addEventListener("click", function () {
      els.form.reset();
      localStorage.removeItem(STORAGE_KEY);
      autosizeAll();
      setStatus(readText("analysis.status.reset"), "success");
    });
  }

  function collectData() {
    var data = {
      communityName: els.name.value.trim()
    };
    QUESTION_KEYS.forEach(function (key) {
      var input = els.form.elements[key];
      data[key] = input ? input.value.trim() : "";
    });
    return data;
  }

  function hasContent(data) {
    return Boolean(data.communityName || QUESTION_KEYS.some(function (key) { return data[key]; }));
  }

  function saveDraft() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collectData()));
    } catch (err) {
      console.warn("Could not save community analysis draft", err);
    }
  }

  function restoreDraft() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (data.communityName) els.name.value = data.communityName;
      QUESTION_KEYS.forEach(function (key) {
        if (data[key] && els.form.elements[key]) els.form.elements[key].value = data[key];
      });
    } catch (err) {
      console.warn("Could not restore community analysis draft", err);
    }
  }

  function setStatus(message, type) {
    if (!els.status) return;
    els.status.textContent = message;
    els.status.dataset.customStatus = type ? "1" : "";
    els.status.classList.toggle("is-error", type === "error");
    els.status.classList.toggle("is-success", type === "success");
  }

  function autosizeAll() {
    els.textareas.forEach(resizeTextarea);
  }

  function resizeTextarea(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = Math.max(130, textarea.scrollHeight) + "px";
  }

  function ensurePdfMake() {
    if (window.pdfMake && window.pdfMake.vfs) return Promise.resolve();
    if (!pdfMakePromise) {
      pdfMakePromise = loadScript(PDFMAKE_URL).then(function () {
        return loadScript(PDFMAKE_FONTS_URL);
      });
    }
    return pdfMakePromise;
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');
      if (existing) {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }
      var script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function getLogoSvg() {
    if (!logoSvgPromise) {
      logoSvgPromise = fetch("/img/promedia-wordmark.svg")
        .then(function (response) {
          if (!response.ok) throw new Error("Logo unavailable");
          return response.text();
        })
        .catch(function () { return ""; });
    }
    return logoSvgPromise;
  }

  function downloadPdf() {
    var data = collectData();
    if (!hasContent(data)) {
      setStatus(readText("analysis.status.empty"), "error");
      return;
    }

    setStatus(readText("analysis.status.building"));
    ensurePdfMake()
      .then(getLogoSvg)
      .then(function (logoSvg) {
        window.pdfMake.createPdf(buildPdfDefinition(data, logoSvg)).download(fileName(data));
        setStatus(readText("analysis.status.downloaded"), "success");
      })
      .catch(function (err) {
        console.error(err);
        setStatus(readText("analysis.status.printFallback"), "error");
        openPrintView(data);
      });
  }

  function buildPdfDefinition(data, logoSvg) {
    var content = [];
    var headerColumns = [];

    if (logoSvg) {
      headerColumns.push({ svg: logoSvg, width: 130 });
    } else {
      headerColumns.push({ text: "ProMedia", style: "brand" });
    }

    headerColumns.push({
      stack: [
        { text: readText("analysis.pdf.dateLabel") + ": " + formattedDate(), style: "meta", alignment: "right" },
        { text: "communities.promedia.report", style: "tiny", alignment: "right" }
      ],
      width: "*"
    });

    content.push({ columns: headerColumns, columnGap: 18, margin: [0, 0, 0, 22] });
    content.push({ text: readText("analysis.pdf.title"), style: "title" });
    content.push({
      text: readText("analysis.pdf.communityLabel") + ": " + (data.communityName || readText("analysis.pdf.untitled")),
      style: "subtitle",
      margin: [0, 4, 0, 14]
    });

    QUESTION_KEYS.forEach(function (key, index) {
      var answer = data[key] || readText("analysis.pdf.emptyAnswer");
      content.push({
        text: (index + 1) + ". " + readText("analysis.questions." + key),
        style: "question",
        margin: [0, index === 0 ? 4 : 12, 0, 4]
      });
      content.push({
        text: answer,
        style: data[key] ? "answer" : "emptyAnswer",
        margin: [0, 0, 0, 4]
      });
    });

    content.push({ text: readText("analysis.pdf.footer"), style: "footer", margin: [0, 18, 0, 0] });

    return {
      pageSize: "A4",
      pageMargins: [42, 40, 42, 46],
      content: content,
      defaultStyle: {
        font: "Roboto",
        fontSize: 10.5,
        lineHeight: 1.22,
        color: "#15142f"
      },
      styles: {
        brand: { fontSize: 18, bold: true, color: "#0d0c5c" },
        title: { fontSize: 21, bold: true, color: "#0d0c5c", lineHeight: 1.15 },
        subtitle: { fontSize: 11.5, bold: true, color: "#7c7c93" },
        meta: { fontSize: 9.5, color: "#7c7c93" },
        tiny: { fontSize: 8, color: "#a4a4b4" },
        question: { fontSize: 11.5, bold: true, color: "#0d0c5c", lineHeight: 1.25 },
        answer: { fontSize: 10.5, color: "#15142f", lineHeight: 1.28 },
        emptyAnswer: { fontSize: 10, italics: true, color: "#a4a4b4" },
        footer: { fontSize: 9, color: "#7c7c93" }
      }
    };
  }

  function openPrintView(data) {
    var printWindow = window.open("", "_blank");
    if (!printWindow) {
      setStatus(readText("analysis.status.popupBlocked"), "error");
      return;
    }
    printWindow.document.open();
    printWindow.document.write(buildPrintHtml(data));
    printWindow.document.close();
    printWindow.focus();
    setTimeout(function () { printWindow.print(); }, 350);
  }

  function buildPrintHtml(data) {
    var logoUrl = new URL("img/promedia-wordmark.svg", location.href).toString();
    var answersHtml = QUESTION_KEYS.map(function (key, index) {
      var answer = data[key] || readText("analysis.pdf.emptyAnswer");
      var emptyClass = data[key] ? "" : " empty";
      return '<section class="qa">' +
        '<h2>' + (index + 1) + ". " + escapeHtml(readText("analysis.questions." + key)) + "</h2>" +
        '<p class="answer' + emptyClass + '">' + escapeHtml(answer).replace(/\n/g, "<br>") + "</p>" +
        "</section>";
    }).join("");

    return '<!doctype html><html lang="' + escapeAttr(lang()) + '"><head><meta charset="utf-8">' +
      "<title>" + escapeHtml(readText("analysis.pdf.title")) + "</title>" +
      "<style>" +
      '@page{size:A4;margin:16mm}body{font-family:Montserrat,Arial,sans-serif;color:#15142f;line-height:1.45;margin:0}' +
      '.head{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;margin-bottom:26px}' +
      '.logo{width:140px;height:auto}.date{font-size:11px;color:#7c7c93;text-align:right}h1{font-size:25px;line-height:1.15;color:#0d0c5c;margin:0 0 8px}' +
      '.subtitle{font-size:13px;font-weight:700;color:#7c7c93;margin:0 0 20px}.qa{break-inside:avoid;margin:0 0 16px;padding:0 0 14px;border-bottom:1px solid #e7e7ef}' +
      '.qa h2{font-size:13px;line-height:1.35;color:#0d0c5c;margin:0 0 7px}.answer{font-size:12px;white-space:normal;margin:0}.answer.empty{color:#a4a4b4;font-style:italic}' +
      '.footer{font-size:10px;color:#7c7c93;margin-top:20px}' +
      "</style></head><body>" +
      '<header class="head"><img class="logo" src="' + escapeAttr(logoUrl) + '" alt="ProMedia"><div class="date">' +
      escapeHtml(readText("analysis.pdf.dateLabel")) + ": " + escapeHtml(formattedDate()) + "<br>communities.promedia.report</div></header>" +
      "<h1>" + escapeHtml(readText("analysis.pdf.title")) + "</h1>" +
      '<p class="subtitle">' + escapeHtml(readText("analysis.pdf.communityLabel")) + ": " + escapeHtml(data.communityName || readText("analysis.pdf.untitled")) + "</p>" +
      answersHtml +
      '<p class="footer">' + escapeHtml(readText("analysis.pdf.footer")) + "</p>" +
      "</body></html>";
  }

  function fileName(data) {
    var base = data.communityName || readText("analysis.pdf.filePrefix");
    return sanitizeFileName(base).slice(0, 80) + ".pdf";
  }

  function sanitizeFileName(value) {
    return String(value || readText("analysis.pdf.filePrefix"))
      .trim()
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || readText("analysis.pdf.filePrefix");
  }

  function formattedDate() {
    var locale = lang() === "en" ? "en-US" : "uk-UA";
    try {
      return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(new Date());
    } catch (err) {
      return new Date().toISOString().slice(0, 10);
    }
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  (window.siteContentReady || Promise.resolve()).then(boot);
})();
