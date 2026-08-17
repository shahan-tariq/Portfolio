document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Like / Unlike engagement widget ----------
// Edit this message any time — it's shown when someone clicks "Like".
const LIKE_MESSAGE = "Thank you! 🎉 Do you want to increase your engagement, or run ads for your brand?";

const engageBox = document.getElementById('engageBox');
const likeBtn = document.getElementById('likeBtn');
const unlikeBtn = document.getElementById('unlikeBtn');
const engageToast = document.getElementById('engageToast');
let toastTimer = null;

function showToast(message) {
  engageToast.textContent = message;
  engageToast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    engageToast.classList.remove('show');
  }, 6000);
}

if (likeBtn) {
  likeBtn.addEventListener('click', () => {
    likeBtn.classList.add('liked');
    likeBtn.querySelector('span').textContent = 'Liked';
    showToast(LIKE_MESSAGE);
  });
}

// Unlike button sits calmly next to Like until you get close — then it breaks
// free and roams the whole page, always dodging the cursor/finger and keeping
// its distance from Like. Uses Pointer Events so it works the same on desktop
// (mouse), Android (touch), and iOS (touch).
if (unlikeBtn && likeBtn) {
  const DODGE_RADIUS = 90;        // how close the pointer can get before it flees
  const MIN_DIST_FROM_LIKE = 220; // how far it must stay from the Like button
  const EDGE_MARGIN = 20;
  const TOP_MARGIN = 90;   // keep clear of the fixed nav
  const BOTTOM_MARGIN = 30;

  let unlocked = false;

  function randomSpot() {
    const btnW = unlikeBtn.offsetWidth || 110;
    const btnH = unlikeBtn.offsetHeight || 44;
    const vw = window.innerWidth;
    const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    const maxX = Math.max(vw - btnW - EDGE_MARGIN, EDGE_MARGIN);
    const maxY = Math.max(vh - btnH - BOTTOM_MARGIN, TOP_MARGIN);
    const x = EDGE_MARGIN + Math.random() * (maxX - EDGE_MARGIN);
    const y = TOP_MARGIN + Math.random() * (maxY - TOP_MARGIN);
    return { x, y };
  }

  function moveUnlikeButton() {
    const likeRect = likeBtn.getBoundingClientRect();
    const likeCenterX = likeRect.left + likeRect.width / 2;
    const likeCenterY = likeRect.top + likeRect.height / 2;

    let spot = randomSpot();
    let attempts = 0;
    while (
      Math.hypot(spot.x - likeCenterX, spot.y - likeCenterY) < MIN_DIST_FROM_LIKE &&
      attempts < 25
    ) {
      spot = randomSpot();
      attempts++;
    }

    unlikeBtn.style.left = `${spot.x}px`;
    unlikeBtn.style.top = `${spot.y}px`;
  }

  // First time the pointer gets close: pin the button exactly where it
  // currently sits (so there's no visual jump), switch it to free-roam mode,
  // then let it flee to a random spot.
  function unlockAndFlee() {
    if (unlocked) return;
    const rect = unlikeBtn.getBoundingClientRect();
    unlikeBtn.style.left = `${rect.left}px`;
    unlikeBtn.style.top = `${rect.top}px`;
    unlikeBtn.classList.add('roaming');
    unlocked = true;
    requestAnimationFrame(() => moveUnlikeButton());
  }

  function handlePointer(x, y) {
    const btnRect = unlikeBtn.getBoundingClientRect();
    const btnCenterX = btnRect.left + btnRect.width / 2;
    const btnCenterY = btnRect.top + btnRect.height / 2;
    const dist = Math.hypot(x - btnCenterX, y - btnCenterY);
    if (dist < DODGE_RADIUS) {
      if (!unlocked) {
        unlockAndFlee();
      } else {
        moveUnlikeButton();
      }
      return true;
    }
    return false;
  }

  // Pointer Events cover mouse, touch, and pen in one API — this is what
  // makes the dodge behave consistently across desktop, Android, and iOS.
  document.addEventListener('pointermove', (e) => {
    handlePointer(e.clientX, e.clientY);
  }, { passive: true });

  // Touch devices tap instead of hover, so treat pointerdown the same way —
  // and cancel the tap so it can't land a click while the button flees.
  document.addEventListener('pointerdown', (e) => {
    const dodged = handlePointer(e.clientX, e.clientY);
    if (dodged && e.pointerType === 'touch') {
      e.preventDefault();
    }
  }, { passive: false });

  window.addEventListener('resize', () => {
    if (unlocked) moveUnlikeButton();
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      if (unlocked) moveUnlikeButton();
    });
  }
}

