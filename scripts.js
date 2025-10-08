// Auto-update footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Dark mode toggle
(function () {
  const key = 'dark-mode';
  const toggle = document.getElementById('darkModeToggle');
  const prefersDark = window.matchMedia &&
                      window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Initialize from saved preference or system setting
  const saved = localStorage.getItem(key);
  const shouldDark = saved === 'true' || (saved === null && prefersDark);
  if (shouldDark) document.body.classList.add('dark-mode');

  if (toggle) {
    const on = document.body.classList.contains('dark-mode');
    toggle.textContent = on ? '☀️ Light Mode' : '🌙 Dark Mode';
    toggle.setAttribute('aria-pressed', String(on));

    toggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const nowOn = document.body.classList.contains('dark-mode');
      localStorage.setItem(key, nowOn);
      toggle.textContent = nowOn ? '☀️ Light Mode' : '🌙 Dark Mode';
      toggle.setAttribute('aria-pressed', String(nowOn));
    });
  }
})();

// --- CSV preview ---
(function () {
  const previews = document.querySelectorAll('[data-csv]');
  if (!previews.length) return;

  // Treat only these exact headers specially
  const isIdHeader = (h) => /^classid$/i.test((h || '').trim());
  const isAccuracyHeader = (h) => /^accuracy$/i.test((h || '').trim());

  function formatCell(value, headerText, isHeader) {
    if (isHeader) return value; // header stays as-is

    const num = Number(value);
    if (!Number.isFinite(num)) return value; // non-numeric stays text

    // ClassId → plain integer
    if (isIdHeader(headerText)) return String(Math.trunc(num));

    // Accuracy → percent with 2 decimals
    if (isAccuracyHeader(headerText)) {
      const pct = (num >= 0 && num <= 1) ? num * 100 : num; // handle 0..1 or 0..100
      return `${pct.toFixed(2)}%`;
    }

    // Other numbers: integers stay integers; decimals → 2 places
    return Number.isInteger(num) ? String(num) : num.toFixed(2);
  }

  function renderTable(csvText, target) {
    const lines = csvText.trim().split(/\r?\n/);
    if (!lines.length) { target.textContent = '(No data)'; return; }

    const rows = lines.slice(0, Math.min(lines.length, 11)); // header + up to 10 rows
    const header = rows[0].split(',');
    const table = document.createElement('table');

    rows.forEach((line, i) => {
      const tr = document.createElement('tr');
      line.split(',').forEach((cell, j) => {
        const el = document.createElement(i === 0 ? 'th' : 'td');
        el.textContent = formatCell(cell, header[j], i === 0);

        // Right-align numeric cells in data rows
        if (i > 0 && Number.isFinite(Number(cell))) el.style.textAlign = 'right';

        tr.appendChild(el);
      });
      table.appendChild(tr);
    });

    target.innerHTML = '';
    target.appendChild(table);
  }

  function loadPreviewOnce(target) {
    if (target.dataset.loaded === 'true') return;
    const csvPath = target.getAttribute('data-csv');
    fetch(csvPath)
      .then(r => r.text())
      .then(text => renderTable(text, target))
      .catch(() => { target.textContent = '(Preview unavailable)'; })
      .finally(() => { target.dataset.loaded = 'true'; });
  }

  previews.forEach(el => {
    const details = el.closest('details');
    if (details) {
      if (details.open) loadPreviewOnce(el); // already open
      details.addEventListener('toggle', () => { if (details.open) loadPreviewOnce(el); });
    } else {
      loadPreviewOnce(el); // no <details> wrapper
    }
  });
})();