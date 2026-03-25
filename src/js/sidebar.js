document.addEventListener('DOMContentLoaded', function() {
  const body = document.body;
  const storageKey = 'sidebarCollapsed';
  const toggles = document.querySelectorAll('.sidebar-toggle');

  // Always start expanded, respect toggle only
  // if (localStorage.getItem(storageKey) === 'true') {
  //   body.classList.add('sidebar-collapsed');
  // }

  toggles.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const collapsed = body.classList.toggle('sidebar-collapsed');
      localStorage.setItem(storageKey, collapsed ? 'true' : 'false');
    });
  });

  // Logout links/buttons inside sidebar
  const logoutEls = document.querySelectorAll('.sidebar-logout');
  logoutEls.forEach(el => {
    el.addEventListener('click', function(e) {
      e.preventDefault();
      try {
        localStorage.removeItem('authToken');
      } catch (err) {}
      try { sessionStorage.clear(); } catch (err) {}
      try { localStorage.clear(); } catch (err) {}
      const href = el.getAttribute('href') || '../index.html';
      window.location.href = href;
    });
  });
});
