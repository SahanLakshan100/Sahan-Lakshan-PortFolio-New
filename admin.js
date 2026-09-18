/* admin.js — full CRUD for the portfolio admin panel */

const SUPABASE_URL  = 'https://ebxzzgghsufotwtctyxv.supabase.co';
const SUPABASE_ANON = 'sb_publishable_4ndt1T3Pkkh2DFjIVlYyHw_UV_3YsVL';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
const $ = id => document.getElementById(id);

const loginView = $('loginView');
const adminView = $('adminView');

/* ---------------- AUTH ---------------- */
(async () => {
  const { data: { session } } = await sb.auth.getSession();
  if (session) showAdmin();
})();

$('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  $('loginStatus').textContent = 'Logging in…';
  const { error } = await sb.auth.signInWithPassword({
    email: $('email').value,
    password: $('password').value
  });
  if (error) { $('loginStatus').textContent = '✗ ' + error.message; return; }
  $('loginStatus').textContent = '';
  showAdmin();
});

$('logoutBtn').addEventListener('click', async () => {
  await sb.auth.signOut();
  loginView.classList.remove('hidden');
  adminView.classList.add('hidden');
});

function showAdmin() {
  loginView.classList.add('hidden');
  adminView.classList.remove('hidden');
  loadAll();
}

/* ---------------- TABS ---------------- */
document.querySelectorAll('.tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    $('panel-' + btn.dataset.tab).classList.add('active');
  });
});

/* ---------------- HELPERS ---------------- */
const flash = (id, msg, ok = true) => {
  const el = $(id);
  el.textContent = (ok ? '✓ ' : '✗ ') + msg;
  el.style.color = ok ? 'var(--accent-2)' : '#f87171';
  setTimeout(() => { el.textContent = ''; }, 2500);
};

const escapeHtml = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/* ---------------- LOAD ALL ---------------- */
async function loadAll() {
  await Promise.all([loadCerts(), loadProjs(), loadSkills(), loadStats()]);
}

/* ==========================================================
   CERTIFICATIONS
   ========================================================== */
async function loadCerts() {
  const { data, error } = await sb.from('certifications').select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) return;

  $('certList').innerHTML = data.map(c => `
    <div class="admin-item">
      <div>
        <strong>${escapeHtml(c.name)}</strong>
        <small>${escapeHtml(c.issuer)} · ${c.issued || '—'} · ${c.featured || ''}</small>
      </div>
      <div class="actions">
        <button class="btn btn-ghost" data-edit='${encodeURIComponent(JSON.stringify(c))}' data-type="cert">Edit</button>
        <button class="btn btn-danger" data-del="${c.id}" data-type="cert">Delete</button>
      </div>
    </div>
  `).join('');
}

$('certForm').addEventListener('submit', async e => {
  e.preventDefault();
  const payload = {
    name:        $('certName').value.trim(),
    issuer:      $('certIssuer').value.trim(),
    domain:      $('certDomain').value.trim(),
    issued:      $('certIssued').value.trim() || null,
    tag:         $('certTag').value.trim() || null,
    featured:    $('certFeatured').value.trim() || null,
    credential:  $('certCredential').value.trim() || null,
    url:         $('certUrl').value.trim() || null,
    description: $('certDesc').value.trim() || null,
    sort_order:  parseInt($('certOrder').value || '0', 10)
  };
  const id = $('certId').value;
  $('certStatus').textContent = 'Saving…';
  const { error } = id
    ? await sb.from('certifications').update(payload).eq('id', id)
    : await sb.from('certifications').insert(payload);
  if (error) { $('certStatus').textContent = '✗ ' + error.message; return; }
  flash('certStatus', id ? 'Updated' : 'Added');
  resetCert();
  loadCerts();
});

function resetCert() {
  $('certForm').reset();
  $('certId').value = '';
  $('certSaveBtn').textContent = 'Add Certificate';
  $('certCancelBtn').classList.add('hidden');
}
$('certCancelBtn').addEventListener('click', resetCert);

