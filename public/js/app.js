/**
 * Bhagavad Gita As It Is - Landing Page Client Controller
 * Handles animated hero smartphone showcase, interactive screenshots, theme switching, 
 * dynamic metadata for Android & iOS, and dual QR Codes
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initHeroPhoneSlideshow();
  initScreenshotsGallery();
  fetchPackageMetadata();
  generateDualQrCodes();
});

/* -------------------------------------------------------------------------
   1. Theme Toggle (Light / Dark Mode)
   ------------------------------------------------------------------------- */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (!toggleBtn) return;

  const savedTheme = localStorage.getItem('gita_site_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme === 'dark');
  } else {
    updateThemeIcon(prefersDark.matches);
  }

  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 
      (prefersDark.matches ? 'dark' : 'light');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('gita_site_theme', newTheme);
    updateThemeIcon(newTheme === 'dark');
  });

  prefersDark.addEventListener('change', (e) => {
    if (!localStorage.getItem('gita_site_theme')) {
      updateThemeIcon(e.matches);
    }
  });
}

function updateThemeIcon(isDark) {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (!toggleBtn) return;
  toggleBtn.textContent = isDark ? '☀️' : '🌙';
  toggleBtn.setAttribute('title', isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme');
  toggleBtn.setAttribute('aria-label', isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme');
}

/* -------------------------------------------------------------------------
   2. Hero Phone Animated Slideshow (Changing Images + Synchronized Badges)
   ------------------------------------------------------------------------- */
const HERO_SLIDES = [
  {
    index: 0,
    name: '1. Sacred Verse Reader',
    topCard: { icon: 'ॐ', title: 'Authentic Sanskrit', sub: 'With word-for-word synonyms' },
    bottomCard: { icon: '📖', title: '4 Reading Modes', sub: 'Parchment, Sepia, Paper, Dark' }
  },
  {
    index: 1,
    name: '2. Chapters Hub & Continuity',
    topCard: { icon: '📜', title: '18 Canonical Chapters', sub: '700 canonical slokas complete' },
    bottomCard: { icon: '⚡', title: 'Continue Reading', sub: 'One-tap resume your progress' }
  },
  {
    index: 2,
    name: '3. Reading Aesthetics & Font',
    topCard: { icon: '🔤', title: 'Text Size Scaler', sub: 'Fluid font slider from 12 to 28pt' },
    bottomCard: { icon: '🎨', title: 'Day & Night Modes', sub: 'Light, Dark, and System theme' }
  },
  {
    index: 3,
    name: '4. Sacred Dedication',
    topCard: { icon: '🙏', title: 'Srila Prabhupada', sub: 'Founder-Acharya ISKCON & BBT' },
    bottomCard: { icon: '🛡️', title: 'Authorized Edition', sub: 'Pure disciplic parampara' }
  },
  {
    index: 4,
    name: '5. Intelligent Scripture Search',
    topCard: { icon: '🔍', title: 'Coordinate Finder', sub: 'Direct verse jump (e.g. 1.1)' },
    bottomCard: { icon: '✍️', title: 'Devanagari & Roman', sub: 'Phonetic search without diacritics' }
  }
];

function initHeroPhoneSlideshow() {
  const container = document.getElementById('hero-phone-container');
  const screen = document.getElementById('hero-phone-screen');
  const slides = document.querySelectorAll('.phone-slide');
  const indicators = document.querySelectorAll('.indicator-bar');
  const statusName = document.getElementById('hero-current-screen-name');
  const prevBtn = document.getElementById('hero-phone-prev');
  const nextBtn = document.getElementById('hero-phone-next');

  if (!container || slides.length === 0) return;

  let currentIndex = 0;
  let autoplayTimer = null;
  let isPaused = false;
  const SLIDE_DURATION = 4000; // 4 seconds per slide

  function goToSlide(targetIndex) {
    if (targetIndex < 0) targetIndex = slides.length - 1;
    if (targetIndex >= slides.length) targetIndex = 0;
    currentIndex = targetIndex;

    const data = HERO_SLIDES[currentIndex];

    // 1. Update active slide image
    slides.forEach((slide, idx) => {
      slide.classList.toggle('active', idx === currentIndex);
    });

    // 2. Update indicator bars
    indicators.forEach((ind, idx) => {
      ind.classList.toggle('active', idx === currentIndex);
    });

    // 3. Update status label
    if (statusName) {
      statusName.textContent = data.name;
    }
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      if (!isPaused) {
        goToSlide(currentIndex + 1);
      }
    }, SLIDE_DURATION);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  // Hover to pause
  container.addEventListener('mouseenter', () => {
    isPaused = true;
  });

  container.addEventListener('mouseleave', () => {
    isPaused = false;
  });

  // Tap on phone screen to advance
  if (screen) {
    screen.addEventListener('click', () => {
      goToSlide(currentIndex + 1);
      startAutoplay();
    });
  }

  // Next / Previous buttons
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goToSlide(currentIndex + 1);
      startAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goToSlide(currentIndex - 1);
      startAutoplay();
    });
  }

  // Click on indicators
  indicators.forEach(ind => {
    ind.addEventListener('click', () => {
      const idx = parseInt(ind.getAttribute('data-index'), 10);
      goToSlide(idx);
      startAutoplay();
    });
  });

  // Connect 5-screenshot gallery cards to hero phone
  const screenshotCards = document.querySelectorAll('.app-screenshot-card');
  screenshotCards.forEach((card) => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.getAttribute('data-index'), 10);
      if (!isNaN(idx)) {
        goToSlide(idx);
        startAutoplay();
        if (window.innerWidth <= 992) {
          container.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  });

  // Start initial rotation
  goToSlide(0);
  startAutoplay();
}

