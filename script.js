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

// ===== Contact form (Formspree) =====
const contactForm = document.getElementById('contactForm');

contactForm?.addEventListener('submit', async function (e) {
  e.preventDefault();
  e.stopImmediatePropagation();

  const status = document.getElementById('formStatus');
  const button = contactForm.querySelector("button[type='submit']");

  // Read values IMMEDIATELY into variables — before anything can reset them
  const nameVal    = contactForm.querySelector('[name="name"]').value.trim();
  const emailVal   = contactForm.querySelector('[name="email"]').value.trim();
  const messageVal = contactForm.querySelector('[name="message"]').value.trim();

  console.log("📤 Sending:", { nameVal, emailVal, messageVal });

  status.textContent = "Sending...";
  status.style.color = "#888";
  button.disabled = true;

  try {
    const response = await fetch(contactForm.action, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        name:     nameVal,
        email:    emailVal,
        message:  messageVal,
        _subject: "New message from your portfolio"
      })
    });

    if (response.ok) {
      status.textContent = "✅ Message sent successfully! I'll get back to you soon.";
      status.style.color = "#22c55e";
      contactForm.reset();
    } else {
      const data = await response.json().catch(() => ({}));
      status.textContent = "❌ " + (data.errors ? data.errors.map(err => err.message).join(", ") : "Something went wrong.");
      status.style.color = "#ef4444";
    }
  } catch (err) {
    status.textContent = "❌ Network error. Please try again.";
    status.style.color = "#ef4444";
  } finally {
    button.disabled = false;
  }
});

// ===== Footer year =====
document.getElementById('year').textContent = new Date().getFullYear();