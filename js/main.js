/* Content Chameleon — shared JS */

const NAV = (b) => `
<nav class="site-nav">
  <div class="nav-inner">
    <a href="${b}index.html" class="nav-logo"><span class="at">@</span>content chameleon</a>
    <div class="nav-links" id="navLinks">
      <a href="${b}systems/index.html">Офери</a>
      <a href="${b}conferences/index.html">Конференції</a>
      <a href="${b}pricing.html">Ціни</a>
      <a href="${b}about.html">Про нас</a>
      <a href="${b}contact.html" class="nav-cta">Забронювати зустріч</a>
    </div>
    <button class="nav-burger" id="navBurger" aria-label="Меню" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>`;

const FOOTER = (b) => `
<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-grid">
      <div>
        <div class="footer-logo"><span class="at">@</span>content chameleon</div>
        <p class="footer-tagline">LinkedIn-присутність і пайплайн з конференцій для B2B компаній, які виходять на західні ринки.</p>
      </div>
      <div>
        <div class="footer-col-heading">Сайт</div>
        <div class="footer-col-links">
          <a href="${b}systems/index.html">Офери</a>
          <a href="${b}conferences/index.html">Конференції</a>
          <a href="${b}pricing.html">Ціни</a>
          <a href="${b}about.html">Про нас</a>
          <a href="${b}compare.html">Порівняння</a>
          <a href="${b}faq.html">Питання й відповіді</a>
        </div>
      </div>
      <div>
        <div class="footer-col-heading">Контакти</div>
        <div class="footer-col-links">
          <a href="${b}contact.html">Забронювати зустріч з Алексом →</a>
          <a href="mailto:alex@content-chameleon.com">alex@content-chameleon.com</a>
          <a href="#" target="_blank" rel="noopener">LinkedIn (Алекс)</a>
          <a href="#" target="_blank" rel="noopener">LinkedIn (сторінка компанії)</a>
        </div>
      </div>
    </div>
    <div class="footer-bar">
      <span>© 2026 Content Chameleon</span>
      <div class="footer-legal">
        <a href="#">Політика конфіденційності</a>
        <a href="#">Умови використання</a>
      </div>
    </div>
  </div>
</footer>`;

document.addEventListener('DOMContentLoaded', () => {
  const b = window.BASE_PATH || '';

  const headerEl = document.getElementById('site-header');
  if (headerEl) headerEl.innerHTML = NAV(b);

  const footerEl = document.getElementById('site-footer');
  if (footerEl) footerEl.innerHTML = FOOTER(b);

  // Active nav state
  (function () {
    const path = window.location.pathname;
    document.querySelectorAll('.nav-links a:not(.nav-cta)').forEach(a => {
      const href = a.getAttribute('href');
      if (!href) return;
      // Strip any leading ../ to get the bare relative path
      const bare = href.replace(/^(\.\.\/)+/, '');
      const parts = bare.split('/');
      let active = false;
      if (parts.length >= 2) {
        // Subdirectory link (e.g. "systems/outreach.html", "case-studies/index.html")
        // Match only by the directory segment — never by filename — to avoid
        // two index.html links both matching at the same time.
        active = path.includes('/' + parts[0] + '/');
      } else {
        // Root-level link (e.g. "pricing.html", "about.html")
        const file = parts[0];
        if (file === 'index.html') {
          active = path === '/' || path === '/index.html';
        } else {
          active = path.endsWith('/' + file);
        }
      }
      if (active) a.classList.add('active');
    });
  })();

  // Mobile nav toggle
  document.addEventListener('click', (e) => {
    const burger = e.target.closest('#navBurger');
    if (burger) {
      const links = document.getElementById('navLinks');
      const open = links.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open);
    } else if (!e.target.closest('.site-nav')) {
      const links = document.getElementById('navLinks');
      const burger = document.getElementById('navBurger');
      if (links) links.classList.remove('open');
      if (burger) { burger.classList.remove('open'); burger.setAttribute('aria-expanded', false); }
    }
  });

  // Close mobile nav on link click
  document.addEventListener('click', (e) => {
    if (e.target.closest('#navLinks a')) {
      const links = document.getElementById('navLinks');
      const burger = document.getElementById('navBurger');
      if (links) links.classList.remove('open');
      if (burger) { burger.classList.remove('open'); burger.setAttribute('aria-expanded', false); }
    }
  });
});