/* -------------------------------------------------------------------------
   3. Interactive App Experience Showcase (6 Authentic Screens)
   ------------------------------------------------------------------------- */
const EXPERIENCE_SCREENS = [
  {
    key: 'opening',
    num: '01',
    badge: 'SCREEN 01 • SACRED WELCOME',
    title: 'Sacred Opening Gateway',
    image: 'images/screen_opening.png?v=1',
    desc: 'The official sacred gateway to Bhagavad-gītā As It Is. Featuring the consecrated emblem, timeless title inscription, traditional Vedic ornamental motifs, and sacred dedication to Founder-Acharya A.C. Bhaktivedanta Swami Srila Prabhupada.',
    bullets: [
      'Official consecrated scripture emblem in sacred crimson',
      'Timeless scripture title and philosophical invocation',
      'Traditional Vedic ornamental divider motif',
      'Sacred dedication to Founder-Acharya Srila Prabhupada'
    ]
  },
  {
    key: 'reader',
    num: '02',
    badge: 'SCREEN 02 • SACRED IMMERSION',
    title: 'Verse Reader Experience',
    image: 'images/screen_reader.png?v=5',
    desc: 'Immerse yourself in original Sanskrit Devanagari script, Roman diacritical transliterations, word-for-word synonyms, and the complete 1972 purports by Srila Prabhupada. Navigate effortlessly with bottom quick-action controls.',
    bullets: [
      'Devanagari script with Roman pronunciation guide',
      'Complete grammatical word-by-word synonyms',
      'Full, authorized Bhaktivedanta purports',
      'Quick chapter & verse picker at your fingertips'
    ]
  },
  {
    key: 'home',
    num: '03',
    badge: 'SCREEN 03 • SCRIPTURE NAVIGATION',
    title: '18 Canonical Chapters Hub',
    image: 'images/screen_home.png?v=5',
    desc: 'Browse the complete index of all 18 chapters with their traditional Sanskrit titles, English translations, and exact verse totals. Resume your reading journey instantly with the prominent "Continue" card.',
    bullets: [
      'All 18 canonical chapters clearly indexed',
      'Verse count indicators for each individual chapter',
      'One-tap "Continue" button to resume last read position',
      'Quick access to search, bookmarks, and settings'
    ]
  },
  {
    key: 'settings',
    num: '04',
    badge: 'SCREEN 04 • VISUAL AESTHETICS',
    title: 'Reading Themes & Typography',
    image: 'images/screen_settings.png?v=5',
    desc: 'Customize your spiritual reading sanctuary for day or night. Slide font size dynamically from 12pt to 28pt with live preview sloka, choose between 4 background aesthetics, and toggle dark mode.',
    bullets: [
      'Dynamic text size slider with live Sanskrit preview',
      '4 Meditative modes: Parchment, Sepia, Paper, and Dark',
      'System-following or manual Light/Dark application theme',
      'Comfortable contrast tuned for long contemplative reading'
    ]
  },
  {
    key: 'about',
    num: '05',
    badge: 'SCREEN 05 • AUTHORIZED TRADITION',
    title: 'Sacred Dedication & Lineage',
    image: 'images/screen_about.png?v=5',
    desc: 'Learn about the unbroken disciplic succession (parampara) through which the Gita is preserved. Read the sacred dedication to Founder-Acharya A.C. Bhaktivedanta Swami Prabhupada and verify canonical statistics.',
    bullets: [
      'Homage to Founder-Acharya Srila Prabhupada',
      'Authorized Bhaktivedanta Book Trust (BBT) attribution',
      'Verification of 18 Chapters and 700 canonical slokas',
      'Release package build metadata and version details'
    ]
  },
  {
    key: 'search',
    num: '06',
    badge: 'SCREEN 06 • RAPID FINDER',
    title: 'Intelligent Scripture Search',
    image: 'images/screen_search.png?v=5',
    desc: 'Find any sloka instantly across the entire scripture. Jump directly by chapter and verse coordinate (e.g. 1.1 or 4.7) or search phonetically without requiring complex diacritical keyboards.',
    bullets: [
      'Instant coordinate jump (e.g., "1.1", "2.47", "18.66")',
      'Searches Devanagari Sanskrit and English translations',
      'Phonetic tolerance for Roman transliteration',
      'One-tap result cards that open directly in the reader'
    ]
  }
];

