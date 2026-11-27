# Лендінг гайда «Знов ці алгоритми» — як підключити збір пошт

Сторінка: `algorytmy/index.html` → **https://www.content-chameleon.com/algorytmy/**
Тестова копія: https://hermannalexey.github.io/content-chameleon-ua-site/algorytmy/

На сторінку не веде жодне посилання з сайту, її немає в sitemap, і вона закрита від Google (`noindex`) навіть у продакшні.

## 1. Google Таблиця і скрипт (вже налаштовано 27.11.2026)

- Таблиця: [Ліди — гайд «Знов ці алгоритми» (листопад 2026)](https://docs.google.com/spreadsheets/d/1WswMXhNskF8mfC_9ntD-IWHzTgp1fQLTnbilo1IeFR8/edit), вкладка «Ліди».
- Скрипт: окремий проєкт Apps Script [«Ліди — гайд Знов ці алгоритми (форма сайту)»](https://script.google.com/home/projects/1IhRxnCI_fGvXnruWuz6CnerPVPEZzqbz_7p03V4SB-RxZgRp4lCe3Y1Z/edit). Код = `Code.gs` з цієї папки.
- Опублікований як Web app (Execute as: Me, Who has access: Anyone). Його `/exec`-адреса стоїть у `window.GUIDE.endpoint` на сторінці.

Якщо змінюєте код скрипта: вставте новий код у проєкт, потім **Deploy → Manage deployments → ✏ → Version: New version → Deploy**, інакше працюватиме стара версія. Адреса `/exec` при цьому не змінюється.

Для нового гайда: скопіюйте сторінку і скрипт, поміняйте `GUIDE_URL`, `SHEET_ID` (або той самий, з іншою вкладкою `SHEET_NAME`) і зробіть новий deployment.

## 2. Гайд (коли дизайнер віддасть PDF)

PDF лежить у `algorytmy/znov-ci-algorytmy-linkedin-2026-11.pdf`. Новий варіант від дизайнера просто покладіть замість нього з тією ж назвою.
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
