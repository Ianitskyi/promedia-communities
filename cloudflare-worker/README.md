# Cloudflare Worker: submit-community

Приймає заявки з `communities.promedia.report/add` і сам дописує запис у
`data/communities.json` (зі `"status": "pending"`) через GitHub API.
Відвідувач сайту не бачить GitHub і не потребує акаунту — секретний
GitHub-токен живе тільки в цьому Worker'і.

Ви вже маєте акаунт Cloudflare (там налаштований DNS для promedia.report) —
новий акаунт не потрібен.

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

### 3. Додайте секрет

1. У Worker'і → **Settings → Variables and Secrets** → **Add** →
   тип **Secret**, ім'я `GITHUB_TOKEN`, значення — токен з кроку 1.
2. Збережіть (Deploy).

### 4. Підключіть до `communities.promedia.report/api/submit-community`

Найпростіше — через **Route**, щоб не морочитися з CORS (Worker працює на
тому самому домені, що й сайт):

1. Worker → **Settings → Domains & Routes** → **Add** → **Route**.
2. Route: `communities.promedia.report/api/submit-community`
3. Zone: `promedia.report`.
4. Збережіть.

Якщо з якоїсь причини Route не спрацює, альтернатива — використати
дефолтний URL Worker'а (`https://promedia-submit-community.<ваш-субдомен>.workers.dev`)
і прописати його в `js/add-form.js` замість відносного шляху `/api/submit-community`
(тоді доведеться додати CORS-заголовки в Worker — напишіть мені, якщо
знадобиться такий варіант).

## Перевірка

Після деплою відкрийте `communities.promedia.report/add`, заповніть форму
тестовими даними й надішліть. Якщо все підключено правильно — у
`data/communities.json` (і на `/admin`) з'явиться новий запис зі статусом
`pending` протягом кількох секунд, без жодного переходу на GitHub.
