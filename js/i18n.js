/* =========================================================
   Легкий i18n-шар: перемикач UA/EN без перезавантаження сторінки.
   Статичний текст перекладається через data-i18n(-html|-content|-placeholder)
   атрибути в HTML; динамічний (JS-рендерений) текст — через t()
   виклики прямо в app.js.
   ========================================================= */

const I18N = {
  uk: {
    nav: {
      promedia: "← ПроМедіа",
      addCommunity: "+ Додати спільноту"
    },
    meta: {
      title: "Карта медіаспільнот України | ПроМедіа",
      desc: "Каталог і карта медійних спільнот України: сайти медіа, короткий опис, ключова ідея спільноти та посилання, де на неї підписатися."
    },
    hero: {
      eyebrow: "Каталог і карта медіаспільнот",
      title: "Медійні спільноти України",
      lede: "Незалежні медіа — це критична інфраструктура демократії. Знайди та підтримай улюблену редакцію!"
    },
    controls: {
      searchPlaceholder: "Пошук за назвою чи містом…",
      allRegions: "Усі області"
    },
    map: {
      ariaLabel: "Контурна карта областей України",
      hint: "Натисніть на область, щоб відфільтрувати список. Число всередині — кількість медіа.",
      loadError: "Не вдалося завантажити карту."
    },
    list: {
      loadError: "Не вдалося завантажити каталог. Спробуйте оновити сторінку.",
      empty: "Нічого не знайдено за такими фільтрами."
    },
    results: {
      count: "{count} з {total} медіа"
    },
    card: {
      subscribe: "Підписатися →",
      website: "Сайт медіа",
      example: "приклад — уточнюється"
    },
    badges: {
      recommended: "🗺️ Рекомендоване медіа",
      whitelist: "✅ Білий список ЗМІ",
      jti: "🛡️ JTI-сертифіковане"
    },
    tags: {
      investigative: "🔍 Розслідувальне медіа",
      warJournalism: "🎖️ Воєнна журналістика"
    },
    addSection: {
      title: "Не знайшли своє медіа?",
      text: "Додайте свою медіаспільноту до каталогу — заявка проходить премодерацію перед публікацією."
    },
    footer: {
      initiative: "Ініціатива",
      wordmarkAlt: "ГО «ПроМедіа»",
      mapCreditHtml: "Контурна карта областей: адаптовано з <a href=\"https://mapsvg.com/maps/ukraine\" target=\"_blank\" rel=\"noopener\">MapSVG</a> (<a href=\"https://creativecommons.org/licenses/by/4.0/\" target=\"_blank\" rel=\"noopener\">CC BY 4.0</a>). Дані каталогу проходять премодерацію."
    },
    oblasts: {
      "cherkasy": "Черкаська область",
      "chernihiv": "Чернігівська область",
      "chernivtsi": "Чернівецька область",
      "crimea": "Автономна Республіка Крим",
      "dnipropetrovsk": "Дніпропетровська область",
      "donetsk": "Донецька область",
      "ivano-frankivsk": "Івано-Франківська область",
      "kharkiv": "Харківська область",
      "kherson": "Херсонська область",
      "khmelnytskyi": "Хмельницька область",
      "kirovohrad": "Кіровоградська область",
      "kyiv": "Київська область",
      "kyiv-city": "м. Київ",
      "luhansk": "Луганська область",
      "lviv": "Львівська область",
      "mykolaiv": "Миколаївська область",
      "odessa": "Одеська область",
      "poltava": "Полтавська область",
      "rivne": "Рівненська область",
      "sumy": "Сумська область",
      "ternopil": "Тернопільська область",
      "vinnytsia": "Вінницька область",
      "volyn": "Волинська область",
      "zakarpattia": "Закарпатська область",
      "zaporizhia": "Запорізька область",
      "zhytomyr": "Житомирська область"
    }
  },
  en: {
    nav: {
      promedia: "← ProMedia",
      addCommunity: "+ Add a community"
    },
    meta: {
      title: "Map of Ukrainian Media Communities | ProMedia",
      desc: "Catalog and map of Ukrainian media communities: outlet websites, short descriptions, the community's key idea, and where to subscribe."
    },
    hero: {
      eyebrow: "Catalog and map of media communities",
      title: "Media Communities of Ukraine",
      lede: "Independent media are critical democratic infrastructure. Find and support your favorite outlet!"
    },
    controls: {
      searchPlaceholder: "Search by name or city…",
      allRegions: "All oblasts"
    },
    map: {
      ariaLabel: "Outline map of Ukraine's oblasts",
      hint: "Click an oblast to filter the list. The number inside is the media count.",
      loadError: "Failed to load the map."
    },
    list: {
      loadError: "Failed to load the catalog. Try refreshing the page.",
      empty: "Nothing matches these filters."
    },
    results: {
      count: "{count} of {total} media outlets"
    },
    card: {
      subscribe: "Subscribe →",
      website: "Media website",
      example: "example — to be verified"
    },
    badges: {
      recommended: "🗺️ Recommended media",
      whitelist: "✅ Media whitelist",
      jti: "🛡️ JTI-certified"
    },
    tags: {
      investigative: "🔍 Investigative media",
      warJournalism: "🎖️ War journalism"
    },
    addSection: {
      title: "Didn't find your media?",
      text: "Add your media community to the catalog — submissions go through pre-moderation before publishing."
    },
    footer: {
      initiative: "Initiative",
      wordmarkAlt: "NGO “ProMedia”",
      mapCreditHtml: "Oblast outline map: adapted from <a href=\"https://mapsvg.com/maps/ukraine\" target=\"_blank\" rel=\"noopener\">MapSVG</a> (<a href=\"https://creativecommons.org/licenses/by/4.0/\" target=\"_blank\" rel=\"noopener\">CC BY 4.0</a>). Catalog entries go through pre-moderation."
    },
    oblasts: {
      "cherkasy": "Cherkasy Oblast",
      "chernihiv": "Chernihiv Oblast",
      "chernivtsi": "Chernivtsi Oblast",
      "crimea": "Autonomous Republic of Crimea",
      "dnipropetrovsk": "Dnipropetrovsk Oblast",
      "donetsk": "Donetsk Oblast",
      "ivano-frankivsk": "Ivano-Frankivsk Oblast",
      "kharkiv": "Kharkiv Oblast",
      "kherson": "Kherson Oblast",
      "khmelnytskyi": "Khmelnytskyi Oblast",
      "kirovohrad": "Kirovohrad Oblast",
      "kyiv": "Kyiv Oblast",
      "kyiv-city": "Kyiv City",
      "luhansk": "Luhansk Oblast",
      "lviv": "Lviv Oblast",
      "mykolaiv": "Mykolaiv Oblast",
      "odessa": "Odesa Oblast",
      "poltava": "Poltava Oblast",
      "rivne": "Rivne Oblast",
      "sumy": "Sumy Oblast",
      "ternopil": "Ternopil Oblast",
      "vinnytsia": "Vinnytsia Oblast",
      "volyn": "Volyn Oblast",
      "zakarpattia": "Zakarpattia Oblast",
      "zaporizhia": "Zaporizhzhia Oblast",
      "zhytomyr": "Zhytomyr Oblast"
    }
  }
};

