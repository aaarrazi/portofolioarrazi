// Portfolio interaksi: kursor, progress, reveal, tilt 3D, magnetik, objek 3D, tab bar mobile.
document.addEventListener('DOMContentLoaded', () => {
  setupNavbar();
  setupSmoothScroll();
  setupProjectDots();
  setupRailToggle();
  setupScrollAnimations();
  setupScrollProgress();
  setupActiveNav();
  setupCursor();
  setupTilt();
  setupMagnetic();
  setupProjectSlider();
  setupContactForm();
  setupHero3D();
});

function setupNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// Toggle tampil/sembunyi navigation rail (khusus mobile, preferensi disimpan).
function setupRailToggle() {
  const rail = document.querySelector('.mobile-rail');
  const toggle = document.getElementById('railToggle');
  if (!rail || !toggle) return;
  const apply = (collapsed) => {
    rail.classList.toggle('collapsed', collapsed);
    toggle.setAttribute('aria-expanded', String(!collapsed));
    toggle.setAttribute('aria-label', collapsed ? 'Tampilkan navigasi' : 'Sembunyikan navigasi');
  };
  let saved = false;
  try { saved = localStorage.getItem('rail-collapsed') === '1'; } catch (err) { saved = false; }
  apply(saved);
  toggle.addEventListener('click', () => {
    const collapsed = !rail.classList.contains('collapsed');
    apply(collapsed);
    try { localStorage.setItem('rail-collapsed', collapsed ? '1' : '0'); } catch (err) { /* abaikan */ }
  });
}

// Titik navigasi carousel proyek (khusus mobile, disembunyikan di desktop via CSS).
function setupProjectDots() {
  const grid = document.getElementById('projectsGrid');
  const dotsWrap = document.getElementById('projectDots');
  if (!grid || !dotsWrap) return;
  const cards = Array.from(grid.children);
  if (!cards.length) return;
  cards.forEach((card, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', 'Lihat proyek ' + (i + 1));
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => {
      grid.scrollTo({ left: card.offsetLeft - grid.offsetLeft, behavior: 'smooth' });
    });
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);
  let ticking = false;
  grid.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const cardW = grid.scrollWidth / cards.length;
      const idx = Math.min(cards.length - 1, Math.max(0, Math.round(grid.scrollLeft / cardW)));
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      ticking = false;
    });
  }, { passive: true });
}

function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (!id || id.length < 2) return;
      const target = document.querySelector(id);
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
}

let observer;
function setupScrollAnimations() {
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal, .fade-in').forEach(el => observer.observe(el));
}

function setupScrollProgress() {
  const bar = document.getElementById('scrollProgressBar');
  if (!bar) return;
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function setupActiveNav() {
  const links = document.querySelectorAll('[data-nav]');
  const sections = [...links].map(a => document.querySelector('#' + a.dataset.nav)).filter(Boolean);
  if (!sections.length || !('IntersectionObserver' in window)) return;
  const navObs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        links.forEach(a => a.classList.toggle('active', a.dataset.nav === en.target.id));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => navObs.observe(s));
}

// Kursor kustom: dot mengikuti langsung, ring mengikuti dengan lerp.
function setupCursor() {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring || window.matchMedia('(hover: none)').matches) return;
  let x = -100, y = -100, rx = -100, ry = -100;
  window.addEventListener('mousemove', (e) => {
    x = e.clientX; y = e.clientY;
    dot.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
  }, { passive: true });
  (function loop() {
    rx += (x - rx) * 0.16; ry += (y - ry) * 0.16;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('a, button, .tilt, input, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

// Efek tilt 3D pada kartu (dinonaktifkan di touch / reduced motion).
function setupTilt() {
  if (window.matchMedia('(hover: none)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.tilt').forEach(card => {
    let raf = null;
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.transform = `perspective(900px) rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 10).toFixed(2)}deg) translateY(-4px)`;
      });
    });
    card.addEventListener('mouseleave', () => {
      if (raf) cancelAnimationFrame(raf);
      card.style.transform = '';
    });
  });
}

