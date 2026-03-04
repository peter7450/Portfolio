/* ============================================================
   main.js — Portfolio Interactivity
   ============================================================
   This file handles everything interactive on the page.

   It's placed at the bottom of <body> in index.html.
   That matters: the browser reads HTML top-to-bottom, so by
   the time it reaches this script, all the HTML elements already
   exist in memory. If this were in <head>, the elements wouldn't
   exist yet and document.getElementById() would return null.
============================================================ */


/* ============================================================
   GRABBING ELEMENTS FROM THE DOM
   ============================================================
   Before you can do anything with an HTML element in JavaScript,
   you need a reference to it — like a variable that points to it.

   document.getElementById('id')     → finds ONE element by its id attribute
   document.querySelector('.class')  → finds the FIRST element matching a CSS selector
   document.querySelectorAll('.cls') → finds ALL matching elements as a NodeList

   We store these in const because we never reassign these variables.
   const = "this variable will never point to a different value."
============================================================ */
const nav         = document.getElementById('nav');
const navToggle   = document.getElementById('navToggle');
const navLinks    = document.getElementById('navLinks');
const roleEl      = document.querySelector('.hero__role');
const themeToggle = document.getElementById('themeToggle');
const htmlEl      = document.documentElement; /* the <html> element itself */


/* ============================================================
   1. THEME — DARK / LIGHT MODE
   ============================================================
   THREE things work together here:

   A) Device preference detection
      window.matchMedia('(prefers-color-scheme: dark)') reads the
      operating system's appearance setting — the same setting that
      switches your phone or laptop to dark mode.
      .matches returns true if the OS prefers dark, false if light.

   B) localStorage persistence
      localStorage is a key-value store built into every browser.
      It saves data that survives page refreshes and restarts.
      localStorage.getItem('theme')       → retrieves saved value (or null)
      localStorage.setItem('theme', val)  → saves a value

   C) Priority order on load:
      1. Saved user preference (localStorage) → use it
      2. No saved preference → follow the OS setting
      3. Neither available → default to dark

   This is exactly how GitHub, VS Code and Linear handle theming.
============================================================ */

const savedTheme   = localStorage.getItem('theme');
const systemDark   = window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialTheme = savedTheme || (systemDark ? 'dark' : 'light');

/* Set the theme on <html> before the first paint */
htmlEl.setAttribute('data-theme', initialTheme);
updateToggleLabel(initialTheme);

/*
  Watch for OS-level changes in real time.
  If the user switches their device appearance while on your page
  — and hasn't manually overridden it — the page updates to match.
*/
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    const newTheme = e.matches ? 'dark' : 'light';
    htmlEl.setAttribute('data-theme', newTheme);
    updateToggleLabel(newTheme);
  }
});

/* Button click: flip the theme and save the choice */
themeToggle.addEventListener('click', () => {
  const current = htmlEl.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';

  htmlEl.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateToggleLabel(next);
});

/*
  aria-label describes what clicking the button WILL do next.
  "Switch to light mode" means you're currently in dark mode.
  This is the correct UX pattern for toggle buttons.
*/
function updateToggleLabel(theme) {
  themeToggle.setAttribute(
    'aria-label',
    theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
  );
}


/* ============================================================
   2. NAV — SCROLL BACKGROUND
   ============================================================
 */
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});


navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

document.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});


/* ============================================================
   4. ACTIVE NAV LINK — INTERSECTION OBSERVER
   ============================================================
 */
const sections = document.querySelectorAll('section[id]');

const observerOptions = {
  rootMargin: `-${70}px 0px -50% 0px`,
  threshold: 0
};

const sectionObserver = new IntersectionObserver((entries) => {
  
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;  /* skip if the section just left */

    /* Get the section's id (e.g. "about", "projects") */
    const id = entry.target.getAttribute('id');

    /* Find the nav link whose href matches: href="#about" */
    const matchingLink = document.querySelector(`.nav__link[href="#${id}"]`);
    if (!matchingLink) return;

    /* Remove .active from ALL nav links first */
    document.querySelectorAll('.nav__link').forEach(link => {
      link.classList.remove('active');
    });

    /* Then add .active only to the matching one */
    matchingLink.classList.add('active');
  });

}, observerOptions);

/* Tell the observer to watch each section */
sections.forEach(section => sectionObserver.observe(section));


/* ============================================================
   5. TYPING ANIMATION — HERO ROLE
   ============================================================
   This "types" the text "Frontend Developer" letter by letter,
   simulating a terminal cursor typing in real time.

 */
const roleText = 'Frontend Developer';

