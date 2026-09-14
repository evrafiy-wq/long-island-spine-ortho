const currentYear = document.getElementById('current-year');
const navToggle = document.getElementById('nav-toggle');
const siteNav = document.getElementById('site-nav');
const navLinks = siteNav ? Array.from(siteNav.querySelectorAll('a')) : [];

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

function setMenuState(isOpen) {
  if (!navToggle || !siteNav) return;

  navToggle.setAttribute('aria-expanded', String(isOpen));
  siteNav.classList.toggle('is-open', isOpen);
  document.body.classList.toggle('nav-open', isOpen);
}

function closeMenu() {
  setMenuState(false);
}

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    setMenuState(!isExpanded);
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 931) {
        closeMenu();
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 931) {
      closeMenu();
    }
  });
}

// ── Appointment form (client-side validation) ──
const appointmentForm = document.getElementById('appointment-form');

if (appointmentForm) {
  const appointmentFields = appointmentForm.querySelectorAll('input, select');

  const validateField = (field) => {
    field.classList.toggle('is-invalid', !field.checkValidity());
  };

  appointmentFields.forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('is-invalid')) validateField(field);
    });
    field.addEventListener('change', () => {
      if (field.classList.contains('is-invalid')) validateField(field);
    });
  });

  appointmentForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Let the browser run constraint validation
    if (!appointmentForm.checkValidity()) {
      appointmentForm.reportValidity();
      appointmentFields.forEach(validateField);
      return;
    }

    // Collect values (ready for future backend)
    const data = Object.fromEntries(new FormData(appointmentForm));
    console.log('Appointment request:', data);

    // Show success feedback
    const btn = appointmentForm.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Request received ✓';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    setTimeout(() => {
      appointmentForm.reset();
      appointmentFields.forEach((field) => field.classList.remove('is-invalid'));
      btn.textContent = originalText;
      btn.disabled = false;
      btn.style.opacity = '';
    }, 3000);
  });
}

// ── Appointment Form Date Constraint & Weekday Validation ──
const apptDateInput = document.getElementById('appt-date');
if (apptDateInput) {
  // Set minimum date to today
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  apptDateInput.min = `${yyyy}-${mm}-${dd}`;

  // Block weekend selections
  apptDateInput.addEventListener('input', (e) => {
    const day = new Date(e.target.value).getUTCDay();
    // 0 is Sunday, 6 is Saturday
    if (day === 0 || day === 6) {
      apptDateInput.setCustomValidity('Office is closed on weekends. Please choose a weekday.');
      apptDateInput.reportValidity();
    } else {
      apptDateInput.setCustomValidity('');
    }
  });
}

// ── Condition Guide Tabs ──
const conditionTabBtns = document.querySelectorAll('.conditions-tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

conditionTabBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    // Deactivate current active tab and panel
    document.querySelector('.conditions-tab-btn.active')?.classList.remove('active');
    document.querySelector('.tab-panel.active')?.classList.remove('active');

    // Activate selected tab and panel
    btn.classList.add('active');
    const panelId = btn.getAttribute('aria-controls');
    const targetPanel = document.getElementById(panelId);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }

    // Set accessibility attributes
    conditionTabBtns.forEach((b) => {
      b.setAttribute('aria-selected', 'false');
      b.setAttribute('tabindex', '-1');
    });
    btn.setAttribute('aria-selected', 'true');
    btn.removeAttribute('tabindex');
  });
});

// ── Visit Office/Map Toggle Tabs ──
const locationTabBtns = document.querySelectorAll('.location-tab-btn');
const locationPanels = document.querySelectorAll('.location-panel');

locationTabBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    // Toggle active tab class
    document.querySelector('.location-tab-btn.active')?.classList.remove('active');
    document.querySelector('.location-panel.active')?.classList.remove('active');

    btn.classList.add('active');
    const targetId = btn.getAttribute('aria-controls');
    const targetPanel = document.getElementById(targetId);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }

    locationTabBtns.forEach((b) => {
      b.setAttribute('aria-selected', 'false');
      b.setAttribute('tabindex', '-1');
    });
    btn.setAttribute('aria-selected', 'true');
    btn.removeAttribute('tabindex');
  });
});

// ── FAQ Accordion ──
const faqTriggers = document.querySelectorAll('.faq-trigger');

faqTriggers.forEach((trigger) => {
  trigger.addEventListener('click', () => {
    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
    const targetId = trigger.getAttribute('aria-controls');
    const answerPanel = document.getElementById(targetId);

    // Toggle aria-expanded
    trigger.setAttribute('aria-expanded', String(!isExpanded));

    // Toggle hidden status for screen readers
    if (answerPanel) {
      if (isExpanded) {
        // Delay setting hidden to allow smooth closing transition
        setTimeout(() => {
          if (trigger.getAttribute('aria-expanded') === 'false') {
            answerPanel.setAttribute('hidden', '');
          }
        }, 300);
      } else {
        answerPanel.removeAttribute('hidden');
      }
    }
  });
});
