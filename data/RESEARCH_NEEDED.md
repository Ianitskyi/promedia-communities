# Дослідження: чого бракує в каталозі медіаспільнот

Автоматично згенеровано з `data/communities.json`.

## Опис — заповнено з власних сайтів медіа

Короткі описи (1-2 речення) знайдено через пошук — переважно зі сторінок
«Про нас» на сайтах самих медіа, для кількох — з надійних вторинних джерел
(Вікіпедія, медіа про медіа на кшталт mediamaker.me, detector.media).

⚠️ **Потребують ручної звірки з оригіналом**: «Перший Криворізький» (опис
спирається на вторинні джерела — Facebook, немає прямої сторінки «Про нас»
на сайті).

Усі описи (та наявні `communityIdea`) перекладено англійською (`descriptionEn`
/ `communityIdeaEn`) — переклад робив асистент, без окремої звірки носієм
мови.

## Позначки (recommended / whitelist / JTI) — перевірено

Перевірено пошуком (мапа рекомендованих медіа detector.media+IMI, білий список ІМІ,
сертифікація JTI). Прямий доступ до самих реєстрів заблокований мережею цього
середовища (403), тож перевірка велась через непрямі підтвердження (новини/статті)
— "не знайдено" не є стовідсотковою гарантією відсутності.

⚠️ **Потребують ручної перевірки** (джерело — агреговане summary пошуку, не пряме
цитування статті): «Перший Криворізький», «Цукр» — позначка `recommended`.

⚠️ **«Четверта влада» (Рівне)**: не вдалося підтвердити чи спростувати
присутність на Мапі рекомендованих медіа detector.media+IMI (усі позначки
поставлено `false` як консервативний варіант). Знайдено лише згадку про інший,
окремий реєстр — «Мапа перевірених джерел» Internews/МКІП
(filter.mkip.gov.ua) — це НЕ те саме, що мапа рекомендованих медіа, тому не
зараховано як `recommended`.

⚠️ **The Kyiv Independent**: не знайдено підтвердження присутності на жодному
з трьох реєстрів (усі позначки `false`). Ймовірна причина — це англомовне
видання для міжнародної аудиторії, а всі три реєстри (мапа рекомендованих
медіа, білий список ІМІ, JTI-сертифікація в Україні) фокусуються переважно на
українськомовних/регіональних медіа — можливо, видання просто не подавалося
на розгляд.

## Ідея спільноти й теги — частково заповнено

`communityIdea` (чому варто підписатися) ще не досліджено для більшості
записів — окрема задача на майбутнє. `tags` — проставлено вручну для кількох
очевидних випадків (розслідувальне: 18000, Слідство, BIHUS, NGL.media, «Сила
правди»; воєнне: Frontliner, The Kyiv Independent; культурне: Neformat,
Ukrainer, Читомо; наукове: Наука UA, Куншт); решта видань ще не перевірена.

