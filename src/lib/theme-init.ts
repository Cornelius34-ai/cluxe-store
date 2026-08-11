// Prevents the white-flash when the user has dark mode enabled.
// Runs synchronously in <head> before the body paints.
export const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('cluxe-theme') || 'system';
    var resolved = stored;
    if (stored === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    if (resolved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();
`.trim();
