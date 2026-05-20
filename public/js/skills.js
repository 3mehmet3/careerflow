function statusBadge(s) {
  const map = { learning: 'badge-blue', completed: 'badge-green', paused: 'badge-yellow' };
  return `<span class="badge ${map[s] || 'badge-gray'}">${s}</span>`;
}

function priorityBadge(p) {
  const map = { high: 'badge-red', medium: 'badge-yellow', low: 'badge-green' };
  return `<span class="badge ${map[p] || 'badge-gray'}">${p}</span>`;
}

async function loadSkills() {
  const search = document.getElementById('skill-search').value;
  const status = document.getElementById('skill-status-filter').value;
  let qs = [];
  if (search) qs.push(`search=${encodeURIComponent(search)}`);
  if (status) qs.push(`status=${status}`);
  const q = qs.length ? `?${qs.join('&')}` : '';

  const skills = await api.skills.getAll(q);
  const list = document.getElementById('skills-list');
  if (!skills.length) {
    list.innerHTML = '<p class="empty-state">No skills found. Add your first skill!</p>';
    return;
  }
  list.innerHTML = skills.map(s => {
    const pct = s.target_level ? Math.round(s.current_level / s.target_level * 100) : 0;
    return `
    <div class="card">
      <div class="card-title">${s.name}</div>
      <div class="card-meta">${s.category} · ${statusBadge(s.status)}</div>
      <div class="slider-group">
        <div style="display:flex;justify-content:space-between;font-size:0.78rem;color:var(--muted)">
          <span>Current level</span><span>${s.current_level} / ${s.target_level}</span>
        </div>
        <div class="slider-row">
          <input type="range" min="0" max="100" value="${s.current_level}"
            oninput="updateSkillLevel(${s.id}, this.value, ${s.target_level})"
            onchange="saveSkillLevel(${s.id}, this.value)"
            id="slider-${s.id}" />
          <span class="slider-val" id="sliderval-${s.id}">${s.current_level}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${s.status === 'completed' ? 'green' : ''}" id="prog-${s.id}" style="width:${pct}%"></div>
        </div>
      </div>
      ${s.notes ? `<div class="card-meta">${s.notes}</div>` : ''}
      <div class="card-actions">
        <button class="btn-secondary" onclick="openEditSkill(${JSON.stringify(s).replace(/"/g,'&quot;')})">Edit</button>
        <button class="btn-danger" onclick="deleteSkill(${s.id})">Delete</button>
      </div>
    </div>
  `}).join('');
}

function updateSkillLevel(id, value, targetLevel) {
  document.getElementById(`sliderval-${id}`).textContent = value;
  const pct = targetLevel ? Math.round(value / targetLevel * 100) : 0;
  document.getElementById(`prog-${id}`).style.width = Math.min(pct, 100) + '%';
}

async function saveSkillLevel(id, value) {
  try {
    await api.skills.update(id, { current_level: parseInt(value) });
  } catch(e) { console.error('Could not save level', e); }
}

function skillForm(s = {}) {
  return `
    <div class="form-group"><label>Skill Name</label><input id="f-name" value="${s.name||''}" placeholder="e.g. JavaScript" /></div>
    <div class="form-group"><label>Category</label><input id="f-category" value="${s.category||''}" placeholder="e.g. Frontend" /></div>
    <div class="form-group">
      <label>Current Level: <span id="fl-current">${s.current_level ?? 0}</span></label>
      <div class="slider-row">
        <input type="range" min="0" max="100" value="${s.current_level ?? 0}" id="f-current"
          oninput="document.getElementById('fl-current').textContent=this.value" />
        <span class="slider-val">${s.current_level ?? 0}</span>
      </div>
    </div>
    <div class="form-group">
      <label>Target Level: <span id="fl-target">${s.target_level ?? 100}</span></label>
      <div class="slider-row">
        <input type="range" min="0" max="100" value="${s.target_level ?? 100}" id="f-target"
          oninput="document.getElementById('fl-target').textContent=this.value" />
        <span class="slider-val">${s.target_level ?? 100}</span>
      </div>
    </div>
    <div class="form-group"><label>Status</label>
      <select id="f-status">
        <option value="learning" ${s.status==='learning'?'selected':''}>Learning</option>
        <option value="completed" ${s.status==='completed'?'selected':''}>Completed</option>
        <option value="paused" ${s.status==='paused'?'selected':''}>Paused</option>
      </select>
    </div>
    <div class="form-group"><label>Notes</label><textarea id="f-notes">${s.notes||''}</textarea></div>
    <div class="form-actions">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveSkill(${s.id||'null'})">Save</button>
    </div>
  `;
}

function openAddSkill() { openModal('Add Skill', skillForm()); }
function openEditSkill(s) { openModal('Edit Skill', skillForm(s)); }

async function saveSkill(id) {
  const body = {
    name: document.getElementById('f-name').value,
    category: document.getElementById('f-category').value,
    current_level: parseInt(document.getElementById('f-current').value),
    target_level: parseInt(document.getElementById('f-target').value),
    status: document.getElementById('f-status').value,
    notes: document.getElementById('f-notes').value,
  };
  try {
    if (id) await api.skills.update(id, body);
    else await api.skills.create(body);
    closeModal();
    loadSkills();
  } catch(e) { alert(e.errors?.join('\n') || 'Error saving skill'); }
}

async function deleteSkill(id) {
  if (!confirm('Delete this skill?')) return;
  await api.skills.delete(id);
  loadSkills();
}