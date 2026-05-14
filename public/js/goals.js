async function loadGoals() {
  const priority = document.getElementById('goal-priority-filter').value;
  const completed = document.getElementById('goal-completed-filter').value;
  let qs = [];
  if (priority) qs.push(`priority=${priority}`);
  if (completed !== '') qs.push(`completed=${completed}`);
  const q = qs.length ? `?${qs.join('&')}` : '';

  const goals = await api.goals.getAll(q);
  const list = document.getElementById('goals-list');
  if (!goals.length) {
    list.innerHTML = '<p class="empty-state">No goals yet. Set your first career goal!</p>';
    return;
  }
  list.innerHTML = goals.map(g => `
    <div class="card">
      <div class="card-title">${g.completed ? '✅ ' : ''}${g.title}</div>
      <div class="card-meta">${priorityBadge(g.priority)} ${g.deadline ? '· Due: ' + g.deadline : ''}</div>
      <div style="font-size:0.8rem;color:var(--muted);margin-top:2px">Progress: ${g.progress}%</div>
      <div class="progress-bar"><div class="progress-fill ${g.completed?'green':''}" style="width:${g.progress}%"></div></div>
      ${g.description ? `<div class="card-meta">${g.description}</div>` : ''}
      <div class="card-actions">
        <button class="btn-secondary" onclick="openEditGoal(${JSON.stringify(g).replace(/"/g,'&quot;')})">Edit</button>
        <button class="btn-danger" onclick="deleteGoal(${g.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

function goalForm(g = {}) {
  return `
    <div class="form-group"><label>Title</label><input id="f-title" value="${g.title||''}" placeholder="e.g. Get senior dev role" /></div>
    <div class="form-group"><label>Description</label><textarea id="f-description">${g.description||''}</textarea></div>
    <div class="form-group"><label>Deadline</label><input id="f-deadline" type="date" value="${g.deadline||''}" /></div>
    <div class="form-group"><label>Priority</label>
      <select id="f-priority">
        <option value="low" ${g.priority==='low'?'selected':''}>Low</option>
        <option value="medium" ${g.priority==='medium'||!g.priority?'selected':''}>Medium</option>
        <option value="high" ${g.priority==='high'?'selected':''}>High</option>
      </select>
    </div>
    <div class="form-group"><label>Progress (0-100)</label><input id="f-progress" type="number" min="0" max="100" value="${g.progress??0}" /></div>
    <div class="form-actions">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveGoal(${g.id||'null'})">Save</button>
    </div>
  `;
}

function openAddGoal() { openModal('Add Career Goal', goalForm()); }
function openEditGoal(g) { openModal('Edit Goal', goalForm(g)); }

async function saveGoal(id) {
  const body = {
    title: document.getElementById('f-title').value,
    description: document.getElementById('f-description').value,
    deadline: document.getElementById('f-deadline').value || null,
    priority: document.getElementById('f-priority').value,
    progress: parseInt(document.getElementById('f-progress').value),
  };
  try {
    if (id) await api.goals.update(id, body);
    else await api.goals.create(body);
    closeModal();
    loadGoals();
  } catch(e) { alert(e.errors?.join('\n') || 'Error saving goal'); }
}

async function deleteGoal(id) {
  if (!confirm('Delete this goal?')) return;
  await api.goals.delete(id);
  loadGoals();
}