// Tombol magnetik: tertarik ringan ke kursor.
function setupMagnetic() {
  if (window.matchMedia('(hover: none)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      btn.style.transform = `translate(${(dx * 0.12).toFixed(1)}px, ${(dy * 0.18).toFixed(1)}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

function setupProjectSlider() {
  const grid = document.getElementById('projectsGrid');
  const prevBtn = document.getElementById('projectPrevBtn');
  const nextBtn = document.getElementById('projectNextBtn');
  if (!grid || !prevBtn || !nextBtn) return;
  const update = () => {
    const max = grid.scrollWidth - grid.clientWidth;
    prevBtn.disabled = grid.scrollLeft <= 0;
    nextBtn.disabled = grid.scrollLeft >= max - 2;
  };
  const step = (dir) => {
    const cards = Array.from(grid.children);
    if (!cards.length) return 0;
    const i = cards.findIndex(c => c.offsetLeft + c.offsetWidth > grid.scrollLeft + 1);
    const idx = dir > 0 ? Math.min(cards.length - 1, i === -1 ? cards.length - 1 : i + 1) : Math.max(0, i === -1 ? 0 : i - 1);
    return cards[idx].offsetLeft;
  };
  prevBtn.addEventListener('click', () => grid.scrollTo({ left: Math.max(0, step(-1)), behavior: 'smooth' }));
  nextBtn.addEventListener('click', () => grid.scrollTo({ left: step(1), behavior: 'smooth' }));
  grid.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

function setupContactForm() {
  const form = document.getElementById('contactForm');
  const notification = document.getElementById('formNotification');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('formName').value.trim();
    const email = document.getElementById('formEmail').value.trim();
    const message = document.getElementById('formMessage').value.trim();
    if (!name || !email || !message) { showNotification('Semua kolom wajib diisi.', 'error'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showNotification('Format email tidak valid.', 'error'); return; }
    const to = 'arrazisyakir@gmail.com';
    const subject = encodeURIComponent('Pesan Portofolio dari ' + name);
    const body = encodeURIComponent('Nama: ' + name + '\nEmail: ' + email + '\n\n' + message);
    window.location.href = 'mailto:' + to + '?subject=' + subject + '&body=' + body;
    showNotification('Membuka aplikasi email Anda. Terima kasih!', 'success');
    form.reset();
  });
  function showNotification(text, type) {
    if (!notification) return;
    notification.textContent = text;
    notification.className = 'form-notification ' + type;
    clearTimeout(showNotification._t);
    showNotification._t = setTimeout(() => { notification.className = 'form-notification'; }, 5000);
  }
}

// Objek 3D interaktif: wireframe monochrome yang mengikuti mouse + scroll.
// Fallback 2D bila Three.js gagal dimuat (tanpa dependensi tambahan).
function setupHero3D() {
  const canvas = document.getElementById('hero3d');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let mx = 0, my = 0, scrollY = 0;
  window.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  const startThree = () => {
    if (!window.THREE) { startFallback(); return; }
    try {
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
      camera.position.z = 7;
      const group = new THREE.Group();
      scene.add(group);
      const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.28 });
      const matDim = new THREE.LineBasicMaterial({ color: 0x8b8b93, transparent: true, opacity: 0.22 });
      const torus = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.TorusKnotGeometry(1.5, 0.42, 140, 18)), mat);
      const ico = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.6, 1)), matDim);
      group.add(torus); group.add(ico);
      const dots = new THREE.Points(
        new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(
          Array.from({ length: 240 }, () => [(Math.random() - 0.5) * 16, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6]).flat(), 3)),
        new THREE.PointsMaterial({ color: 0xffffff, size: 0.03, transparent: true, opacity: 0.5 })
      );
      scene.add(dots);
      const resize = () => {
        const w = canvas.clientWidth || canvas.parentElement.clientWidth;
        const h = canvas.clientHeight || canvas.parentElement.clientHeight;
        renderer.setSize(w, h, false);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      window.addEventListener('resize', resize);
      resize();
      group.position.x = 2.2;
      const onResizePos = () => { group.position.x = window.innerWidth < 1024 ? 0 : 2.2; group.position.y = window.innerWidth < 1024 ? 0.4 : 0; };
      window.addEventListener('resize', onResizePos);
      onResizePos();
      let t = 0;
      (function animate() {
        t += 0.0035;
        torus.rotation.x = t * 0.9 + my * 0.5;
        torus.rotation.y = t * 1.2 + mx * 0.7;
        ico.rotation.x = -t * 0.4 + my * 0.25;
        ico.rotation.y = t * 0.5 + mx * 0.4;
        dots.rotation.y = t * 0.25 + mx * 0.08;
        group.position.y += (((window.innerWidth < 1024 ? 0.4 : 0) - scrollY * 0.0012) - group.position.y) * 0.05;
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      })();
    } catch (err) { startFallback(); }
  };

  function startFallback() {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', resize);
    resize();
    let t = 0;
    (function draw() {
      t += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width * (canvas.width < 800 ? 0.5 : 0.72);
      const cy = canvas.height * 0.42;
      ctx.strokeStyle = 'rgba(255,255,255,.25)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const r = 60 + i * 46 + Math.sin(t + i) * 6 + mx * 12;
        ctx.ellipse(cx, cy, r * 1.35, r * (0.75 + i * 0.08), t * 0.25 + my * 0.4 + i * 0.5, 0, Math.PI * 2);
        ctx.stroke();
      }
      requestAnimationFrame(draw);
    })();
  }

  if (window.THREE) startThree();
  else {
    let tries = 0;
    const wait = setInterval(() => {
      tries++;
      if (window.THREE || tries > 40) { clearInterval(wait); startThree(); }
    }, 150);
  }
}