function editCert(c) {
  $('certId').value = c.id;
  $('certName').value = c.name || '';
  $('certIssuer').value = c.issuer || '';
  $('certDomain').value = c.domain || '';
  $('certIssued').value = c.issued || '';
  $('certTag').value = c.tag || '';
  $('certFeatured').value = c.featured || '';
  $('certCredential').value = c.credential || '';
  $('certUrl').value = c.url || '';
  $('certDesc').value = c.description || '';
  $('certOrder').value = c.sort_order || 0;
  $('certSaveBtn').textContent = 'Update Certificate';
  $('certCancelBtn').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ==========================================================
   PROJECTS
   ========================================================== */
async function loadProjs() {
  const { data, error } = await sb.from('projects').select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) return;

  $('projList').innerHTML = (data || []).map(p => `
    <div class="admin-item">
      <div>
        <strong>${escapeHtml(p.title)}</strong>
        <small>${escapeHtml(p.subtitle || '')}</small>
      </div>
      <div class="actions">
        <button class="btn btn-ghost" data-edit='${encodeURIComponent(JSON.stringify(p))}' data-type="proj">Edit</button>
        <button class="btn btn-danger" data-del="${p.id}" data-type="proj">Delete</button>
      </div>
    </div>
  `).join('');
}

$('projForm').addEventListener('submit', async e => {
  e.preventDefault();
  const payload = {
    title:       $('projTitle').value.trim(),
    subtitle:    $('projSubtitle').value.trim() || null,
    description: $('projDesc').value.trim() || null,
    tags:        $('projTags').value.split(',').map(s => s.trim()).filter(Boolean),
    stack:       $('projStack').value.split(',').map(s => s.trim()).filter(Boolean),
    link:        $('projLink').value.trim() || null,
    sort_order:  parseInt($('projOrder').value || '0', 10)
  };
  const id = $('projId').value;
  $('projStatus').textContent = 'Saving…';
  const { error } = id
    ? await sb.from('projects').update(payload).eq('id', id)
    : await sb.from('projects').insert(payload);
  if (error) { $('projStatus').textContent = '✗ ' + error.message; return; }
  flash('projStatus', id ? 'Updated' : 'Added');
  resetProj();
  loadProjs();
});

function resetProj() {
  $('projForm').reset();
  $('projId').value = '';
  $('projSaveBtn').textContent = 'Add Project';
  $('projCancelBtn').classList.add('hidden');
}
$('projCancelBtn').addEventListener('click', resetProj);

function editProj(p) {
  $('projId').value = p.id;
  $('projTitle').value = p.title || '';
  $('projSubtitle').value = p.subtitle || '';
  $('projDesc').value = p.description || '';
  $('projTags').value = (p.tags || []).join(', ');
  $('projStack').value = (p.stack || []).join(', ');
  $('projLink').value = p.link || '';
  $('projOrder').value = p.sort_order || 0;
  $('projSaveBtn').textContent = 'Update Project';
  $('projCancelBtn').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ==========================================================
   SKILLS
   ========================================================== */
async function loadSkills() {
  const { data, error } = await sb.from('skills').select('*')
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true });
  if (error) return;

  $('skillList').innerHTML = (data || []).map(s => `
    <div class="admin-item">
      <div>
        <strong>${escapeHtml(s.name)}</strong>
        <small>${escapeHtml(s.category)} · ${s.level}%</small>
      </div>
      <div class="actions">
        <button class="btn btn-ghost" data-edit='${encodeURIComponent(JSON.stringify(s))}' data-type="skill">Edit</button>
        <button class="btn btn-danger" data-del="${s.id}" data-type="skill">Delete</button>
      </div>
    </div>
  `).join('');
}

$('skillForm').addEventListener('submit', async e => {
  e.preventDefault();
  const payload = {
    category:   $('skillCategory').value.trim(),
    name:       $('skillName').value.trim(),
    level:      parseInt($('skillLevel').value || '0', 10),
    sort_order: parseInt($('skillOrder').value || '0', 10)
  };
  const id = $('skillId').value;
  $('skillStatus').textContent = 'Saving…';
  const { error } = id
    ? await sb.from('skills').update(payload).eq('id', id)
    : await sb.from('skills').insert(payload);
  if (error) { $('skillStatus').textContent = '✗ ' + error.message; return; }
  flash('skillStatus', id ? 'Updated' : 'Added');
  resetSkill();
  loadSkills();
});

