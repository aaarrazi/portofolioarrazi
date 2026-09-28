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

// --- Mobile Menu ---
function setupMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
    });
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
