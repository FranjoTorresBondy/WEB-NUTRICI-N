// Cursor aura
const aura = document.getElementById('cursorAura');
document.addEventListener('mousemove', e => {
  aura.style.left = e.clientX + 'px';
  aura.style.top  = e.clientY + 'px';
}, { passive: true });

// Navbar scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// Mobile burger
const burger    = document.getElementById('burger');
const navDrawer = document.getElementById('navDrawer');
burger.addEventListener('click', () => {
  navDrawer.classList.toggle('open');
});
navDrawer.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navDrawer.classList.remove('open'));
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
  });
});

// Reveal on scroll
const revealObs = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 100);
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('[data-reveal]').forEach(el => revealObs.observe(el));

// Geo parallax (hero)
const geo = document.querySelector('.hero-geo');
if (geo) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY * 0.04;
    geo.style.transform = `translate(-50%, calc(-50% + ${y}px)) rotate(${y * 0.4}deg)`;
  }, { passive: true });
}

// Parallax en imágenes — hero bg, sobre mí y galería
(function initParallax() {
  const items = [];

  // Hero background full-bleed
  const heroBg = document.querySelector('.hero-bg img');
  if (heroBg) items.push({ el: heroBg, speed: 0.12, scaleBase: 1.06, container: document.querySelector('.hero') });

  // Sobre mí
  const mainImg = document.querySelector('.photo-main img');
  if (mainImg) items.push({ el: mainImg, speed: 0.05, scaleBase: 1.06, container: mainImg.closest('.photo-main') });

  // Galería
  document.querySelectorAll('.gal-cell img').forEach((img, i) => {
    items.push({ el: img, speed: 0.04 + i * 0.006, scaleBase: 1.08, container: img.closest('.gal-cell') });
  });

  function applyParallax() {
    items.forEach(({ el, speed, scaleBase, container }) => {
      const rect = container.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const viewCenter = window.innerHeight / 2;
      const delta = (centerY - viewCenter) * speed;
      el.style.transform = `scale(${scaleBase}) translateY(${delta}px)`;
    });
  }

  window.addEventListener('scroll', applyParallax, { passive: true });
  applyParallax();
})();

// Contact form
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const orig = btn.innerHTML;
  btn.innerHTML = '✓ Mensaje enviado — te respondo pronto';
  btn.style.background = '#2a4a00';
  btn.style.color = '#c8ff88';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = orig;
    btn.style.background = '';
    btn.style.color = '';
    btn.disabled = false;
    e.target.reset();
  }, 4000);
});
