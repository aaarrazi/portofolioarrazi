// Portfolio Static Script — tanpa backend/API, data sudah baked di HTML.

document.addEventListener('DOMContentLoaded', () => {
  setupNavbar();
  setupMobileMenu();
  setupSmoothScroll();
  setupScrollAnimations();
  setupProjectSlider();
  setupContactForm();
});

// --- Navbar Scroll Effect ---
function setupNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// --- Mobile Menu (Radial Wheel seperti referensi) ---
function setupMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const overlay = document.getElementById('radialOverlay');
  const wheel = document.getElementById('radialWheel');
  const title = document.getElementById('radialTitle');
  if (!hamburger || !navLinks || !overlay || !wheel) return;

  const ICONS = {
    '#hero': 'fas fa-home',
    '#about': 'fas fa-user',
    '#skills': 'fas fa-code',
    '#projects': 'fas fa-folder-open',
    '#experience': 'fas fa-briefcase',
    '#certificates': 'fas fa-certificate',
    '#contact': 'fas fa-envelope'
  };

  const links = Array.from(navLinks.querySelectorAll('a'));
  const total = links.length;

  // Bangun tombol wheel dari <ul> yang sama (satu sumber data)
  links.forEach((link, i) => {
    const href = link.getAttribute('href');
    const label = link.textContent.trim();
    const angle = -90 + (i + 0.5) * (360 / total);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'wheel-item';
    btn.setAttribute('role', 'menuitem');
    btn.style.setProperty('--a', angle + 'deg');
    btn.style.transitionDelay = (0.04 * i) + 's';
    btn.title = label;
    btn.setAttribute('aria-label', label);
    btn.innerHTML = '<span class="wheel-icon"><i class="' + (ICONS[href] || 'fas fa-circle') + '"></i></span>'
      + '<span class="wheel-label">' + label + '</span>';
    btn.addEventListener('mouseenter', () => { if (title) title.textContent = label; });
    btn.addEventListener('focus', () => { if (title) title.textContent = label; });
    btn.addEventListener('click', () => {
      closeMenu();
      const target = document.querySelector(href);
      if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 60);
      else window.location.hash = href;
    });
    wheel.appendChild(btn);
  });

  const openMenu = () => {
    overlay.classList.add('active');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
    if (title) title.textContent = 'Menu';
  };

  const closeMenu = () => {
    overlay.classList.remove('active');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
  };

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (overlay.classList.contains('active')) closeMenu();
    else openMenu();
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // Jika resize ke desktop, pastikan overlay tertutup
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMenu();
  });
}

// --- Smooth Scroll ---
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId.length < 2) return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// --- Scroll Animations ---
let observer;

function setupScrollAnimations() {
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
  });
}

function observeNewElements() {
  if (!observer) return;
  document.querySelectorAll('.fade-in:not(.visible)').forEach(el => {
    observer.observe(el);
  });
}

// --- Project Slider Nav (opsional, tetap kompatibel dengan CSS grid) ---
function setupProjectSlider() {
  const grid = document.getElementById('projectsGrid');
  const prevBtn = document.getElementById('projectPrevBtn');
  const nextBtn = document.getElementById('projectNextBtn');

  if (!grid || !prevBtn || !nextBtn) return;

  const updateNavButtons = () => {
    const maxScrollLeft = grid.scrollWidth - grid.clientWidth;
    prevBtn.disabled = grid.scrollLeft <= 0;
    nextBtn.disabled = grid.scrollLeft >= maxScrollLeft - 2;
    prevBtn.style.opacity = prevBtn.disabled ? '0.4' : '1';
    nextBtn.style.opacity = nextBtn.disabled ? '0.4' : '1';
    prevBtn.style.cursor = prevBtn.disabled ? 'not-allowed' : 'pointer';
    nextBtn.style.cursor = nextBtn.disabled ? 'not-allowed' : 'pointer';
  };

  const getTargetCardLeft = (direction) => {
    const cards = Array.from(grid.children);
    if (!cards.length) return 0;

    const currentIndex = cards.findIndex(card => card.offsetLeft + card.offsetWidth > grid.scrollLeft + 1);
    const index = direction > 0
      ? Math.min(cards.length - 1, currentIndex === -1 ? cards.length - 1 : currentIndex + 1)
      : Math.max(0, currentIndex === -1 ? cards.length - 1 : currentIndex - 1);

    return cards[index].offsetLeft;
  };

  prevBtn.addEventListener('click', () => {
    const targetLeft = getTargetCardLeft(-1);
    grid.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    const targetLeft = getTargetCardLeft(1);
    grid.scrollTo({ left: Math.min(grid.scrollWidth, targetLeft), behavior: 'smooth' });
  });

  grid.addEventListener('scroll', updateNavButtons);
  window.addEventListener('resize', updateNavButtons);
  updateNavButtons();
}

// --- Contact Form (statis: via mailto, tanpa backend) ---
function setupContactForm() {
  const form = document.getElementById('contactForm');
  const notification = document.getElementById('formNotification');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('formName').value.trim();
    const email = document.getElementById('formEmail').value.trim();
    const message = document.getElementById('formMessage').value.trim();

    if (!name || !email || !message) {
      showNotification('Semua kolom wajib diisi!', 'error');
      return;
    }

    const to = 'arrazisyakir@gmail.com';
    const subject = encodeURIComponent('Pesan Portofolio dari ' + name);
    const body = encodeURIComponent('Nama: ' + name + '\nEmail: ' + email + '\n\n' + message);
    window.location.href = 'mailto:' + to + '?subject=' + subject + '&body=' + body;

    showNotification('Membuka aplikasi email Anda untuk mengirim pesan. Terima kasih!', 'success');
    form.reset();
  });

  function showNotification(text, type) {
    if (!notification) return;
    notification.textContent = text;
    notification.className = 'form-notification ' + type;
    setTimeout(() => {
      notification.className = 'form-notification';
    }, 5000);
  }
}
