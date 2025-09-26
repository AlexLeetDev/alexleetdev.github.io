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
