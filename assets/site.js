/* Navigation and direct inquiry. No analytics or browser storage. */
document.documentElement.dataset.js = '';
const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#mobile-nav');
if (toggle && menu) {
  toggle.hidden = false;
  const closeMenu = () => {
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  };
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    menu.hidden = expanded;
    toggle.setAttribute('aria-expanded', String(!expanded));
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) {
      closeMenu();
      toggle.focus();
    }
  });
  menu.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  window.matchMedia('(min-width: 701px)').addEventListener('change', event => {
    if (event.matches) closeMenu();
  });
}

const form = document.querySelector('#inquiry-form');
if (form) {
  const status = document.querySelector('#form-status');
  const submit = form.querySelector('button[type="submit"]');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity() || submit.disabled) return;
    const values = Object.fromEntries(new FormData(form));
    submit.disabled = true;
    submit.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');
    status.className = 'form-status';
    status.textContent = 'Sending your inquiry…';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    let failureMessage = 'We couldn’t confirm your inquiry. Your details are still here. Please try again or email hello@remedys.ai.';
    try {
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        if (response.status === 429) failureMessage = 'Please wait a moment before trying again, or email hello@remedys.ai.';
        throw new Error('delivery');
      }
      form.querySelector('.form-grid').hidden = true;
      form.querySelector('.form-note').hidden = true;
      submit.hidden = true;
      status.className = 'form-status success';
      status.textContent = 'Thank you. Your inquiry has been received. We’ll review it and follow up using the email you provided.';
      status.tabIndex = -1;
      status.focus();
      form.reset();
    } catch (error) {
      status.className = 'form-status error';
      status.textContent = error.name === 'AbortError'
        ? 'We couldn’t confirm delivery in time. Your details are still here. Please email hello@remedys.ai before resending to avoid a duplicate.'
        : failureMessage;
    } finally {
      clearTimeout(timeout);
      form.removeAttribute('aria-busy');
      submit.disabled = false;
      submit.textContent = 'Send your inquiry ↗';
    }
  });
}
