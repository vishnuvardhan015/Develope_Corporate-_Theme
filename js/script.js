const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
const preloader = document.getElementById('preloader');
const contactForms = document.querySelectorAll('.contact-form');
const siteToast = document.getElementById('siteToast');
const header = document.querySelector('.site-header');
const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');

let toastTimer;

const getHeaderOffset = () => {
  return (header?.offsetHeight || 0) + 16;
};

const showToast = (message) => {
  if (!siteToast || !message) return;

  window.clearTimeout(toastTimer);
  siteToast.textContent = message;
  siteToast.classList.add('show');
  toastTimer = window.setTimeout(() => {
    siteToast.classList.remove('show');
  }, 3600);
};

const closeNav = () => {
  mainNav?.classList.remove('open');
  navToggle?.classList.remove('open');
  navToggle?.setAttribute('aria-expanded', 'false');
  navToggle?.setAttribute('aria-label', 'Open navigation');
  document.body.classList.remove('nav-open');
};

const openNav = () => {
  mainNav?.classList.add('open');
  navToggle?.classList.add('open');
  navToggle?.setAttribute('aria-expanded', 'true');
  navToggle?.setAttribute('aria-label', 'Close navigation');
  document.body.classList.add('nav-open');
};

navToggle?.addEventListener('click', () => {
  if (mainNav?.classList.contains('open')) {
    closeNav();
    return;
  }

  openNav();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeNav();
  }
});

document.addEventListener('click', (event) => {
  if (!mainNav?.classList.contains('open')) return;
  const clickedInsideNav = mainNav.contains(event.target);
  const clickedToggle = navToggle?.contains(event.target);

  if (!clickedInsideNav && !clickedToggle) {
    closeNav();
  }
});

const scrollToTarget = (targetSelector) => {
  const target = document.querySelector(targetSelector);
  if (!target) return false;

  const targetTop = target.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
  window.scrollTo({
    top: Math.max(targetTop, 0),
    behavior: 'smooth',
  });
  return true;
};

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    const target = link.getAttribute('href');
    if (!target || target === '#') return;

    const scrolled = scrollToTarget(target);
    if (scrolled) {
      event.preventDefault();
      closeNav();
    }

    if (link.dataset.cta) {
      showToast(`${link.dataset.cta} selected. The contact form is ready below.`);
    }

    if (link.dataset.notice) {
      showToast(link.dataset.notice);
    }
  });
});

if (window.location.hash) {
  window.addEventListener('load', () => {
    window.setTimeout(() => {
      scrollToTarget(window.location.hash);
    }, 0);
  });
}

window.addEventListener('load', () => {
  window.setTimeout(() => {
    preloader?.classList.add('hidden');
  }, 450);
});

if (window.AOS) {
  AOS.init({
    duration: 760,
    easing: 'ease-out-cubic',
    once: true,
    offset: 90,
    delay: 0,
    mirror: false,
    disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  });
}

if ('IntersectionObserver' in window) {
  const activeSectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const id = entry.target.getAttribute('id');
      if (!id) return;

      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    });
  }, {
    rootMargin: `-${getHeaderOffset() + 8}px 0px -60% 0px`,
    threshold: 0.01,
  });

  document.querySelectorAll('main section[id]').forEach(section => {
    activeSectionObserver.observe(section);
  });
}

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const showError = (field, message, form) => {
  const errorField = document.getElementById(`${field.id}Error`);
  field.classList.add('has-error');
  field.setAttribute('aria-invalid', 'true');

  if (errorField) {
    errorField.textContent = message;
  }

  const describedBy = new Set((field.getAttribute('aria-describedby') || '').split(' ').filter(Boolean));
  describedBy.add(`${field.id}Error`);
  field.setAttribute('aria-describedby', Array.from(describedBy).join(' '));
};

const clearErrors = (form) => {
  form.querySelectorAll('.field-error').forEach(field => {
    field.textContent = '';
  });

  form.querySelectorAll('.has-error').forEach(field => {
    field.classList.remove('has-error');
    field.removeAttribute('aria-invalid');
  });

  const formStatus = form.querySelector('.form-status');
  if (formStatus) {
    formStatus.textContent = '';
    formStatus.style.color = '';
  }
};

contactForms.forEach(contactForm => {
  const formStatus = contactForm.querySelector('.form-status');
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const submitLabel = submitButton?.textContent || 'Send Message';

  contactForm.addEventListener('input', (event) => {
    const field = event.target;
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return;

    field.classList.remove('has-error');
    field.removeAttribute('aria-invalid');

    const errorField = document.getElementById(`${field.id}Error`);
    if (errorField) {
      errorField.textContent = '';
    }
  });

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    clearErrors(contactForm);

    const nameField = contactForm.querySelector('[name="name"]');
    const emailField = contactForm.querySelector('[name="email"]');
    const companyField = contactForm.querySelector('[name="company"]');
    const messageField = contactForm.querySelector('[name="message"]');
    let firstInvalidField = null;
    let valid = true;

    const markInvalid = (field, message) => {
      valid = false;
      if (!firstInvalidField) {
        firstInvalidField = field;
      }
      showError(field, message, contactForm);
    };

    if (nameField && !nameField.value.trim()) {
      markInvalid(nameField, 'Please enter your name.');
    }

    if (emailField && (!emailField.value.trim() || !validateEmail(emailField.value))) {
      markInvalid(emailField, 'Please enter a valid email address.');
    }

    if (companyField && !companyField.value.trim()) {
      markInvalid(companyField, 'Please enter your company name.');
    }

    if (messageField && messageField.value.trim().length < 12) {
      markInvalid(messageField, 'Please share at least 12 characters about your project.');
    }

    if (!valid) {
      if (formStatus) {
        formStatus.textContent = 'Please correct the highlighted fields and try again.';
        formStatus.style.color = 'var(--danger)';
      }

      firstInvalidField?.focus();
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute('aria-busy', 'true');
      submitButton.textContent = 'Sending...';
    }

    if (formStatus) {
      formStatus.textContent = 'Sending your message...';
      formStatus.style.color = 'var(--muted)';
    }

    window.setTimeout(() => {
      if (formStatus) {
        formStatus.textContent = 'Thanks! Your message has been received. We will respond shortly.';
        formStatus.style.color = 'var(--success)';
      }

      showToast('Message sent successfully.');
      contactForm.reset();

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.removeAttribute('aria-busy');
        submitButton.textContent = submitLabel;
      }
    }, 650);
  });
});

const contactParams = new URLSearchParams(window.location.search);
const inquiry = contactParams.get('plan') || contactParams.get('topic') || contactParams.get('service');

if (inquiry && contactForms.length) {
  const messageField = contactForms[0].querySelector('[name="message"]');
  const formStatus = contactForms[0].querySelector('.form-status');

  if (messageField && !messageField.value.trim()) {
    messageField.value = `I would like to discuss ${inquiry}.`;
  }

  if (formStatus) {
    formStatus.textContent = `Inquiry selected: ${inquiry}`;
    formStatus.style.color = 'var(--muted)';
  }

  window.addEventListener('load', () => {
    window.setTimeout(() => {
      scrollToTarget('#contact');
    }, 120);
  });
}