function initScreenshotsGallery() {
  const tabs = document.querySelectorAll('.screen-tab-btn');
  const deckCards = document.querySelectorAll('.deck-card');
  const spotlightImg = document.getElementById('spotlight-image');
  const spotlightBadge = document.getElementById('spotlight-badge');
  const spotlightTitle = document.getElementById('spotlight-title');
  const spotlightDesc = document.getElementById('spotlight-desc');
  const spotlightBullets = document.getElementById('spotlight-bullets');
  const prevBtn = document.getElementById('spotlight-prev');
  const nextBtn = document.getElementById('spotlight-next');

  if (!spotlightImg && deckCards.length === 0) return;

  let currentIndex = 0;

  function setScreenIndex(targetIndex) {
    if (targetIndex < 0) targetIndex = EXPERIENCE_SCREENS.length - 1;
    if (targetIndex >= EXPERIENCE_SCREENS.length) targetIndex = 0;
    currentIndex = targetIndex;

    const data = EXPERIENCE_SCREENS[currentIndex];
    if (!data) return;

    // 1. Update Tabs
    tabs.forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-screen') === data.key);
    });

    // 2. Update Deck Cards
    deckCards.forEach(card => {
      card.classList.toggle('active', card.getAttribute('data-screen') === data.key);
    });

    // 3. Update Spotlight Image with cross-fade
    if (spotlightImg) {
      spotlightImg.style.opacity = '0';
      spotlightImg.style.transform = 'scale(0.97)';
      setTimeout(() => {
        spotlightImg.src = data.image;
        spotlightImg.alt = data.title;
        spotlightImg.style.opacity = '1';
        spotlightImg.style.transform = 'scale(1)';
      }, 160);
    }

    // 4. Update Editorial Details
    if (spotlightBadge) spotlightBadge.textContent = data.badge;
    if (spotlightTitle) spotlightTitle.textContent = data.title;
    if (spotlightDesc) spotlightDesc.textContent = data.desc;

    // 5. Update Bullets
    if (spotlightBullets) {
      spotlightBullets.innerHTML = data.bullets.map(b => `
        <div class="bullet-item">
          <span class="bullet-check">✓</span>
          <span>${b}</span>
        </div>
      `).join('');
    }
  }

  // Bind Tabs
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const key = tab.getAttribute('data-screen');
      const idx = EXPERIENCE_SCREENS.findIndex(s => s.key === key);
      if (idx !== -1) setScreenIndex(idx);
    });
  });

  // Bind Deck Cards
  deckCards.forEach(card => {
    card.addEventListener('click', () => {
      const key = card.getAttribute('data-screen');
      const idx = EXPERIENCE_SCREENS.findIndex(s => s.key === key);
      if (idx !== -1) setScreenIndex(idx);
    });
  });

  // Bind Arrows
  if (prevBtn) {
    prevBtn.addEventListener('click', () => setScreenIndex(currentIndex - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => setScreenIndex(currentIndex + 1));
  }

  // Keyboard navigation when experience section is in view
  window.addEventListener('keydown', (e) => {
    const section = document.getElementById('experience');
    if (!section) return;
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      if (e.key === 'ArrowLeft') setScreenIndex(currentIndex - 1);
      if (e.key === 'ArrowRight') setScreenIndex(currentIndex + 1);
    }
  });

  // Initialize with Screen 0
  setScreenIndex(0);
}