| # | Медіа | Місто/область | Сайт | Опис | Ідея спільноти | Позначки | Теги |
|---|---|---|---|---|---|---|---|
| 1 | [МикВісті](https://nikvesti.com/) | Миколаїв | https://nikvesti.com/ | ✅ | ❌ | рек., JTI | ❌ |
| 2 | [Громадське радіо](https://hromadske.radio/) | Київ | https://hromadske.radio/ | ✅ | ❌ | рек., білий список, JTI | ❌ |
| 3 | [Бахмут.in.ua](https://bahmut.in.ua/) | Дніпропетровська область | https://bahmut.in.ua/ | ✅ | ❌ | — | ❌ |
| 4 | [Східний Варіант](https://v-variant.com.ua/) | Донецька область | https://v-variant.com.ua/ | ✅ | ❌ | рек. | ❌ |
| 5 | [Доступ Медіа](https://dostyp.com.ua/) | Кропивницький | https://dostyp.com.ua/ | ✅ | ❌ | рек. | ❌ |
| 6 | [ЛЮК](https://lyuk.media/) | Харків | https://lyuk.media/ | ✅ | ❌ | рек. | ❌ |
| 7 | [МОСТ](https://most.ks.ua/) | Херсон | https://most.ks.ua/ | ✅ | ❌ | рек. | ❌ |
| 8 | [18000](https://18000.com.ua/) | Черкаси | https://18000.com.ua/ | ✅ | ❌ | рек. | розсл. |
| 9 | [Махала](https://mahala.com.ua/) | Одеса | https://mahala.com.ua/ | ✅ | ❌ | рек. | ❌ |
| 10 | [Полтавська хвиля](https://poltavawave.com.ua/) | Полтава | https://poltavawave.com.ua/ | ✅ | ❌ | рек. | ❌ |
| 11 | [Gwara Media](https://gwaramedia.com/) | Харків | https://gwaramedia.com/ | ✅ | ❌ | рек., JTI | ❌ |
| 12 | [Медіаплатформа "Вгору"](https://vgoru.org/) | Херсон | https://vgoru.org/ | ✅ | ❌ | рек. | ❌ |
| 13 | [Гречка](https://gre4ka.info/) | Кропивницький | https://gre4ka.info/ | ✅ | ❌ | — | ❌ |
| 14 | [Гард.City](https://thegard.city/) | Миколаїв | https://thegard.city/ | ✅ | ❌ | рек. | ❌ |
| 15 | [Накипіло](https://nakypilo.ua/) | Харків | https://nakypilo.ua/ | ✅ | ❌ | рек. | ❌ |
| 16 | ["Район.in.ua" та всі інші райони](https://rayon.in.ua/) | Волинська область | https://rayon.in.ua/ | ✅ | ❌ | рек. | ❌ |
| 17 | [Frontliner](https://www.frontliner.com.ua/) | Київ | https://www.frontliner.com.ua/ | ✅ | ❌ | білий список | воєнна |
| 18 | [Вільне радіо](https://freeradio.com.ua/) | Донецька область | https://freeradio.com.ua/ | ✅ | ❌ | рек. | ❌ |
| 19 | [Трибун](https://tribun.com.ua/) | Луганська область | https://tribun.com.ua/ | ✅ | ❌ | рек. | ❌ |
| 20 | [О6262](https://www.6262.com.ua/) | Донецька область | https://www.6262.com.ua/ | ✅ | ❌ | рек., JTI | ❌ |
| 21 | [Слобідський край](https://www.slk.kh.ua/) | Харків | https://www.slk.kh.ua/ | ✅ | ❌ | рек., JTI | ❌ |
| 22 | [Жовті Води.City](https://zhovtivody.city/) | Дніпро | https://zhovtivody.city/ | ✅ | ❌ | — | ❌ |
| 23 | [Перший Криворізький](https://1kr.ua/ua) | Дніпро | https://1kr.ua/ua | ✅⚠️ | ❌ | рек.⚠️, JTI | ❌ |
| 24 | [Цукр](https://cukr.city/) | Суми | https://cukr.city/ | ✅ | ❌ | рек.⚠️ | ❌ |
| 25 | [Сєвєродонецьк онлайн](https://sd.ua/) | Луганська область | https://sd.ua/ | ✅ | ❌ | рек. | ❌ |
| 26 | [Рубрика](https://rubryka.com/) | Київ | https://rubryka.com/ | ✅ | ❌ | білий список | ❌ |
| 27 | [Varosh](https://varosh.com.ua/) | Закарпатська область | https://varosh.com.ua/ | ✅ | ❌ | рек. | ❌ |
| 28 | [Neformat](https://www.neformat.com.ua/) | Київ | https://www.neformat.com.ua/ | ✅ | ❌ | — | культ. |
| 29 | [Точка Сходу](https://cxid.media/) | Луганська область | https://cxid.media/ | ✅ | ❌ | рек. | ❌ |
| 30 | [Kordon.Media](https://kordon.media/) | Суми | https://kordon.media/ | ✅ | ❌ | рек. | ❌ |
| 31 | [Обрії Ізюмщини](https://obrii.com.ua/) | Харківська область | https://obrii.com.ua/ | ✅ | ❌ | — | ❌ |
| 32 | [МедіаПорт](https://mediaport.ua/) | Харківська область | https://mediaport.ua/ | ✅ | ❌ | — | ❌ |
| 33 | [Радіо «Накипіло»](https://radio.nakypilo.ua/) | Харківська область | https://radio.nakypilo.ua/ | ✅ | ❌ | — | ❌ |
| 34 | [Dnipro.media](https://www.dnipro.media/) | Дніпро | https://www.dnipro.media/ | ✅ | ❌ | рек. | ❌ |
| 35 | [Місто і річка](https://mistorichka.media/) | Дніпро | https://mistorichka.media/ | ✅ | ❌ | — | ❌ |
| 36 | [Kramatorsk Post](https://www.kramatorskpost.com/) | Донецька область | https://www.kramatorskpost.com/ | ✅ | ❌ | — | ❌ |
| 37 | [PECHERA.info](https://pechera.info/) | Чернігівська область | https://pechera.info/ | ✅ | ❌ | — | ❌ |
| 38 | [Центр журналістських розслідувань "Сила правди"](https://sylapravdy.com/contact/) | Волинська область | https://sylapravdy.com/contact/ | ✅ | ❌ | рек. | розсл. |
| 39 | [NGL.media](https://ngl.media/) | Львів | https://ngl.media/ | ✅ | ❌ | — | розсл. |
| 40 | [BIHUS](https://bihus.info/) | Київ | https://bihus.info/ | ✅ | ❌ | — | розсл. |
| 41 | [Слідство](https://www.slidstvo.info/) | Київ | https://www.slidstvo.info/ | ✅ | ❌ | — | розсл. |
| 42 | [Наука UA](https://nauka.ua/) | Львів | https://nauka.ua/ | ✅ | ❌ | — | наук. |
| 43 | [Ukrainer](https://www.ukrainer.net/) | Київ | https://www.ukrainer.net/ | ✅ | ❌ | — | культ. |
| 44 | [Читомо](https://chytomo.com/) | Київ | https://chytomo.com/ | ✅ | ❌ | — | культ. |
| 45 | [Грунт](https://grnt.media/) | Київ | https://grnt.media/ | ✅ | ❌ | — | ❌ |
| 46 | [Куншт](https://www.kunsht.com.ua/) | Київ | https://www.kunsht.com.ua/ | ✅ | ❌ | — | наук. |
| 47 | [Медіа «VUZOL»](https://www.instagram.com/vuzol.media/) | Київ | instagram.com/vuzol.media | ✅ | ✅ | — | культура |
| 48 | [Четверта влада](https://4vlada.com/) | Рівне | https://4vlada.com/ | ✅ | ✅ | —⚠️ | розсл. |
| 49 | [The Kyiv Independent](https://kyivindependent.com/) | Київ | https://kyivindependent.com/ | ✅ | ✅ | ❌⚠️ | воєнна |
