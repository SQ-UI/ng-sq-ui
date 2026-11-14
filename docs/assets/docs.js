/* Keep Docsify's existing menu behavior, with keyboard dismissal and state labels. */
window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
  hook.mounted(function () {
    const toggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.querySelector('.docs-nav-backdrop');
    const mobile = window.matchMedia('(max-width: 768px)');
    if (!toggle || !sidebar || !backdrop) return;

    sidebar.id = 'docs-navigation';
    toggle.setAttribute('aria-controls', sidebar.id);

    function syncMenu() {
      const open = mobile.matches && document.body.classList.contains('close');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      // A translated menu must not keep its links in the keyboard tab order.
      sidebar.inert = mobile.matches && !open;
    }

    function closeMenu() {
      if (mobile.matches && document.body.classList.contains('close')) {
        toggle.click();
        toggle.focus();
      }
    }

    backdrop.addEventListener('click', closeMenu);
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });
    new MutationObserver(syncMenu).observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });
    mobile.addEventListener('change', syncMenu);
    syncMenu();
  });
});
