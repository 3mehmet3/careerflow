function projectStatusBadge(s) {
  const map = { active: 'badge-green', completed: 'badge-blue', paused: 'badge-yellow', cancelled: 'badge-red' };
  return `<span class="badge ${map[s]||'badge-gray'}">${s}</span>`;
}

async function loadProjects() {
  const projects = await api.projects.getAll();
  const list = document.getElementById('projects-list');
  if (!projects.length) {
    list.innerHTML = '<p class="empty-state">No projects yet. Add your first project!</p>';
    return;
  }
  list.innerHTML = projects.map(p => `
    <div class="card">
      <div class="card-title">${p.title}</div>
      <div class="card-meta">${projectStatusBadge(p.status)} ${p.client ? '· ' + p.client : ''}</div>
      ${p.technologies ? `<div class="card-meta">🔧 ${p.technologies}</div>` : ''}
      ${p.deadline ? `<div class="card-meta">📅 ${p.deadline}</div>` : ''}
      ${p.skills?.length ? `<div class="card-meta">Skills: ${p.skills.map(s=>s.skill_name).join(', ')}</div>` : ''}
      <div class="card-actions">
        <button class="btn-secondary" onclick="showSkillFit(${p.id})">Skill Fit</button>
        <button class="btn-secondary" onclick="openEditProject(${JSON.stringify(p).replace(/"/g,'&quot;')})">Edit</button>
        <button class="btn-danger" onclick="deleteProject(${p.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

async function showSkillFit(id) {
  try {
    const result = await api.projects.skillFit(id);
    if (result.score === null) {
      openModal('Skill Fit', `<p style="color:var(--muted)">${result.message}</p>`);
      return;
    }
    const scoreColor = result.score >= 80 ? 'var(--accent2)' : result.score >= 50 ? 'var(--warning)' : 'var(--danger)';
    const breakdown = result.breakdown.map(b => `
      <div class="fit-row">
        <span>${b.skill}</span>
        <div class="progress-bar"><div class="progress-fill" style="width:${b.match_percentage}%;background:${scoreColor}"></div></div>
        <span style="min-width:36px;color:var(--muted)">${b.match_percentage}%</span>
      </div>
    `).join('');
    openModal('Skill Fit Score', `
      <div class="fit-score">
        <div class="fit-score-number" style="color:${scoreColor}">${result.score}%</div>
        <p style="color:var(--muted);margin-top:0.5rem">${result.message}</p>
      </div>
      <div class="fit-breakdown">${breakdown}</div>
    `);
  } catch(e) { alert('Could not calculate skill fit'); }
}

function projectForm(p = {}) {
  const skills = p.skills || [];
  return `
    <div class="form-group"><label>Title</label><input id="f-title" value="${p.title||''}" placeholder="e.g. E-commerce Website" /></div>
    <div class="form-group"><label>Description</label><textarea id="f-description">${p.description||''}</textarea></div>
    <div class="form-group"><label>Client</label><input id="f-client" value="${p.client||''}" placeholder="Client name (optional)" /></div>
    <div class="form-group"><label>Status</label>
      <select id="f-status">
        <option value="active" ${p.status==='active'||!p.status?'selected':''}>Active</option>
        <option value="completed" ${p.status==='completed'?'selected':''}>Completed</option>
        <option value="paused" ${p.status==='paused'?'selected':''}>Paused</option>
        <option value="cancelled" ${p.status==='cancelled'?'selected':''}>Cancelled</option>
      </select>
    </div>
    <div class="form-group"><label>Deadline</label><input id="f-deadline" type="date" value="${p.deadline||''}" /></div>
    <div class="form-group"><label>Technologies</label><input id="f-technologies" value="${p.technologies||''}" placeholder="e.g. Node.js, Vue, SQLite" /></div>
    <div class="form-group">
      <label>Required Skills (name:level, one per line)</label>
      <textarea id="f-skills" placeholder="JavaScript:80\nCSS:70">${skills.map(s=>`${s.skill_name}:${s.required_level}`).join('\n')}</textarea>
    </div>
    <div class="form-actions">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveProject(${p.id||'null'})">Save</button>
    </div>
  `;
}

function openAddProject() { openModal('Add Project', projectForm()); }
function openEditProject(p) { openModal('Edit Project', projectForm(p)); }

async function saveProject(id) {
  const skillsRaw = document.getElementById('f-skills').value.trim();
  const skills = skillsRaw ? skillsRaw.split('\n').map(line => {
    const [skill_name, required_level] = line.split(':');
    return { skill_name: skill_name.trim(), required_level: parseInt(required_level) || 50 };
  }).filter(s => s.skill_name) : [];

  const body = {
    title: document.getElementById('f-title').value,
    description: document.getElementById('f-description').value,
    client: document.getElementById('f-client').value || null,
    status: document.getElementById('f-status').value,
    deadline: document.getElementById('f-deadline').value || null,
    technologies: document.getElementById('f-technologies').value || null,
    skills,
  };
  try {
    if (id) await api.projects.update(id, body);
    else await api.projects.create(body);
    closeModal();
    loadProjects();
  } catch(e) { alert(e.errors?.join('\n') || 'Error saving project'); }
}

async function deleteProject(id) {
  if (!confirm('Delete this project?')) return;
  await api.projects.delete(id);
  loadProjects();
}
