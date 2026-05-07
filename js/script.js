const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
const preloader = document.getElementById('preloader');
const contactForms = document.querySelectorAll('.contact-form');
const siteToast = document.getElementById('siteToast');
const header = document.querySelector('.site-header');
const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');

let toastTimer;
let schemeFrame;

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

const getHeaderOffset = () => {
  return (header?.offsetHeight || 0) + 16;
};

const getRgba = (color) => {
  const match = color?.match(/rgba?\(([^)]+)\)/i);
  if (!match) return null;

  const [r, g, b, a = '1'] = match[1].split(',').map(part => part.trim());
  return {
    r: Number.parseFloat(r),
    g: Number.parseFloat(g),
    b: Number.parseFloat(b),
    a: Number.parseFloat(a),
  };
};

const isLightColor = ({ r, g, b }) => {
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.72;
};

const getElementBackdrop = (element) => {
  let current = element;

  while (current && current !== document.documentElement) {
    const style = getComputedStyle(current);
    const color = getRgba(style.backgroundColor);
    const hasImage = style.backgroundImage && style.backgroundImage !== 'none';

    if (hasImage) {
      return { hasImage: true, isLight: false };
    }

    if (color && color.a > 0.3) {
      return { hasImage: false, isLight: isLightColor(color) };
    }

    current = current.parentElement;
  }

  const bodyColor = getRgba(getComputedStyle(document.body).backgroundColor);
  return { hasImage: false, isLight: bodyColor ? isLightColor(bodyColor) : false };
};

const updateHeaderScheme = () => {
  if (!header) return;

  header.classList.toggle('is-scrolled', window.scrollY > 12 || mainNav?.classList.contains('open'));

  const headerColor = getRgba(getComputedStyle(header).backgroundColor);
  const transparentHeader = !headerColor || headerColor.a < 0.78;
  const sampleX = Math.min(window.innerWidth - 1, Math.max(0, window.innerWidth - 28));
  const sampleY = Math.min(window.innerHeight - 1, Math.max(0, header.offsetHeight + 2));
  const backdropElement = document.elementFromPoint(sampleX, sampleY);
  const overMediaHero = Boolean(backdropElement?.closest('.hero-section, [data-navbar-scheme="dark"]'));
  const backdrop = getElementBackdrop(backdropElement);
  const headerIsLight = headerColor && headerColor.a >= 0.78 && isLightColor(headerColor);
  const scheme = overMediaHero || backdrop.hasImage
    ? 'dark'
    : transparentHeader
      ? (backdrop.isLight ? 'light' : 'dark')
      : (headerIsLight ? 'light' : 'dark');

  header.dataset.scheme = scheme;
};

const scheduleHeaderSchemeUpdate = () => {
  window.cancelAnimationFrame(schemeFrame);
  schemeFrame = window.requestAnimationFrame(updateHeaderScheme);
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
    scheduleHeaderSchemeUpdate();
    return;
  }

  openNav();
  scheduleHeaderSchemeUpdate();
});

scheduleHeaderSchemeUpdate();
window.addEventListener('load', scheduleHeaderSchemeUpdate);
window.addEventListener('resize', scheduleHeaderSchemeUpdate);
window.addEventListener('scroll', scheduleHeaderSchemeUpdate, { passive: true });

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

document.querySelectorAll('.footer-social-list a[href="./404.html"]').forEach(link => {
  link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;

    event.preventDefault();
    document.body.classList.add('is-navigating');
    window.setTimeout(() => {
      window.location.href = link.href;
    }, 220);
  });
});

