(function () {
  'use strict';

  const rootEl = document.documentElement;
  const themeBtn = document.getElementById('themeToggle');
  const burger = document.getElementById('burgerBtn');
  const panel = document.getElementById('mobilePanel');
  const form = document.getElementById('contactForm');
  const msg = document.getElementById('formMsg');
  const submitBtn = document.getElementById('formSubmit');

  try {
    const stored = localStorage.getItem('ece-theme');
    if (stored === 'dark' || stored === 'light') {
      rootEl.setAttribute('data-theme', stored);
    }
  } catch (error) {
    // Ignore storage failures in private browsing contexts.
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      const current = rootEl.getAttribute('data-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      const next = current === 'dark' ? 'light' : 'dark';
      rootEl.setAttribute('data-theme', next);

      try {
        localStorage.setItem('ece-theme', next);
      } catch (error) {
        // Ignore storage failures.
      }
    });
  }

  function closePanel() {
    if (panel && burger) {
      panel.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }
    document.body.classList.remove('no-scroll');
  }

  function openPanel() {
    if (panel && burger) {
      panel.classList.add('open');
      burger.setAttribute('aria-expanded', 'true');
    }
    document.body.classList.add('no-scroll');
  }

  if (burger && panel) {
    burger.addEventListener('click', function () {
      if (panel.classList.contains('open')) {
        closePanel();
      } else {
        openPanel();
      }
    });

    panel.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closePanel);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && panel.classList.contains('open')) {
        closePanel();
      }
    });
  }

  const sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  const railLinks = Array.prototype.slice.call(document.querySelectorAll('.rail a'));
  const topLinks = Array.prototype.slice.call(document.querySelectorAll('nav.primary a'));

  function setActive(id) {
    if (!id) return;

    railLinks.forEach(function (link) {
      link.classList.toggle('active', link.dataset.sec === id);
    });

    topLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + id);
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (section) {
      obs.observe(section);
    });
  }

  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('motion-ready');
    const revealItems = Array.prototype.slice.call(document.querySelectorAll('.section-head, .tech-card, .svc-card, .sect-card, .step, .proj-card, .contact-grid'));

    revealItems.forEach(function (item, index) {
      item.classList.add('reveal-item');
      item.style.setProperty('--reveal-delay', Math.min(index % 6, 5) * 70 + 'ms');
    });

    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  }

  if (form && msg && submitBtn) {
    const setFormMessage = function (text, state) {
      msg.textContent = text;
      msg.classList.remove('success', 'error');
      if (state) {
        msg.classList.add(state);
      }
      msg.classList.add('show');
    };

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      const originalLabel = submitBtn.textContent;
      const originalText = msg.textContent;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Envoi en cours...';
      msg.classList.remove('success', 'error');
      msg.textContent = 'Votre demande est en cours d’envoi.';
      msg.classList.add('show');

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      }).then(function (response) {
        if (!response.ok) {
          throw new Error('Formspree request failed');
        }

        form.reset();
        setFormMessage('Votre demande a bien été envoyée. Nous vous répondrons rapidement.', 'success');
      }).catch(function () {
        setFormMessage('L’envoi a échoué. Vérifiez votre connexion et réessayez.', 'error');
      }).finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
        if (msg.textContent === originalText) {
          msg.classList.remove('show');
        }
      });
    });
  }
})();
