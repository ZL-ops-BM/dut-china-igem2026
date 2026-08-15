(() => {
  const header = document.querySelector('[data-site-header]');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navPanel = document.querySelector('[data-nav-panel]');
  const groups = [...document.querySelectorAll('[data-nav-group]')];
  const desktopQuery = window.matchMedia('(min-width: 1121px)');
  let lastFocused = null;

  const setHeaderState = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
  };

  const closeGroup = (group) => {
    group.classList.remove('is-open');
    group.querySelector('[data-nav-menu-button]')?.setAttribute('aria-expanded', 'false');
  };

  const openGroup = (group) => {
    groups.forEach((item) => {
      if (item !== group) closeGroup(item);
    });
    group.classList.add('is-open');
    group.querySelector('[data-nav-menu-button]')?.setAttribute('aria-expanded', 'true');
  };

  const closeNavigation = ({ restoreFocus = true } = {}) => {
    navPanel?.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
    groups.forEach(closeGroup);
    if (restoreFocus && lastFocused instanceof HTMLElement) lastFocused.focus();
  };

  const openNavigation = () => {
    lastFocused = document.activeElement;
    navPanel?.classList.add('is-open');
    navToggle?.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');
    // Let the native click and the panel visibility transition finish before focusing inside.
    const focusFirstNavItem = () => {
      if (navPanel?.classList.contains('is-open')) navPanel.querySelector('a, button')?.focus();
    };
    window.setTimeout(focusFirstNavItem, 0);
    window.setTimeout(focusFirstNavItem, 160);
  };

  navToggle?.addEventListener('click', () => {
    if (navPanel?.classList.contains('is-open')) closeNavigation();
    else openNavigation();
  });

  groups.forEach((group) => {
    const button = group.querySelector('[data-nav-menu-button]');
    let leaveTimer;

    button?.addEventListener('click', () => {
      // Hover entry already opens desktop groups; keep a click from immediately toggling it shut.
      if (desktopQuery.matches) {
        openGroup(group);
        return;
      }
      if (group.classList.contains('is-open')) closeGroup(group);
      else openGroup(group);
    });

    group.addEventListener('pointerenter', (event) => {
      if (!desktopQuery.matches || event.pointerType === 'touch') return;
      window.clearTimeout(leaveTimer);
      openGroup(group);
    });
    group.addEventListener('pointerleave', () => {
      if (!desktopQuery.matches) return;
      leaveTimer = window.setTimeout(() => closeGroup(group), 120);
    });
  });

  document.addEventListener('click', (event) => {
    if (desktopQuery.matches && !event.target.closest('[data-nav-group]')) groups.forEach(closeGroup);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (navPanel?.classList.contains('is-open')) closeNavigation();
      else groups.forEach(closeGroup);
    }

    if (event.key !== 'Tab' || !navPanel?.classList.contains('is-open') || desktopQuery.matches) return;
    const focusable = [...navPanel.querySelectorAll('a, button')].filter((item) => !item.hasAttribute('disabled'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  navPanel?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (!desktopQuery.matches) closeNavigation({ restoreFocus: false });
    });
  });

  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('[data-nav-link], .nav-submenu a').forEach((link) => {
    const linkPath = new URL(link.href, window.location.href).pathname.replace(/\/$/, '') || '/';
    if (linkPath === currentPath) {
      link.classList.add('is-current');
      link.setAttribute('aria-current', 'page');
    }
  });

  const revealItems = [...document.querySelectorAll('[data-reveal="section"]')];
  if (revealItems.length && 'IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('motion-ready');
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  window.addEventListener('scroll', setHeaderState, { passive: true });
  window.addEventListener('resize', () => {
    if (desktopQuery.matches && navPanel?.classList.contains('is-open')) closeNavigation({ restoreFocus: false });
  });
  setHeaderState();
})();