function resetSkill() {
  $('skillForm').reset();
  $('skillId').value = '';
  $('skillSaveBtn').textContent = 'Add Skill';
  $('skillCancelBtn').classList.add('hidden');
}
$('skillCancelBtn').addEventListener('click', resetSkill);

function editSkill(s) {
  $('skillId').value = s.id;
  $('skillCategory').value = s.category || '';
  $('skillName').value = s.name || '';
  $('skillLevel').value = s.level || 0;
  $('skillOrder').value = s.sort_order || 0;
  $('skillSaveBtn').textContent = 'Update Skill';
  $('skillCancelBtn').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ==========================================================
   HERO STATS
   ========================================================== */
async function loadStats() {
  const { data, error } = await sb.from('hero_stats').select('*')
    .order('key', { ascending: true });
  if (error) return;

  $('statList').innerHTML = (data || []).map(s => `
    <div class="admin-item">
      <div>
        <strong>${escapeHtml(s.label)}: ${escapeHtml(s.value)}</strong>
        <small>key: ${escapeHtml(s.key)} · ${escapeHtml(s.sub || '')}</small>
      </div>
      <div class="actions">
        <button class="btn btn-ghost" data-edit='${encodeURIComponent(JSON.stringify(s))}' data-type="stat">Edit</button>
        <button class="btn btn-danger" data-del="${s.id}" data-type="stat">Delete</button>
      </div>
    </div>
  `).join('');
}

$('statForm').addEventListener('submit', async e => {
  e.preventDefault();
  const payload = {
    key:   $('statKey').value.trim(),
    label: $('statLabel').value.trim(),
    value: $('statValue').value.trim(),
    sub:   $('statSub').value.trim() || null
  };
  const id = $('statId').value;
  $('statStatus').textContent = 'Saving…';
  const { error } = id
    ? await sb.from('hero_stats').update(payload).eq('id', id)
    : await sb.from('hero_stats').upsert(payload, { onConflict: 'key' });
  if (error) { $('statStatus').textContent = '✗ ' + error.message; return; }
  flash('statStatus', id ? 'Updated' : 'Saved');
  resetStat();
  loadStats();
});

function resetStat() {
  $('statForm').reset();
  $('statId').value = '';
  $('statSaveBtn').textContent = 'Add / Update Stat';
  $('statCancelBtn').classList.add('hidden');
}
$('statCancelBtn').addEventListener('click', resetStat);

function editStat(s) {
  $('statId').value = s.id;
  $('statKey').value = s.key || '';
  $('statLabel').value = s.label || '';
  $('statValue').value = s.value || '';
  $('statSub').value = s.sub || '';
  $('statSaveBtn').textContent = 'Update Stat';
  $('statCancelBtn').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ==========================================================
   DELEGATED EDIT / DELETE
   ========================================================== */
const TABLE_MAP  = { cert: 'certifications', proj: 'projects', skill: 'skills', stat: 'hero_stats' };
const EDIT_MAP   = { cert: editCert, proj: editProj, skill: editSkill, stat: editStat };
const RELOAD_MAP = { cert: loadCerts, proj: loadProjs, skill: loadSkills, stat: loadStats };

document.addEventListener('click', async e => {
  const editBtn = e.target.closest('button[data-edit]');
  if (editBtn) {
    const type = editBtn.dataset.type;
    const data = JSON.parse(decodeURIComponent(editBtn.dataset.edit));
    EDIT_MAP[type]?.(data);
    return;
  }

  const delBtn = e.target.closest('button[data-del]');
  if (delBtn) {
    const type = delBtn.dataset.type;
    const id   = delBtn.dataset.del;
    if (!confirm('Delete this item? This cannot be undone.')) return;
    const { error } = await sb.from(TABLE_MAP[type]).delete().eq('id', id);
    if (error) { alert('Delete failed: ' + error.message); return; }
    RELOAD_MAP[type]?.();
  }
});