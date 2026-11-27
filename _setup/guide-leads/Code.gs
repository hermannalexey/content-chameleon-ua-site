// Content Chameleon — збір пошт з лендінгу гайда (content-chameleon.com/algorytmy/)
// Окремий проєкт Apps Script, пише в таблицю за SHEET_ID. Інструкція: _setup/guide-leads/README.md у репозиторії сайту.
// Що робить: кожна заявка = новий рядок у вкладці «Ліди» + лист людині з посиланням на гайд.

// ===== НАЛАШТУВАННЯ =====
// Посилання на PDF гайда. Те саме, що в window.GUIDE.pdf на сторінці, але ПОВНЕ (з https://).
var GUIDE_URL = 'https://www.content-chameleon.com/algorytmy/znov-ci-algorytmy-linkedin-2026-11.pdf';
var SENDER_NAME = 'Content Chameleon';
var REPLY_TO = ''; // напр. адреса, на яку мають приходити відповіді; порожньо = ваша пошта
var SHEET_NAME = 'Ліди';
// Таблиця «Ліди — гайд «Знов ці алгоритми» (листопад 2026)» у папці на Drive
var SHEET_ID = '1WswMXhNskF8mfC_9ntD-IWHzTgp1fQLTnbilo1IeFR8';
// Захист від спаму: скільки листів максимум за годину і за добу (решта заявок все одно пишеться в таблицю)
var MAX_MAILS_PER_HOUR = 30;
var MAX_MAILS_PER_DAY = 80;
var GUIDE_ID = 'algorytmy-2026-11'; // має збігатися з полем guide на сторінці
// =========================

var HEADERS = ['Дата', 'Email', "Ім'я", 'Джерело (utm_source)', 'utm_medium', 'utm_campaign', 'utm_content',
  'Referrer', 'Гайд', 'Повторно?', 'Лист надіслано', 'Статус у CRM'];

function doPost(e) {
  var p = (e && e.parameter) || {};
  var email = String(p.email || '').trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return out('bad email');
  // Бот: заповнив приховане поле або прийшов не з нашої форми. Відповідаємо «ok», щоб не підказувати.
  if (p.website || p.guide !== GUIDE_ID) return out('ok');

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = getSheet();
    var existing = sheet.getLastRow() > 1
      ? sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getValues().map(function (r) { return String(r[0]).toLowerCase(); })
      : [];
    var repeat = existing.indexOf(email) !== -1;

    var mailed = 'ні';
    if (!repeat && !underMailLimit()) {
      mailed = 'ні (ліміт спаму)';
    } else if (!repeat) {
      try { sendGuide(email, safeName(p.name)); mailed = 'так'; }
      catch (err) { mailed = 'помилка: ' + err.message; }
    } else {
      mailed = 'ні (повтор)';
    }

    sheet.appendRow([new Date(), email, clean(p.name), clean(p.utm_source) || sourceFromReferrer(p.referrer),
      clean(p.utm_medium), clean(p.utm_campaign), clean(p.utm_content), clean(p.referrer), clean(p.guide),
      repeat ? 'так' : '', mailed, '']);
  } finally {
    lock.releaseLock();
  }
  return out('ok');
}

// Ім'я потрапляє в лист. Дозволяємо тільки літери, пробіли, апостроф і дефіс; якщо є щось інше
// (посилання, HTML, цифри) — звертаємось без імені, щоб форму не можна було використати для розсилки чужого тексту.
function safeName(v) {
  var n = String(v || '').replace(/\s+/g, ' ').trim();
  return /^[\p{L}' ’ʼ-]{2,40}$/u.test(n) ? n : '';
}

// Лічильники листів за годину і за добу (ScriptProperties; викликається під LockService). true = ще можна надсилати.
function underMailLimit() {
  var props = PropertiesService.getScriptProperties();
  var now = new Date();
  var hour = Utilities.formatDate(now, 'UTC', 'yyyyMMddHH');
  var day = hour.slice(0, 8);
  var c = JSON.parse(props.getProperty('mailCount') || '{}');
  if (c.day !== day) c = { day: day, d: 0, hour: hour, h: 0 };
  if (c.hour !== hour) { c.hour = hour; c.h = 0; }
  if (c.h >= MAX_MAILS_PER_HOUR || c.d >= MAX_MAILS_PER_DAY) return false;
  c.h++; c.d++;
  props.setProperty('mailCount', JSON.stringify(c));
  return true;
}

function sendGuide(email, name) {
  var hi = name ? 'Привіт, ' + name + '!' : 'Привіт!';
  var html =
    '<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.6;color:#1a1a1a;max-width:560px">' +
    '<p>' + hi + '</p>' +
    '<p>Тримайте гайд «Знов ці алгоритми»: що змінилося в LinkedIn у листопаді 2026 і що з цим робити.</p>' +
    '<p><a href="' + GUIDE_URL + '" style="display:inline-block;background:#4F9D5F;color:#0E0F11;padding:12px 22px;' +
    'border-radius:3px;text-decoration:none;font-weight:bold">Відкрити гайд (PDF)</a></p>' +
    '<p>Попереджаємо ще раз: там матюки. Якщо вам менше 18 — зробіть собі чаю.</p>' +
    '<p>Якщо щось із гайда відгукнулося або хочете розібрати свій профіль, просто відповідайте на цей лист.</p>' +
    '<p>Алекс, Content Chameleon<br><a href="https://www.content-chameleon.com">content-chameleon.com</a></p>' +
    '</div>';
  var opts = { name: SENDER_NAME, htmlBody: html };
  if (REPLY_TO) opts.replyTo = REPLY_TO;
  MailApp.sendEmail(email, 'Ваш гайд: знов ці алгоритми LinkedIn (листопад 2026)',
    hi + '\n\nТримайте гайд «Знов ці алгоритми»: ' + GUIDE_URL + '\n\nАлекс, Content Chameleon', opts);
}

function getSheet() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

function sourceFromReferrer(ref) {
  ref = String(ref || '').toLowerCase();
  if (!ref) return 'direct';
  if (ref.indexOf('tiktok') !== -1) return 'tiktok';
  if (ref.indexOf('instagram') !== -1) return 'instagram';
  if (ref.indexOf('youtube') !== -1 || ref.indexOf('youtu.be') !== -1) return 'youtube';
  if (ref.indexOf('linkedin') !== -1 || ref.indexOf('lnkd.in') !== -1) return 'linkedin';
  if (ref.indexOf('facebook') !== -1) return 'facebook';
  return 'other';
}

// Блокує формули в клітинках (хтось може ввести "=..." замість імені)
function clean(v) {
  v = String(v || '').trim().slice(0, 300);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function out(s) {
  return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.TEXT);
}

// Запустіть один раз вручну (кнопка Run), щоб дати дозволи і отримати тестовий лист на свою пошту
function testSetup() {
  getSheet();
  sendGuide(Session.getActiveUser().getEmail(), 'Тест');
}