// ---------- Hero title: split into letters for staggered entrance ----------
document.querySelectorAll('.split-letters').forEach(el => {
  const text = el.textContent.trim();
  el.textContent = '';
  let i = 0;
  text.split('').forEach(ch => {
    const span = document.createElement('span');
    if (ch === ' ') {
      span.className = 'letter space';
      span.innerHTML = '&nbsp;';
    } else {
      span.className = 'letter';
      span.textContent = ch;
    }
    span.style.setProperty('--i', i);
    el.appendChild(span);
    i++;
  });
});

// ---------- Hero role: typewriter effect ----------
document.querySelectorAll('.typewriter').forEach(el => {
  const fullText = el.dataset.text || el.textContent.trim();
  el.textContent = '';
  const cursor = document.createElement('span');
  cursor.className = 'type-cursor';
  cursor.textContent = '\u00A0';

  let i = 0;
  const speed = 45;
  function typeNext() {
    if (i <= fullText.length) {
      el.textContent = fullText.slice(0, i);
      el.appendChild(cursor);
      i++;
      setTimeout(typeNext, speed);
    }
  }
  setTimeout(typeNext, 900); // start after title letters have mostly animated in
});

// ---------- Section titles: split into words for scroll-triggered stagger ----------
function wrapWords(el) {
  const segments = el.innerHTML.split(/<br\s*\/?>/i);
  let counter = 0;
  const wrapped = segments.map(segment => {
    return segment
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(word => {
        const markup = `<span class="word-wrap"><span class="word" style="--i:${counter}">${word}</span></span>`;
        counter++;
        return markup;
      })
      .join(' ');
  });
  el.innerHTML = wrapped.join('<br>');
}
document.querySelectorAll('.split-words').forEach(wrapWords);

const wordObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      wordObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.split-words').forEach(el => wordObserver.observe(el));

// Dark mode toggle
const themeToggle = document.getElementById('themeToggle');
const rootEl = document.documentElement;

function setTheme(theme) {
  if (theme === 'dark') {
    rootEl.setAttribute('data-theme', 'dark');
  } else {
    rootEl.removeAttribute('data-theme');
  }
  themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  localStorage.setItem('theme', theme);
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark = rootEl.getAttribute('data-theme') === 'dark';
    setTheme(isDark ? 'light' : 'dark');
  });
  // Sync aria-pressed with whatever the inline head script already applied
  themeToggle.setAttribute('aria-pressed', rootEl.getAttribute('data-theme') === 'dark' ? 'true' : 'false');
}

// Nav background on scroll
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

// Animate dashboard bars with staggered delay
document.querySelectorAll('.dash-bar').forEach((bar, i) => {
  bar.style.setProperty('--i', i);
});

// Count-up numbers for the dashboard card
function animateCount(el) {
  const target = parseFloat(el.dataset.count);
  const decimals = parseInt(el.dataset.decimals || '0', 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = target * eased;
    el.textContent = (decimals ? value.toFixed(decimals) : Math.floor(value).toLocaleString()) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const dashCard = document.getElementById('dashCard');
let counted = false;
const dashObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !counted) {
      counted = true;
      document.querySelectorAll('.dash-value').forEach(animateCount);
      dashObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
if (dashCard) dashObserver.observe(dashCard);
