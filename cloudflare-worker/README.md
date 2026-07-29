# Cloudflare Worker: submit-community

Обслуговує два сценарії для `communities.promedia.report`:

1. **Заявки з `/add`** — сам дописує запис (зі `"status": "pending"`) у
   `data/communities.json` через GitHub API, опційно завантажує лого в
   `img/logos/`. Відвідувач сайту не бачить GitHub і не потребує акаунту.
2. **Модерація з `/admin`** — кнопки "Затвердити"/"Відхилити"/"Деактивувати"
   пишуть напряму в GitHub після перевірки пароля (`env.ADMIN_PASSWORD`),
   без ручного редагування файлу.

Секретний GitHub-токен і пароль адміна живуть тільки в цьому Worker'і.

Домен `promedia.report` не є зоною в Cloudflare (DNS для GitHub Pages
налаштований напряму в реєстратора), тож Worker підключений не через Route
на тій самій зоні, а напряму за його `workers.dev`-адресою — з CORS-заголовками,
які дозволяють запити з `communities.promedia.report`.

## Деплой (один раз)

### 1. Створіть GitHub Personal Access Token

1. Зайдіть на **[github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new)** (Fine-grained token).
2. **Repository access** → **Only select repositories** → оберіть `promedia-communities`.
3. **Permissions** → **Repository permissions** → **Contents** → **Read and write**. Більше нічого не давайте.
4. Створіть токен, скопіюйте значення (показується один раз).

### 2. Створіть Worker у Cloudflare

1. Зайдіть у Cloudflare Dashboard → **Workers & Pages** → **Create** → **Create Worker**.
2. Назвіть його, наприклад, `promedia-submit-community`.
3. Відкрийте редактор коду Worker'а й вставте вміст файлу
   [`submit-community.js`](submit-community.js) з цього репозиторію
   (повністю замініть заглушку).
4. **Deploy**.

### 3. Додайте секрети

1. У Worker'і → **Settings → Variables and Secrets** → **Add** →
   тип **Secret**, ім'я `GITHUB_TOKEN`, значення — токен з кроку 1.
2. Ще раз **Add** → тип **Secret**, ім'я `ADMIN_PASSWORD`, значення —
   будь-який пароль на ваш вибір (це те, що ви вводитимете на `/admin`,
   щоб натискати "Затвердити"/"Відхилити"/"Деактивувати").
3. Збережіть (Deploy).

### 4. Адреса Worker'а

Нічого підключати додатково не треба — сайт звертається напряму на
дефолтну адресу Worker'а (`https://promedia-submit-community.<ваш-субдомен>.workers.dev`),
яка вже прописана в `js/add-form.js` (`SUBMIT_URL`). Якщо перестворите
Worker з іншою назвою чи субдоменом акаунту — оновіть цей рядок.

CORS обмежено конкретним origin (`ALLOWED_ORIGIN` у `submit-community.js`,
зараз `https://communities.promedia.report`) — якщо колись переїдете на
інший домен, поміняйте це значення й у Worker'і, і в `js/add-form.js`.

## Перевірка

Після деплою відкрийте `communities.promedia.report/add`, заповніть форму
тестовими даними й надішліть. Якщо все підключено правильно — у
`data/communities.json` (і на `/admin`) з'явиться новий запис зі статусом
`pending` протягом кількох секунд, без жодного переходу на GitHub.
