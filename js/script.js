(() => {
  'use strict';

  const root = document.documentElement;
  const menu = document.getElementById('sideMenu');
  const overlay = document.getElementById('menuOverlay');
  const openButton = document.getElementById('menuOpen');
  const closeButton = document.getElementById('menuClose');
  const mobile = window.matchMedia('(max-width: 900px)');

  const background = [
    document.querySelector('main'),
    document.querySelector('footer'),
    document.querySelector('header')
  ];

  let previousFocus = null;

  function setTheme(theme) {
    root.dataset.theme = theme;

    document.querySelectorAll('[data-theme-choice]').forEach(button => {
      const selected = button.dataset.themeChoice === theme;

      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });

    try {
      localStorage.setItem('prisma-theme', theme);
    } catch (_) {
    }
  }

  let savedTheme = 'light';

  try {
    savedTheme = localStorage.getItem('prisma-theme') || 'light';
  } catch (_) {
  }

  setTheme(savedTheme === 'dark' ? 'dark' : 'light');

  document.querySelectorAll('[data-theme-choice]').forEach(button => {
    button.addEventListener('click', () => {
      setTheme(button.dataset.themeChoice);
    });
  });

  function setBackgroundInert(value) {
    background.forEach(element => {
      if (element) {
        element.inert = value;
      }
    });
  }

  function closeMenu(restoreFocus = true) {
    menu.classList.remove('open');
    overlay.hidden = true;
    document.body.classList.remove('menu-open');
    openButton.setAttribute('aria-expanded', 'false');
    setBackgroundInert(false);

    if (restoreFocus && previousFocus?.isConnected) {
      previousFocus.focus();
    }

    menu.inert = mobile.matches;
    menu.removeAttribute('aria-modal');
    menu.removeAttribute('role');

    if (mobile.matches) {
      menu.setAttribute('aria-hidden', 'true');
    } else {
      menu.removeAttribute('aria-hidden');
    }
  }

  function openMenu() {
    if (!mobile.matches) {
      return;
    }

    previousFocus = document.activeElement;
    menu.inert = false;
    menu.setAttribute('aria-hidden', 'false');
    menu.setAttribute('role', 'dialog');
    menu.setAttribute('aria-modal', 'true');
    menu.classList.add('open');
    overlay.hidden = false;
    document.body.classList.add('menu-open');
    openButton.setAttribute('aria-expanded', 'true');
    closeButton.focus();
    setBackgroundInert(true);
  }

  openButton.addEventListener('click', openMenu);

  closeButton.addEventListener('click', () => {
    closeMenu();
  });

  overlay.addEventListener('click', () => {
    closeMenu();
  });

  mobile.addEventListener('change', () => {
    closeMenu(true);
  });

  closeMenu(false);

  document.addEventListener('keydown', event => {
    if (!menu.classList.contains('open')) {
      return;
    }

    if (event.key === 'Escape') {
      closeMenu();
    }

    if (event.key !== 'Tab') {
      return;
    }

    const controls = [
      ...menu.querySelectorAll('a, button')
    ].filter(element => element.getClientRects().length);

    const first = controls[0];
    const last = controls[controls.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

})();