if (window.location.hash) {
  window.addEventListener('load', () => {
    window.setTimeout(() => {
      scrollToTarget(window.location.hash);
    }, 0);
  });
} else {
  window.addEventListener('load', () => {
    window.scrollTo(0, 0);
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
  const value = email.trim();
  const emailPattern = /^[^\s@]+@([A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;
  return emailPattern.test(value);
};

const validatePhoneNumber = (phone) => {
  return /^\d{10}$/.test(phone.trim());
};

const validatePersonName = (name) => {
  return /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/.test(name.trim());
};

const sanitizePhoneNumber = (value) => value.replace(/\D/g, '').slice(0, 10);

const sanitizePersonName = (value) => {
  return value.replace(/[^A-Za-z\s]/g, '').replace(/\s{2,}/g, ' ');
};

const authFieldRules = {
  accountType: {
    validate: value => Boolean(value.trim()),
    error: 'Please choose an account type.',
  },
  company: {
    validate: value => Boolean(value.trim()),
    error: 'Please enter your company name.',
  },
  email: {
    validate: validateEmail,
    error: 'Please enter a valid email address.',
  },
  name: {
    sanitize: sanitizePersonName,
    validate: validatePersonName,
    error: 'Name should contain only letters.',
  },
  password: {
    validate: value => Boolean(value.trim()),
    error: 'Please enter your password.',
  },
  phone: {
    sanitize: sanitizePhoneNumber,
    validate: validatePhoneNumber,
    error: 'Please enter a valid phone number.',
  },
};

const buildAuthModal = () => {
  const authOverlay = document.createElement('div');
  authOverlay.className = 'auth-overlay';
  authOverlay.id = 'authOverlay';
  authOverlay.setAttribute('role', 'dialog');
  authOverlay.setAttribute('aria-modal', 'true');
  authOverlay.setAttribute('aria-labelledby', 'authTitle');
  authOverlay.innerHTML = `
    <div class="auth-modal" role="document">
      <div class="auth-modal__top">
        <div>
          <h2 id="authTitle">Login</h2>
          <p id="authIntro">Access your Stackly workspace.</p>
        </div>
        <button class="auth-close" type="button" aria-label="Close login modal">&times;</button>
      </div>
      <div class="auth-tabs" role="tablist" aria-label="Account forms">
        <button class="auth-tab active" id="loginTab" type="button" role="tab" aria-selected="true" aria-controls="loginForm">Login</button>
        <button class="auth-tab" id="signupTab" type="button" role="tab" aria-selected="false" aria-controls="signupForm">Sign Up</button>
      </div>
      <form class="auth-form active" id="loginForm" novalidate>
        <label for="loginAccountType">Account Type</label>
        <select id="loginAccountType" name="accountType" required data-error="Please choose an account type.">
          <option value="">Select account type</option>
          <option value="Client">Client</option>
          <option value="Partner">Partner</option>
          <option value="Admin">Admin</option>
        </select>
        <p class="field-error" id="loginAccountTypeError" aria-live="polite"></p>
        <label for="loginEmail">Email</label>
        <input id="loginEmail" name="email" type="email" autocomplete="email" required data-error="Please enter a valid email address.">
        <p class="field-error" id="loginEmailError" aria-live="polite"></p>
        <label for="loginPassword">Password</label>
        <div class="password-field">
          <input id="loginPassword" name="password" type="password" autocomplete="current-password" required data-error="Please enter your password.">
          <button class="show-password" type="button" data-password-toggle="loginPassword">Show Password</button>
        </div>
        <p class="field-error" id="loginPasswordError" aria-live="polite"></p>
        <a class="auth-forgot" href="./contact.html?topic=Forgot%20password">Forgot Password?</a>
        <button class="btn btn--primary btn--block" type="submit" disabled>Login</button>
        <p class="auth-status" aria-live="polite"></p>
        <p class="auth-switch">New user? <button class="auth-link" type="button" data-auth-mode="signup">Create an account</button></p>
      </form>
      <form class="auth-form" id="signupForm" novalidate>
        <label for="signupName">Name</label>
        <input id="signupName" name="name" type="text" autocomplete="name" required data-error="Name should contain only letters.">
        <p class="field-error" id="signupNameError" aria-live="polite"></p>
        <label for="signupEmail">Email</label>
        <input id="signupEmail" name="email" type="email" autocomplete="email" required data-error="Please enter a valid email address.">
        <p class="field-error" id="signupEmailError" aria-live="polite"></p>
        <label for="signupPhone">Phone</label>
        <input id="signupPhone" name="phone" type="tel" autocomplete="tel" inputmode="numeric" pattern="[0-9]{10}" maxlength="10" required data-error="Please enter a valid phone number.">
        <p class="field-error" id="signupPhoneError" aria-live="polite"></p>
        <label for="signupCompany">Company</label>
        <input id="signupCompany" name="company" type="text" autocomplete="organization" required data-error="Please enter your company name.">
        <p class="field-error" id="signupCompanyError" aria-live="polite"></p>
        <label for="signupPassword">Password</label>
        <div class="password-field">
          <input id="signupPassword" name="password" type="password" autocomplete="new-password" required data-error="Please enter your password.">
          <button class="show-password" type="button" data-password-toggle="signupPassword">Show Password</button>
        </div>
        <p class="field-error" id="signupPasswordError" aria-live="polite"></p>
        <button class="btn btn--primary btn--block" type="submit" disabled>Create Account</button>
        <p class="auth-status" aria-live="polite"></p>
        <p class="auth-switch">Already have an account? <button class="auth-link" type="button" data-auth-mode="login">Login</button></p>
      </form>
    </div>
  `;
  document.body.appendChild(authOverlay);
  return authOverlay;
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

const clearFieldError = (field) => {
  field.classList.remove('has-error');
  field.removeAttribute('aria-invalid');

  const errorField = document.getElementById(`${field.id}Error`);
  if (errorField) {
    errorField.textContent = '';
  }
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

const authOverlay = document.getElementById('loginButton') ? buildAuthModal() : null;

if (authOverlay) {
  const authModal = authOverlay.querySelector('.auth-modal');
  const loginButton = document.getElementById('loginButton');
  const closeAuthButton = authOverlay.querySelector('.auth-close');
  const loginTab = authOverlay.querySelector('#loginTab');
  const signupTab = authOverlay.querySelector('#signupTab');
  const loginForm = authOverlay.querySelector('#loginForm');
  const signupForm = authOverlay.querySelector('#signupForm');
  const authTitle = authOverlay.querySelector('#authTitle');
  const authIntro = authOverlay.querySelector('#authIntro');
  let lastFocusedElement = null;
  const authSessionKey = 'stacklyAuthSession';

  const getAuthSession = () => {
    try {
      return JSON.parse(localStorage.getItem(authSessionKey));
    } catch (error) {
      return null;
    }
  };

  const setAuthSession = (session) => {
    localStorage.setItem(authSessionKey, JSON.stringify(session));
  };

  const clearAuthSession = () => {
    localStorage.removeItem(authSessionKey);
  };

  const updateLoginButtonState = () => {
    const isSignedIn = Boolean(getAuthSession());
    loginButton.textContent = isSignedIn ? 'Sign Out' : 'Login';
    loginButton.setAttribute('aria-label', isSignedIn ? 'Sign out of Stackly' : 'Open login modal');
    loginButton.classList.toggle('nav-login--signout', isSignedIn);
  };

  const resetAuthStatus = (form) => {
    const status = form.querySelector('.auth-status');
    status.textContent = '';
    status.style.color = '';
  };

  const getAuthFieldRule = (field) => authFieldRules[field.name] || null;

  const sanitizeAuthField = (field) => {
    const rule = getAuthFieldRule(field);
    if (!rule?.sanitize) return false;

    const cleanValue = rule.sanitize(field.value);
    if (field.value !== cleanValue) {
      const cursorPosition = field.selectionStart;
      const removedCharacters = field.value.length - cleanValue.length;
      field.value = cleanValue;

      if (cursorPosition !== null && document.activeElement === field) {
        const nextPosition = Math.max(cursorPosition - removedCharacters, 0);
        field.setSelectionRange(nextPosition, nextPosition);
      }

      return true;
    }

    return false;
  };

  const getAuthFieldError = (field) => {
    const rule = getAuthFieldRule(field);
    const value = field.value.trim();

    if (field.required && !value) {
      return rule?.error || field.dataset.error || 'Please complete this field.';
    }

    if (rule && !rule.validate(field.value)) {
      return rule.error;
    }

    return '';
  };

  const validateAuthField = (field, { showErrorMessage = true } = {}) => {
    const hadInvalidCharacters = sanitizeAuthField(field);
    const message = hadInvalidCharacters
      ? getAuthFieldRule(field)?.error || field.dataset.error || 'Please complete this field.'
      : getAuthFieldError(field);

    if (showErrorMessage) {
      if (message) {
        showError(field, message);
      } else {
        clearFieldError(field);
      }
    }

    return !message;
  };

  const getRequiredAuthFields = (form) => {
    return Array.from(form.querySelectorAll('input[required], select[required]'));
  };

  const updateAuthSubmitState = (form) => {
    const submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton) return false;

    const isValid = getRequiredAuthFields(form).every(field => validateAuthField(field, { showErrorMessage: false }));
    submitButton.disabled = !isValid;
    return isValid;
  };

  const setAuthMode = (mode) => {
    const isSignup = mode === 'signup';
    loginForm.classList.toggle('active', !isSignup);
    signupForm.classList.toggle('active', isSignup);
    loginTab.classList.toggle('active', !isSignup);
    signupTab.classList.toggle('active', isSignup);
    loginTab.setAttribute('aria-selected', String(!isSignup));
    signupTab.setAttribute('aria-selected', String(isSignup));
    authTitle.textContent = isSignup ? 'Create Account' : 'Login';
    authIntro.textContent = isSignup ? 'Set up a new Stackly workspace profile.' : 'Access your Stackly workspace.';
    clearErrors(loginForm);
    clearErrors(signupForm);
    resetAuthStatus(loginForm);
    resetAuthStatus(signupForm);
    updateAuthSubmitState(loginForm);
    updateAuthSubmitState(signupForm);
    window.setTimeout(() => {
      const firstField = isSignup ? signupForm.querySelector('input') : loginForm.querySelector('input');
      firstField?.focus();
    }, 0);
  };

  const openAuthModal = () => {
    lastFocusedElement = document.activeElement;
    authOverlay.classList.add('open');
    document.body.classList.add('auth-modal-open');
    closeNav();
    setAuthMode('login');
  };

  const closeAuthModal = () => {
    authOverlay.classList.remove('open');
    document.body.classList.remove('auth-modal-open');
    lastFocusedElement?.focus();
  };

  const validateAuthForm = (form) => {
    clearErrors(form);
    resetAuthStatus(form);

    let valid = true;
    let firstInvalidField = null;

    getRequiredAuthFields(form).forEach(field => {
      if (!validateAuthField(field)) {
        valid = false;
        firstInvalidField ||= field;
      }
    });

    if (!valid) {
      form.querySelector('.auth-status').textContent = 'Please correct the highlighted fields.';
      firstInvalidField?.focus();
    }

    updateAuthSubmitState(form);
    return valid;
  };

  updateLoginButtonState();

  loginButton?.addEventListener('click', () => {
    if (getAuthSession()) {
      clearAuthSession();
      updateLoginButtonState();
      closeNav();
      showToast('Signed out successfully.');
      return;
    }

    openAuthModal();
  });
  closeAuthButton?.addEventListener('click', closeAuthModal);
  loginTab?.addEventListener('click', () => setAuthMode('login'));
  signupTab?.addEventListener('click', () => setAuthMode('signup'));

  authOverlay.addEventListener('click', (event) => {
    if (!authModal.contains(event.target)) {
      closeAuthModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (!authOverlay.classList.contains('open')) return;

    if (event.key === 'Escape') {
      closeAuthModal();
    }

    if (event.key === 'Tab') {
      const focusableElements = authOverlay.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled])');
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  });

  authOverlay.querySelectorAll('[data-auth-mode]').forEach(button => {
    button.addEventListener('click', () => setAuthMode(button.dataset.authMode));
  });

  authOverlay.querySelectorAll('[data-password-toggle]').forEach(button => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.passwordToggle);
      if (!input) return;

      const showPassword = input.type === 'password';
      input.type = showPassword ? 'text' : 'password';
      button.textContent = showPassword ? 'Hide Password' : 'Show Password';
    });
  });

  authOverlay.querySelectorAll('input, select').forEach(field => {
    const form = field.closest('form');

    field.addEventListener('input', () => {
      validateAuthField(field);
      if (form) {
        resetAuthStatus(form);
        updateAuthSubmitState(form);
      }
    });

    field.addEventListener('blur', () => {
      validateAuthField(field);
      if (form) updateAuthSubmitState(form);
    });

    field.addEventListener('change', () => {
      validateAuthField(field);
      if (form) updateAuthSubmitState(form);
    });
  });

  updateAuthSubmitState(loginForm);
  updateAuthSubmitState(signupForm);

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateAuthForm(loginForm)) return;

    setAuthSession({
      accountType: loginForm.querySelector('[name="accountType"]').value,
      email: loginForm.querySelector('[name="email"]').value.trim(),
      signedInAt: new Date().toISOString(),
    });
    updateLoginButtonState();
    loginForm.querySelector('.auth-status').textContent = 'Login successful. Redirecting...';
    loginForm.querySelector('.auth-status').style.color = 'var(--success)';
    showToast('Login successful.');
    window.setTimeout(() => {
      window.location.href = './index.html';
    }, 700);
  });

  signupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateAuthForm(signupForm)) return;

    const user = {
      name: signupForm.querySelector('[name="name"]').value.trim(),
      email: signupForm.querySelector('[name="email"]').value.trim(),
      phone: signupForm.querySelector('[name="phone"]').value.trim(),
      company: signupForm.querySelector('[name="company"]').value.trim(),
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('stacklyUser', JSON.stringify(user));
    signupForm.querySelector('.auth-status').textContent = 'Account created. You can log in now.';
    signupForm.querySelector('.auth-status').style.color = 'var(--success)';
    showToast('Account created successfully.');
    signupForm.reset();
    window.setTimeout(() => setAuthMode('login'), 650);
  });
}

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
