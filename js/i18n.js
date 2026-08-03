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
      addCommunity: "+ Додати спільноту",
      aboutCommunities: "Що таке медійна спільнота"
    },
    meta: {
      title: "Карта медіаспільнот України | ПроМедіа",
      desc: "Каталог і карта медійних спільнот України: сайти медіа, короткий опис, ключова ідея спільноти та посилання, де на неї підписатися."
    },
    hero: {
      eyebrow: "Каталог і карта медіаспільнот",
      title: "Медійні спільноти України",
      ledeHtml: "Зібрали видання, що спираються на підтримку читачів та залишають матеріали у відкритому доступі. Вони не ховають статті під замок (paywall), а залучають гроші однодумців задля досягнення спільної мети (membership). Більше читайте у розділі «<a href=\"#about-communities\">Що таке медійна спільнота</a>».",
      stat: "{total} медіаспільнот у каталозі"
    },
    explainer: {
      eyebrow: "Довідка",
      title: "Що таке медійна спільнота?",
      q1: {
        q: "Що таке медійна спільнота?",
        aHtml: "Медіаспільноти (media communities) ще називають «клубами читачів», «друзями медіа», «моделями членства» тощо. Згідно з визначенням The Membership Puzzle Project (2020), це соціальний договір між новинною організацією та членами її спільноти, за яким члени спільноти виділяють свій час, гроші, енергію, досвід та зв'язки для підтримки справи, в яку вони вірять. Натомість новинна організація пропонує прозорість та можливості зробити значний внесок у стабільність та вплив організації. Джерело: <a href=\"https://membershippuzzle.org/\" target=\"_blank\" rel=\"noopener\">membershippuzzle.org</a>. Сьогодні в Україні кількадесят спільнот медіа, а у 2021 році їх було лише 11. Детальніше читайте в <a href=\"research/\">дослідженні Membership Puzzle Project</a>"
      },
      q2: {
        q: "Чим медійна спільнота відрізняється від підписки?",
        aHtml: "Підписка на медіа — це виключно ділова, транзакційна угода. Ви платите журналістам гроші та отримуєте свою газету, журнал, доступ до текстів або відео на сайті. У спільноті ви платите журналістам гроші, тому що хочете підтримати медіа задля спільної мети. Вам подобається, що робить ця редакція, які погляди вона сповідує, ви вважаєте роботу цієї редакції корисною або вона закриває ваші емоційні або екзистенційні потреби."
      },
      q3: {
        q: "Як створити свою спільноту?",
        aHtml: "Громадська організація «ПроМедіа» допомагає медіа створювати та розвивати спільноти читачів. Ми також проводимо вебінари та офлайнове навчання на замовлення міжнародної організації Institute for War and Peace Reporting. У 2026 році ми долучилися до створення посібника з розвитку спільнот, ви можете знайти pdf-версію за посиланням: <a href=\"https://iwpr.net/global-voices/print-publications/how-bring-order-chaos\" target=\"_blank\" rel=\"noopener\">iwpr.net</a>"
      },
      q4: {
        q: "Чому на карті немає УП, НВ, Ліги та Forbes?",
        aHtml: "Бо ці медіа пропонують підписку, а не спільноту. У випадку цих видань йдеться про платний доступ до основного контенту. А формування спільноти навколо медіа не передбачає, що доступ до ключових матеріалів видання платний. Можливий додатковий бонусний контент для членів спільноти, але сама ідея спільноти полягає в тому, що фанати медіа підтримують його діяльність для збільшення впливу."
      },
      q5: {
        q: "Що означають позначки «рекомендоване», «білий список», «сертифіковане»?",
        aHtml: "На картках медіа можна побачити позначки, які підтверджують довіру до видання:<br>🗺️ <strong>Рекомендоване медіа</strong> — видання входить до Мапи рекомендованих медіа, яку ведуть Детектор медіа та Інститут масової інформації (ІМІ): <a href=\"https://map.detector.media/\" target=\"_blank\" rel=\"noopener\">map.detector.media</a><br>✅ <strong>Білий список ЗМІ</strong> — видання входить до білого списку ІМІ, який визначає медіа з високими стандартами якості: <a href=\"https://imi.org.ua/doslidzhennya-standartiv\" target=\"_blank\" rel=\"noopener\">imi.org.ua</a><br>🛡️ <strong>JTI-сертифіковане</strong> — видання пройшло сертифікацію за стандартом Journalism Trust Initiative, що підтверджує прозорість і етичність редакційних процесів: <a href=\"https://journalismtrustinitiative.org/\" target=\"_blank\" rel=\"noopener\">journalismtrustinitiative.org</a>"
      }
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
      recommended: "Медіа на Мапі рекомендованих",
      whitelist: "Медіа у Білому списку",
      jti: "Сертифікат Journalism Trust Initiative"
    },
    tags: {
      investigative: "Розслідувальне медіа",
      warJournalism: "Воєнна журналістика",
      culture: "Медіа про культуру",
      science: "Наукове медіа"
    },
    legend: {
      recommended: "медіа на Мапі рекомендованих",
      whitelist: "медіа у Білому списку",
      jti: "сертифікат Journalism Trust Initiative"
    },
    addSection: {
      title: "Не знайшли своє медіа?",
      text: "Додайте свою медіаспільноту до каталогу — заявка проходить премодерацію перед публікацією."
    },
    footer: {
      initiative: "Ініціатива",
      wordmarkAlt: "ГО «ПроМедіа»",
      mapCreditHtml: "Контурна карта областей: адаптовано з <a href=\"https://mapsvg.com/maps/ukraine\" target=\"_blank\" rel=\"noopener\">MapSVG</a> (<a href=\"https://creativecommons.org/licenses/by/4.0/\" target=\"_blank\" rel=\"noopener\">CC BY 4.0</a>). Дані каталогу проходять премодерацію.",
      reportErrorHtml: "Побачили помилку? Напишіть на <a href=\"mailto:info@promedia.report\">info@promedia.report</a>"
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
    },
    addForm: {
      eyebrow: "Додати спільноту",
      title: "Додайте свою медіаспільноту",
      lede: "Заповніть форму нижче й надішліть — заявка проходить премодерацію, зазвичай публікуємо за 1-2 робочих дні.",
      backToMap: "← До карти",
      name: { label: "Назва медіа", placeholder: "Наприклад: Суспільне Новини" },
      website: { label: "Сайт медіа", placeholder: "https://example.com" },
      logo: {
        label: "Логотип медіа (опційно)",
        hint: "PNG, JPG, SVG або WebP, до 2 МБ. Якщо не завантажите — спробуємо підтягнути іконку сайту автоматично.",
        tooLarge: "Файл завеликий — максимум 2 МБ.",
        invalidType: "Непідтримуваний формат файлу — використайте PNG, JPG, SVG або WebP."
      },
      communityUrl: { label: "Посилання на спільноту (де підписатися)", hint: "Посилання, за яким можна переказати гроші та долучитися до спільноти", placeholder: "https://t.me/example" },
      description: { label: "Короткий опис медіа та ключова ідея спільноти", hint: "Що це за медіа і чому варто підписатися на його спільноту." },
      city: { label: "Місто", placeholder: "Львів" },
      region: { label: "Область", placeholder: "Оберіть область", hint: "Медіа на карті прив'язується до області (контурна схематична карта, без точних координат)." },
      badgesLabel: "Позначки (якщо застосовно)",
      badgeRecommended: "На мапі рекомендованих медіа",
      badgeWhitelist: "У білому списку ЗМІ",
      badgeJti: "Має міжнародний знак JTI (Journalism Trust Initiative)",
      tagsLabel: "Теги (опційно)",
      tagInvestigative: "Розслідувальне медіа",
      tagWarJournalism: "Воєнна журналістика",
      tagCulture: "Медіа про культуру",
      tagScience: "Наукове медіа",
      contact: { label: "Контакт заявника (email або телефон)", hint: "Щоб ми могли зв'язатися, якщо виникнуть питання щодо заявки." },
      submit: "Надіслати заявку",
      submitting: "Надсилаємо…",
      success: "Дякуємо! Заявку надіслано, вона на розгляді модератора.",
      submitError: "Не вдалося надіслати заявку. Спробуйте ще раз або напишіть на info@promedia.report.",
      note: "Заявка проходить премодерацію — зазвичай публікуємо за 1-2 робочих дні.",
      requiredError: "Заповніть, будь ласка, усі обов'язкові поля."
    },
    admin: {
      eyebrow: "Тільки для команди ПроМедіа",
      title: "Адмін-панель каталогу",
      ledeHtml: "Нові заявки потрапляють сюди зі статусом «на розгляді» й не показуються на сайті. Кнопки нижче одразу зберігають зміни в GitHub — редагувати файл вручну більше не потрібно.",
      passwordLabel: "Пароль адміністратора",
      passwordSave: "Зберегти",
      passwordSaved: "Збережено",
      passwordRequired: "Спочатку введіть і збережіть пароль адміністратора вгорі сторінки.",
      wrongPassword: "Невірний пароль. Введіть правильний і спробуйте ще раз.",
      actionFailed: "Не вдалося виконати дію. Спробуйте ще раз або відредагуйте на GitHub вручну.",
      confirmAction: "Ви впевнені? Цю дію не можна скасувати.",
      approve: "✅ Затвердити",
      reject: "🗑️ Відхилити",
      deactivate: "🚫 Деактивувати",
      reactivate: "♻️ Активувати",
      delete: "🗑️ Видалити",
      pendingTitle: "На розгляді",
      approvedTitle: "Опубліковано на сайті",
      otherTitle: "Інше (не опубліковано, не на розгляді)",
      empty: "Порожньо.",
      loadError: "Не вдалося завантажити дані каталогу.",
      editOnGithub: "Редагувати на GitHub →",
      sourceIssue: "Джерело: issue",
      statusPending: "на розгляді",
      statusApproved: "опубліковано",
      example: "приклад"
    },
    media: {
      titleFallback: "Медіа | Каталог медіаспільнот ПроМедіа",
      titleSuffix: "Каталог медіаспільнот ПроМедіа",
      backToCatalog: "← До каталогу",
      loading: "Завантаження…",
      loadError: "Не вдалося завантажити дані.",
      notFound: "Медіа не знайдено або ще не опубліковано."
    },
    research: {
      eyebrow: "Дослідження ПроМедіа",
      title: "Стан моделей членства в українських медіа",
      fallbackText: "Не завантажується?",
      fallbackLink: "Відкрити в новій вкладці"
    }
  },
  en: {
    nav: {
      promedia: "← ProMedia",
      addCommunity: "+ Add a community",
      aboutCommunities: "What is a media community"
    },
    meta: {
      title: "Map of Ukrainian Media Communities | ProMedia",
      desc: "Catalog and map of Ukrainian media communities: outlet websites, short descriptions, the community's key idea, and where to subscribe."
    },
    hero: {
      eyebrow: "Catalog and map of media communities",
      title: "Media Communities of Ukraine",
      ledeHtml: "We've gathered outlets that rely on reader support and keep their content freely accessible. They don't lock articles behind a paywall — instead, they raise money from like-minded supporters to pursue a shared goal (membership). Read more in the “<a href=\"#about-communities\">What is a media community</a>” section.",
      stat: "{total} media communities in the catalog"
    },
    explainer: {
      eyebrow: "Guide",
      title: "What is a media community?",
      q1: {
        q: "What is a media community?",
        aHtml: "Media communities are also called “reader clubs,” “friends of the media,” “membership models,” and similar names. According to a 2020 definition by The Membership Puzzle Project, it's a social contract between a news organization and members of its community, where members contribute their time, money, energy, expertise, and connections to support a cause they believe in. In return, the news organization offers transparency and opportunities to make a meaningful contribution to the organization's stability and impact. Source: <a href=\"https://membershippuzzle.org/\" target=\"_blank\" rel=\"noopener\">membershippuzzle.org</a>. Today, Ukraine has several dozen media communities — up from just 11 in 2021. Read more in this <a href=\"research/\">Membership Puzzle Project research</a>"
      },
      q2: {
        q: "How is a media community different from a subscription?",
        aHtml: "A media subscription is a purely business, transactional deal — you pay journalists money and get your newspaper, magazine, or access to articles and videos on the website. In a community, you pay journalists money because you want to support the media outlet for a shared cause. You like what the newsroom does, the views it holds, you find its work valuable, or it meets your emotional or existential needs."
      },
      q3: {
        q: "How do I build my own community?",
        aHtml: "The NGO “ProMedia” helps media outlets build and grow reader communities. We also run webinars and offline training commissioned by the international Institute for War and Peace Reporting. In 2026 we contributed to a community-building handbook — you can find the PDF version here: <a href=\"https://iwpr.net/global-voices/print-publications/how-bring-order-chaos\" target=\"_blank\" rel=\"noopener\">iwpr.net</a>"
      },
      q4: {
        q: "Why aren't Ukrainska Pravda, NV, Liga, or Forbes on the map?",
        aHtml: "Because these outlets offer a subscription, not a community. For them, it's about paid access to core content. Building a community around a media outlet doesn't mean charging for access to its key materials — there can be extra bonus content for community members, but the core idea of a community is that fans support the outlet's work to help grow its impact."
      },
      q5: {
        q: "What do the “recommended,” “white list,” and “certified” badges mean?",
        aHtml: "Cards can show badges that confirm an outlet's credibility:<br>🗺️ <strong>Recommended media</strong> — listed on the Recommended Media Map run by Detector Media and the Institute of Mass Information (IMI): <a href=\"https://map.detector.media/\" target=\"_blank\" rel=\"noopener\">map.detector.media</a><br>✅ <strong>White list</strong> — included in IMI's white list of media with high quality standards: <a href=\"https://imi.org.ua/doslidzhennya-standartiv\" target=\"_blank\" rel=\"noopener\">imi.org.ua</a><br>🛡️ <strong>JTI-certified</strong> — certified under the Journalism Trust Initiative standard, confirming transparency and ethical editorial processes: <a href=\"https://journalismtrustinitiative.org/\" target=\"_blank\" rel=\"noopener\">journalismtrustinitiative.org</a>"
      }
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
      recommended: "This media is on the Recommended Media Map",
      whitelist: "This media is on the White List",
      jti: "Journalism Trust Initiative certified"
    },
    tags: {
      investigative: "Investigative media",
      warJournalism: "War journalism",
      culture: "Culture media",
      science: "Science media"
    },
    legend: {
      recommended: "this media is on the Recommended Media Map",
      whitelist: "this media is on the White List",
      jti: "Journalism Trust Initiative certificate"
    },
    addSection: {
      title: "Didn't find your media?",
      text: "Add your media community to the catalog — submissions go through pre-moderation before publishing."
    },
    footer: {
      initiative: "Initiative",
      wordmarkAlt: "NGO “ProMedia”",
      mapCreditHtml: "Oblast outline map: adapted from <a href=\"https://mapsvg.com/maps/ukraine\" target=\"_blank\" rel=\"noopener\">MapSVG</a> (<a href=\"https://creativecommons.org/licenses/by/4.0/\" target=\"_blank\" rel=\"noopener\">CC BY 4.0</a>). Catalog entries go through pre-moderation.",
      reportErrorHtml: "Found a mistake? Email us at <a href=\"mailto:info@promedia.report\">info@promedia.report</a>"
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
    },
    addForm: {
      eyebrow: "Add a community",
      title: "Add your media community",
      lede: "Fill out the form below and submit — submissions go through pre-moderation, usually published within 1-2 business days.",
      backToMap: "← Back to the map",
      name: { label: "Media name", placeholder: "E.g.: Suspilne News" },
      website: { label: "Media website", placeholder: "https://example.com" },
      logo: {
        label: "Media logo (optional)",
        hint: "PNG, JPG, SVG, or WebP, up to 2 MB. If you skip this, we'll try to pull the site's icon automatically.",
        tooLarge: "File is too large — 2 MB maximum.",
        invalidType: "Unsupported file format — use PNG, JPG, SVG, or WebP."
      },
      communityUrl: { label: "Community link (where to subscribe)", hint: "The link people use to send money and join the community", placeholder: "https://t.me/example" },
      description: { label: "Short description of the media and its community's key idea", hint: "What this outlet is and why it's worth joining its community." },
      city: { label: "City", placeholder: "Lviv" },
      region: { label: "Oblast", placeholder: "Choose an oblast", hint: "Media on the map is linked to an oblast (schematic outline map, no exact coordinates)." },
      badgesLabel: "Badges (if applicable)",
      badgeRecommended: "On the map of recommended media",
      badgeWhitelist: "On the media whitelist",
      badgeJti: "Holds the international JTI mark (Journalism Trust Initiative)",
      tagsLabel: "Tags (optional)",
      tagInvestigative: "Investigative media",
      tagWarJournalism: "War journalism",
      tagCulture: "Culture media",
      tagScience: "Science media",
      contact: { label: "Applicant contact (email or phone)", hint: "So we can reach you if we have questions about the submission." },
      submit: "Submit application",
      submitting: "Submitting…",
      success: "Thank you! Your submission has been sent and is awaiting moderator review.",
      submitError: "Couldn't submit the form. Please try again or email info@promedia.report.",
      note: "Submissions go through pre-moderation — usually published within 1-2 business days.",
      requiredError: "Please fill in all required fields."
    },
    admin: {
      eyebrow: "ProMedia team only",
      title: "Catalog admin panel",
      ledeHtml: "New submissions land here with “pending” status and don't show on the site. The buttons below save changes to GitHub instantly — no more manual file editing.",
      passwordLabel: "Admin password",
      passwordSave: "Save",
      passwordSaved: "Saved",
      passwordRequired: "First enter and save the admin password at the top of the page.",
      wrongPassword: "Wrong password. Enter the correct one and try again.",
      actionFailed: "Couldn't complete the action. Try again or edit on GitHub manually.",
      confirmAction: "Are you sure? This action can't be undone.",
      approve: "✅ Approve",
      reject: "🗑️ Reject",
      deactivate: "🚫 Deactivate",
      reactivate: "♻️ Reactivate",
      delete: "🗑️ Delete",
      pendingTitle: "Pending review",
      approvedTitle: "Published on the site",
      otherTitle: "Other (not published, not pending)",
      empty: "Empty.",
      loadError: "Failed to load catalog data.",
      editOnGithub: "Edit on GitHub →",
      sourceIssue: "Source: issue",
      statusPending: "pending",
      statusApproved: "published",
      example: "example"
    },
    media: {
      titleFallback: "Media | ProMedia Media Communities Catalog",
      titleSuffix: "ProMedia Media Communities Catalog",
      backToCatalog: "← Back to catalog",
      loading: "Loading…",
      loadError: "Failed to load data.",
      notFound: "Media not found or not yet published."
    },
    research: {
      eyebrow: "ProMedia research",
      title: "The state of membership models in Ukrainian media",
      fallbackText: "Not loading?",
      fallbackLink: "Open in a new tab"
    }
  }
};

