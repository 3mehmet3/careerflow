// Modal
function openModal(title, html) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('modal').classList.remove('hidden');
}
function closeModal() { document.getElementById('modal').classList.add('hidden'); }

// Sidebar mobile
function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('open');
  document.querySelector('.sidebar-overlay').classList.toggle('open');
}

// Navigation
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.remove('hidden');
  document.querySelector(`[data-page="${page}"]`).classList.add('active');

  document.querySelector('.sidebar').classList.remove('open');
  document.querySelector('.sidebar-overlay').classList.remove('open');

  if (page === 'skills') loadSkills();
  else if (page === 'goals') loadGoals();
  else if (page === 'projects') loadProjects();
  else loadDashboard();
}

async function loadDashboard() {
  try {
    const [skills, goals, projects] = await Promise.all([
      api.skills.getAll(),
      api.goals.getAll(),
      api.projects.getAll(),
    ]);

    const completedGoals = goals.filter(g => g.completed).length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const avgSkill = skills.length ? Math.round(skills.reduce((s, k) => s + k.current_level, 0) / skills.length) : 0;

    document.getElementById('stats-grid').innerHTML = `
      <div class="stat-card"><div class="stat-number">${skills.length}</div><div class="stat-label">Skills tracked</div></div>
      <div class="stat-card"><div class="stat-number">${avgSkill}</div><div class="stat-label">Avg skill level</div></div>
      <div class="stat-card"><div class="stat-number">${completedGoals}/${goals.length}</div><div class="stat-label">Goals completed</div></div>
      <div class="stat-card"><div class="stat-number">${activeProjects}</div><div class="stat-label">Active projects</div></div>
    `;

    const topSkills = [...skills].sort((a,b) => b.current_level - a.current_level).slice(0, 5);
    document.getElementById('dash-skills').innerHTML = topSkills.length
      ? topSkills.map(s => `
        <div class="skill-bar-item">
          <span>${s.name}</span>
          <div class="progress-bar"><div class="progress-fill" style="width:${s.current_level}%"></div></div>
          <span>${s.current_level}</span>
        </div>`).join('')
      : '<p style="color:var(--muted);font-size:0.85rem">No skills yet</p>';

    const activeGoals = goals.filter(g => !g.completed).slice(0, 4);
    document.getElementById('dash-goals').innerHTML = activeGoals.length
      ? activeGoals.map(g => `
        <div class="goal-item">
          <div class="goal-item-text">${g.title}</div>
          <div class="goal-item-pct">${g.progress}%</div>
        </div>`).join('')
      : '<p style="color:var(--muted);font-size:0.85rem">No active goals</p>';

  } catch(e) { console.error(e); }
}

// Auth
function setLoggedIn(user) {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('user-name').textContent = user.name;
  loadDashboard();
}

function logout() {
  token = null;
  localStorage.removeItem('cf_token');
  document.getElementById('app').classList.add('hidden');
  document.getElementById('auth-screen').classList.remove('hidden');
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('login-form').classList.toggle('hidden', tab.dataset.tab !== 'login');
      document.getElementById('register-form').classList.toggle('hidden', tab.dataset.tab !== 'register');
      document.getElementById('auth-error').classList.add('hidden');
    });
  });

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    try {
      const res = await api.auth.login(data);
      token = res.token;
      localStorage.setItem('cf_token', token);
      setLoggedIn(res.user);
    } catch(err) {
      const errEl = document.getElementById('auth-error');
      errEl.textContent = err.errors?.join(', ') || 'Login failed';
      errEl.classList.remove('hidden');
    }
  });

  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    try {
      const res = await api.auth.register(data);
      token = res.token;
      localStorage.setItem('cf_token', token);
      setLoggedIn(res.user);
    } catch(err) {
      const errEl = document.getElementById('auth-error');
      errEl.textContent = err.errors?.join(', ') || 'Registration failed';
      errEl.classList.remove('hidden');
    }
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showPage(link.dataset.page);
    });
  });

  document.getElementById('add-skill-btn').addEventListener('click', openAddSkill);
  document.getElementById('add-goal-btn').addEventListener('click', openAddGoal);
  document.getElementById('add-project-btn').addEventListener('click', openAddProject);

  document.getElementById('skill-search').addEventListener('input', loadSkills);
  document.getElementById('skill-status-filter').addEventListener('change', loadSkills);
  document.getElementById('goal-priority-filter').addEventListener('change', loadGoals);
  document.getElementById('goal-completed-filter').addEventListener('change', loadGoals);

  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal')) closeModal();
  });

  document.getElementById('logout-btn').addEventListener('click', logout);
  document.getElementById('hamburger').addEventListener('click', toggleSidebar);
  document.querySelector('.sidebar-overlay').addEventListener('click', toggleSidebar);

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 > Date.now()) {
        setLoggedIn({ name: payload.name, email: payload.email });
        return;
      }
    } catch { }
    logout();
  }
});