function getLang() {
  const urlLang = new URLSearchParams(location.search).get("lang");
  if (urlLang === "en" || urlLang === "uk") {
    localStorage.setItem("site-lang", urlLang);
    return urlLang;
  }
  return localStorage.getItem("site-lang") === "en" ? "en" : "uk";
}

function setLang(lang) {
  localStorage.setItem("site-lang", lang === "en" ? "en" : "uk");
}

function tRaw(key) {
  const dict = I18N[getLang()];
  return key.split(".").reduce((o, k) => (o && o[k] != null ? o[k] : undefined), dict);
}

function t(key, vars) {
  let str = tRaw(key);
  if (str == null) return key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.split(`{${k}}`).join(v);
    }
  }
  return str;
}

// Дозволяє прийти з promedia.report (чи ratings.promedia.report) з ?lang=en
// і одразу відкрити цю сторінку англійською; посилання назад теж
// зберігають поточну мову через ?lang=.
function syncCrossSiteLinks() {
  const lang = getLang();
  document.querySelectorAll("a.home-btn, a[data-cross-site]").forEach((a) => {
    try {
      const url = new URL(a.getAttribute("href"), location.href);
      url.searchParams.set("lang", lang);
      a.setAttribute("href", url.toString());
    } catch (e) { /* лишаємо посилання як є, якщо не вдалось розпарсити */ }
  });
}

function applyStaticI18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const value = tRaw(el.dataset.i18n);
    if (value != null) el.textContent = value;
  });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const value = tRaw(el.dataset.i18nHtml);
    if (value != null) el.innerHTML = value;
  });
  document.querySelectorAll("[data-i18n-content]").forEach((el) => {
    const value = tRaw(el.dataset.i18nContent);
    if (value != null) el.setAttribute("content", value);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const value = tRaw(el.dataset.i18nPlaceholder);
    if (value != null) el.setAttribute("placeholder", value);
  });
  document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
    const value = tRaw(el.dataset.i18nAlt);
    if (value != null) el.setAttribute("alt", value);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    const value = tRaw(el.dataset.i18nAriaLabel);
    if (value != null) el.setAttribute("aria-label", value);
  });
  syncCrossSiteLinks();
}

function initLangToggle() {
  const buttons = document.querySelectorAll(".lang-btn");
  function sync() {
    const lang = getLang();
    buttons.forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
  }
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.lang === getLang()) return;
      setLang(btn.dataset.lang);
      document.documentElement.lang = getLang();
      sync();
      applyStaticI18n();
      if (typeof window.onLangChange === "function") window.onLangChange();
    });
  });
  sync();
}

document.documentElement.lang = getLang();
applyStaticI18n();
initLangToggle();
