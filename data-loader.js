/* data-loader.js — fetches live data from Supabase and injects into the public site */

const SUPABASE_URL  = 'https://ebxzzgghsufotwtctyxv.supabase.co';
const SUPABASE_ANON = 'sb_publishable_4ndt1T3Pkkh2DFjIVlYyHw_UV_3YsVL';

const headers = {
  apikey: SUPABASE_ANON,
  Authorization: `Bearer ${SUPABASE_ANON}`
};

const fetchTable = async (table, order = 'sort_order.asc') => {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=*&order=${order}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[${table}] HTTP ${res.status}: ${text}`);
  }
  return res.json();
};

/* ---------------- CERTIFICATIONS ---------------- */
async function loadCertifications() {
  const certs = await fetchTable('certifications', 'sort_order.asc');
  const grid = document.querySelector('#certifications .projects-grid');
  if (!grid) return;
  if (!Array.isArray(certs)) return;

  grid.innerHTML = certs.map(c => `
    <article class="project-card">
      <div class="issuer-heading">
        <img class="issuer-icon" src="https://www.google.com/s2/favicons?domain=${c.domain}&sz=128" alt="${c.issuer} logo" />
        <span>${c.issuer}</span>
      </div>
      <div class="project-tags">
        ${c.tag ? `<span>${c.tag}</span>` : ''}
        ${c.featured ? `<span class="featured">${c.featured}</span>` : ''}
      </div>
      <h3>${c.name}</h3>
      <p class="project-sub">Issued by ${c.issuer}</p>
      ${c.description ? `<p>${c.description}</p>` : ''}
      <div class="stack">
        ${c.issued ? `<span>Issued ${c.issued}</span>` : ''}
        ${c.credential ? `<span class="credential">ID: ${c.credential}</span>` : ''}
      </div>
      ${c.url ? `<a class="btn btn-ghost" href="${c.url}" target="_blank" rel="noopener noreferrer">${c.url.includes('scholarhat') ? 'Verify Certificate' : 'View Certificate'}</a>` : ''}
    </article>
  `).join('');

  const statEl = document.querySelector('#hero .stat-value[data-target]');
  if (statEl) {
    statEl.dataset.target = certs.length;
    statEl.removeAttribute('data-target');
    statEl.textContent = certs.length;
  }
}

/* ---------------- PROJECTS ---------------- */
async function loadProjects() {
  const projects = await fetchTable('projects', 'sort_order.asc');
  const grid = document.querySelector('#projects .projects-grid');
  if (!grid) return;
  if (!Array.isArray(projects)) return;

  grid.innerHTML = projects.map(p => `
    <article class="project-card">
      <div class="project-tags">
        ${(p.tags || []).map(t => `<span class="${t.toLowerCase().includes('case') ? 'featured' : ''}">${t}</span>`).join('')}
      </div>
      <h3>${p.title}</h3>
      ${p.subtitle ? `<p class="project-sub">${p.subtitle}</p>` : ''}
      ${p.description ? `<p>${p.description}</p>` : ''}
      <div class="stack">
        ${(p.stack || []).map(s => `<span>${s}</span>`).join('')}
      </div>
      ${p.link ? `<a class="btn btn-ghost" href="${p.link}" target="_blank" rel="noopener noreferrer">View Project</a>` : ''}
    </article>
  `).join('');
}

/* ---------------- SKILLS ---------------- */
async function loadSkills() {
  const skills = await fetchTable('skills', 'category.asc,sort_order.asc');
  const grid = document.querySelector('#skills .skills-grid');
  if (!grid) return;
  if (!Array.isArray(skills)) return;

  const byCat = {};
  skills.forEach(s => { (byCat[s.category] ||= []).push(s); });

  grid.innerHTML = Object.entries(byCat).map(([cat, items]) => `
    <div class="skill-group">
      <h3>${cat}</h3>
      ${items.map(s => `
        <div class="skill-bar">
          <span>${s.name}</span>
          <div class="bar"><i style="--w:${s.level}%"></i></div>
        </div>
      `).join('')}
    </div>
  `).join('');

  grid.querySelectorAll('.skill-group').forEach(g => {
    g.querySelectorAll('.bar i').forEach((bar, i) => {
      setTimeout(() => bar.classList.add('animate'), i * 120);
    });
  });
}

/* ---------------- HERO STATS ---------------- */
async function loadHeroStats() {
  const stats = await fetchTable('hero_stats', 'key.asc');
  if (!Array.isArray(stats)) return;

  const order = ['qualification', 'institute', 'certifications', 'primary_stack'];
  const cards = document.querySelectorAll('#hero .stat-card');

  order.forEach((key, i) => {
    const s = stats.find(x => x.key === key);
    const card = cards[i];
    if (!s || !card) return;
    card.querySelector('.stat-label').textContent = s.label;
    card.querySelector('.stat-sub').textContent   = s.sub || '';
    const valEl = card.querySelector('.stat-value');
    if (key === 'certifications') {
      valEl.removeAttribute('data-target');
    }
    valEl.textContent = s.value;
  });
}

/* ---------------- BOOT ---------------- */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('data-loader: starting');
  try { await loadCertifications(); console.log('data-loader: certifications OK'); }
  catch (e) { console.error('data-loader: certifications FAILED', e); }
  try { await loadProjects();       console.log('data-loader: projects OK'); }
  catch (e) { console.error('data-loader: projects FAILED', e); }
  try { await loadSkills();         console.log('data-loader: skills OK'); }
  catch (e) { console.error('data-loader: skills FAILED', e); }
  try { await loadHeroStats();      console.log('data-loader: hero_stats OK'); }
  catch (e) { console.error('data-loader: hero_stats FAILED', e); }
});