/* Clear any existing content (there's none, but good practice) */
roleEl.textContent = '';

/*
  Create the blinking cursor: <span class="cursor"></span>
  The .cursor class in CSS gives it its appearance and blink animation.
*/
const cursorSpan = document.createElement('span');
cursorSpan.classList.add('cursor');
roleEl.appendChild(cursorSpan);

/* Track which character we're on */
let charIndex = 0;

/*
  setInterval returns an ID number. We store it in typingInterval
  so we can pass it to clearInterval() later to stop the animation.
*/
const typingInterval = setInterval(() => {

  if (charIndex < roleText.length) {
    /*
      Insert the next character as a text node, positioned BEFORE the cursor.
      We use a text node (not innerHTML) to avoid any XSS security issues
      and because it's the correct way to insert plain text into the DOM.
    */
    roleEl.insertBefore(
      document.createTextNode(roleText[charIndex]),
      cursorSpan
    );
    charIndex++;
  } else {
    /* All characters typed — stop the interval */
    clearInterval(typingInterval);

    /*
      Optional: after a delay, start a subtle cursor fade-out.
      This removes the cursor 3 seconds after typing completes
      so it doesn't blink forever and distract from the content.
    */
    setTimeout(() => {
      cursorSpan.style.transition = 'opacity 0.6s ease';
      cursorSpan.style.opacity = '0';
      setTimeout(() => cursorSpan.remove(), 700);
    }, 3000);
  }

}, 90); /* 90ms between each character — adjust this to type faster or slower */


/* ============================================================
   6. FOOTER — CURRENT YEAR
   ============================================================
 */
const footerYear = document.getElementById('footerYear');
if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}


/* ============================================================
   7. CONTACT FORM — VALIDATION & SUBMISSION
   ============================================================
 */
const contactForm  = document.getElementById('contactForm');
const submitBtn    = document.getElementById('submitBtn');
const formSuccess  = document.getElementById('formSuccess');

/* Individual field references */
const nameInput    = document.getElementById('name');
const emailInput   = document.getElementById('email');
const messageInput = document.getElementById('message');

/* Error span references */
const nameError    = document.getElementById('nameError');
const emailError   = document.getElementById('emailError');
const messageError = document.getElementById('messageError');

function showError(input, errorEl, message) {
  input.classList.add('invalid');
  errorEl.textContent = message;
  errorEl.classList.add('visible');
}

function clearError(input, errorEl) {
  input.classList.remove('invalid');
  errorEl.classList.remove('visible');
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    /*
      e.preventDefault() stops the browser's default form submission
      behaviour (navigating to the action URL). We take over from here.
    */
    e.preventDefault();

    /* Clear all previous errors first */
    clearError(nameInput,    nameError);
    clearError(emailInput,   emailError);
    clearError(messageInput, messageError);

    /* Trim whitespace from inputs before validating */
    const nameVal    = nameInput.value.trim();
    const emailVal   = emailInput.value.trim();
    const messageVal = messageInput.value.trim();

    /* Track whether the form is valid */
    let isValid = true;

    /* Validate name */
    if (!nameVal) {
      showError(nameInput, nameError, 'Please enter your name.');
      isValid = false;
    }

    /* Validate email */
    if (!emailVal) {
      showError(emailInput, emailError, 'Please enter your email address.');
      isValid = false;
    } else if (!validateEmail(emailVal)) {
      showError(emailInput, emailError, 'Please enter a valid email address.');
      isValid = false;
    }

    /* Validate message */
    if (!messageVal) {
      showError(messageInput, messageError, 'Please write a message.');
      isValid = false;
    } else if (messageVal.length < 10) {
      showError(messageInput, messageError, 'Message is too short (min 10 characters).');
      isValid = false;
    }

    /* Stop here if any field failed validation */
    if (!isValid) return;

    /*
      If all fields are valid, submit the form.
      We disable the button and change its text to give feedback.
    */
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
    
      const response = await fetch(contactForm.action, {
        method:  'POST',
        body:    new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        /* Success — show the success message, reset the form */
        formSuccess.classList.add('visible');
        contactForm.reset();
        submitBtn.textContent = 'Message Sent!';
      } else {
        /* Server responded but with an error */
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Send Message';
        alert('Something went wrong. Please try emailing me directly.');
      }

    } catch (error) {
      /*
        catch block runs if fetch itself fails (e.g. no internet connection).
        The error parameter holds details about what went wrong.
      */
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Send Message';
      alert('Could not send message. Please email me directly at nifemidev443@gmail.com');
    }
  });
}