/* -------------------------------------------------------------------------
   4. Dynamic Package Metadata (Android APK & iOS IPA)
   ------------------------------------------------------------------------- */
async function fetchPackageMetadata() {
  try {
    const res = await fetch('/api/info');
    if (!res.ok) return;
    const data = await res.json();

    // Android Updates
    if (data.android) {
      document.querySelectorAll('.dynamic-android-size').forEach(el => {
        el.textContent = data.android.size || '52.1 MB';
      });
      const shaAndroid = document.getElementById('android-sha256-val');
      if (shaAndroid && data.android.sha256) {
        shaAndroid.textContent = data.android.sha256;
      }
    }

    // iOS Updates
    if (data.ios) {
      document.querySelectorAll('.dynamic-ios-size').forEach(el => {
        el.textContent = data.ios.size || '671 KB';
      });
      const shaIos = document.getElementById('ios-sha256-val');
      if (shaIos && data.ios.sha256) {
        shaIos.textContent = data.ios.sha256;
      }
    }
  } catch (e) {
    console.debug('Could not reach /api/info:', e);
  }
}

/* -------------------------------------------------------------------------
   5. Dual QR Code Generators (Android & iOS)
   ------------------------------------------------------------------------- */
const PRODUCTION_SITE_URL = 'https://gita-flax.vercel.app';

function generateDualQrCodes() {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const baseUrl = isLocal ? PRODUCTION_SITE_URL : (window.location.origin || PRODUCTION_SITE_URL);

  setupQrCode('android-qr-mount', `${baseUrl}/download/android`, 'Scan for Android APK');
  setupQrCode('ios-qr-mount', `${baseUrl}/download/ios`, 'Scan for iOS Package');
}

function setupQrCode(mountId, targetUrl, altText) {
  const container = document.getElementById(mountId);
  if (!container) return;

  const qrImg = document.createElement('img');
  qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(targetUrl)}&color=8B1E1E&bgcolor=FFFFFF&margin=1`;
  qrImg.alt = altText;
  qrImg.width = 120;
  qrImg.height = 120;
  qrImg.loading = 'lazy';

  qrImg.onerror = () => {
    container.innerHTML = `
      <div style="width:120px; height:120px; background:#F2EDE1; border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:6px; text-align:center;">
        <span style="font-size:22px;">📱</span>
        <span style="font-size:10px; font-weight:bold; color:#8B1E1E; margin-top:4px;">Direct Link</span>
      </div>
    `;
  };

  container.appendChild(qrImg);
}

/* -------------------------------------------------------------------------
   6. Installation Guide Tab Switcher (Android / iOS)
   ------------------------------------------------------------------------- */
window.switchInstallTab = function(platform) {
  const androidTab = document.getElementById('tab-inst-android');
  const iosTab = document.getElementById('tab-inst-ios');
  const androidSteps = document.getElementById('android-steps');
  const iosSteps = document.getElementById('ios-steps');

  if (platform === 'ios') {
    androidTab.classList.remove('active');
    iosTab.classList.add('active');
    androidSteps.style.display = 'none';
    iosSteps.style.display = 'grid';
  } else {
    iosTab.classList.remove('active');
    androidTab.classList.add('active');
    iosSteps.style.display = 'none';
    androidSteps.style.display = 'grid';
  }
};

/* -------------------------------------------------------------------------
   7. Download Click Analytics
   ------------------------------------------------------------------------- */
window.trackDownload = function(platform) {
  try {
    fetch(`/api/download-click?platform=${encodeURIComponent(platform || 'android')}`, { method: 'POST' }).catch(() => {});
  } catch (e) {}
};
