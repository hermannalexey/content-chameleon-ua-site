# Лендінг гайда «Знов ці алгоритми» — як підключити збір пошт

Сторінка: `algorytmy/index.html` → **https://www.content-chameleon.com/algorytmy/**
Тестова копія: https://hermannalexey.github.io/content-chameleon-ua-site/algorytmy/

На сторінку не веде жодне посилання з сайту, її немає в sitemap, і вона закрита від Google (`noindex`) навіть у продакшні.

## 1. Google Таблиця (5 хвилин, один раз)

1. Створіть нову Google Таблицю, наприклад «Ліди — гайд алгоритми LinkedIn».
2. **Розширення → Apps Script.** Видаліть усе в `Code.gs` і вставте вміст файла `Code.gs` з цієї папки. Збережіть (💾).
3. Зверху виберіть функцію `testSetup` → **▶ Run** → дайте дозволи (Google попередить «неперевірений застосунок»: Advanced → Go to … → Allow). Вам прийде тестовий лист, а в таблиці з'явиться вкладка «Ліди».
4. **Deploy → New deployment** → ⚙ **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
   → Deploy → скопіюйте **Web app URL** (закінчується на `/exec`).
5. Вставте цей URL у `algorytmy/index.html` у рядок `endpoint: ''`.

Якщо потім змінюєте код скрипта: **Deploy → Manage deployments → ✏ → Version: New version**, інакше працюватиме стара версія. URL при цьому не змінюється.

## 2. Гайд (коли дизайнер віддасть PDF)

Покладіть PDF у папку `algorytmy/` з назвою `znov-ci-algorytmy-linkedin-2026-11.pdf`.
Якщо хочете тримати PDF на Google Drive замість сайту — вставте посилання і в `window.GUIDE.pdf` на сторінці, і в `GUIDE_URL` у скрипті.

## 3. Посилання для соцмереж

Додавайте мітку джерела, тоді в таблиці буде видно, звідки людина:

- TikTok: `https://www.content-chameleon.com/algorytmy/?utm_source=tiktok`
- Instagram: `https://www.content-chameleon.com/algorytmy/?utm_source=instagram`
- YouTube: `https://www.content-chameleon.com/algorytmy/?utm_source=youtube`

За бажанням: `&utm_campaign=назва-ролика`. Без мітки скрипт спробує вгадати джерело з referrer.

## 4. Розсилка, аутріч, CRM

- Таблиця → **Файл → Завантажити → CSV** → імпорт у будь-яку CRM чи сервіс розсилок.
- Колонка «Статус у CRM» — для ручних позначок, що вже перенесено.
- Автоматично: Zapier / Make / n8n, тригер «New row in Google Sheets» → ваша CRM.

## Ліміти

Листи йдуть з вашого Google-акаунта: до 1500 на день у Google Workspace, до 100 на день у звичайному Gmail. Пошти в таблицю пишуться завжди, навіть якщо ліміт листів вичерпано (колонка «Лист надіслано» покаже помилку).
