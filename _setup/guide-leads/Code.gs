/**
 * Content Chameleon — збір пошт з лендінгу гайда (content-chameleon.com/algorytmy/)
 *
 * Вставляється в Google Таблицю: Розширення → Apps Script. Інструкція: README.md поруч.
 * Що робить: кожна заявка = новий рядок у вкладці «Ліди» + лист людині з посиланням на гайд.
 */

// ===== НАЛАШТУВАННЯ =====
// Посилання на PDF гайда. Те саме, що в window.GUIDE.pdf на сторінці, але ПОВНЕ (з https://).
var GUIDE_URL = 'https://www.content-chameleon.com/algorytmy/znov-ci-algorytmy-linkedin-2026-11.pdf';
var SENDER_NAME = 'Content Chameleon';
var REPLY_TO = ''; // напр. адреса, на яку мають приходити відповіді; порожньо = ваша пошта
var SHEET_NAME = 'Ліди';
// =========================

var HEADERS = ['Дата', 'Email', "Ім'я", 'Джерело (utm_source)', 'utm_medium', 'utm_campaign', 'utm_content',
               'Referrer', 'Гайд', 'Повторно?', 'Лист надіслано', 'Статус у CRM'];

function doPost(e) {
  var p = (e && e.parameter) || {};
  var email = String(p.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return out('bad email');

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = getSheet();
    var existing = sheet.getLastRow() > 1
      ? sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getValues().map(function (r) { return String(r[0]).toLowerCase(); })
      : [];
    var repeat = existing.indexOf(email) !== -1;

    var mailed = 'ні';
    if (!repeat) {
      try { sendGuide(email, clean(p.name)); mailed = 'так'; }
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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
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

// Запустіть один раз вручну (кнопка ▶ Run), щоб дати дозволи і отримати тестовий лист на свою пошту
function testSetup() {
  getSheet();
  sendGuide(Session.getActiveUser().getEmail(), 'Тест');
}