const OBLAST_SLUGS = [
  "cherkasy", "chernihiv", "chernivtsi", "crimea", "dnipropetrovsk",
  "donetsk", "ivano-frankivsk", "kharkiv", "kherson", "khmelnytskyi",
  "kirovohrad", "kyiv", "kyiv-city", "luhansk", "lviv", "mykolaiv",
  "odessa", "poltava", "rivne", "sumy", "ternopil", "vinnytsia",
  "volyn", "zakarpattia", "zaporizhia", "zhytomyr"
];

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function deepMerge(target, source) {
  if (!isPlainObject(source)) return target;
  Object.keys(source).forEach((key) => {
    if (isPlainObject(source[key]) && isPlainObject(target[key])) {
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  });
  return target;
}

function applySiteContent(content) {
  window.PM_SITE_CONTENT = content || {};
  if (content && isPlainObject(content.i18n)) {
    deepMerge(I18N, content.i18n);
  }
}

function loadJson(url) {
  if (typeof window.fetch === "function") {
    return window.fetch(url, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("site content unavailable");
        return response.json();
      });
  }

  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url + "?v=" + Date.now(), true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new Error("site content unavailable"));
      }
    };
    xhr.onerror = function () { reject(new Error("site content unavailable")); };
    xhr.send();
  });
}

function loadSiteContent() {
  return loadJson("content/site.json")
    .then((content) => {
      applySiteContent(content);
      return content;
    })
    .catch(() => {
      applySiteContent({});
      return window.PM_SITE_CONTENT;
    });
}

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

window.siteContentReady = loadSiteContent().then(() => {
  document.documentElement.lang = getLang();
  applyStaticI18n();
  initLangToggle();
  return window.PM_SITE_CONTENT;
});
