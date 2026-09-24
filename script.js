document.documentElement.classList.add('js');

// ===== Mobile menu =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger?.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
document.querySelectorAll('.nav-links a').forEach(a =>
  a.addEventListener('click', () => navLinks.classList.remove('open'))
);

// ===== Animated number counters =====
function animateCounters() {
  document.querySelectorAll('.stat-value[data-target]').forEach(el => {
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    let current = 0;
    const step = target / 60;
    const tick = () => {
      current += step;
      if (current >= target) {
        el.textContent = target.toFixed(decimals);
        return;
      }
      el.textContent = current.toFixed(decimals);
      requestAnimationFrame(tick);
    };
    tick();
  });
}

// ===== Skill bar animation on scroll =====
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.bar i').forEach((bar, i) => {
        setTimeout(() => bar.classList.add('animate'), i * 120);
      });
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.skill-group').forEach(g => barObserver.observe(g));

// ===== Section reveal on scroll =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.section, .hero-stats').forEach(el => {
  revealObserver.observe(el);
});

// ===== Trigger hero counters once loaded =====
window.addEventListener('load', () => {
  setTimeout(animateCounters, 300);
});

// // ===== Contact form (demo handler) =====
// const form = document.getElementById('contactForm');
// form?.addEventListener('submit', (e) => {
//   e.preventDefault();
//   const status = document.getElementById('formStatus');
//   status.textContent = '✓ Message sent! (Connect this to Formspree, EmailJS, or your backend.)';
//   form.reset();
//   setTimeout(() => (status.textContent = ''), 5000);
// });

// ===== Footer year =====
document.getElementById('year').textContent = new Date().getFullYear();