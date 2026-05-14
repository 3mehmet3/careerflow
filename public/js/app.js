// Modal
function openModal(title, html) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('modal').classList.remove('hidden');
}
function closeModal() { document.getElementById('modal').classList.add('hidden'); }

// Navigation
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.remove('hidden');
  document.querySelector(`[data-page="${page}"]`).classList.add('active');

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
    document.getElementById('stats-grid').innerHTML = `
      <div class="stat-card"><div class="stat-number">${skills.length}</div><div class="stat-label">Skills tracked</div></div>
      <div class="stat-card"><div class="stat-number">${goals.length}</div><div class="stat-label">Career goals</div></div>
      <div class="stat-card"><div class="stat-number">${completedGoals}</div><div class="stat-label">Goals completed</div></div>
      <div class="stat-card"><div class="stat-number">${activeProjects}</div><div class="stat-label">Active projects</div></div>
    `;
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
  // Auth tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('login-form').classList.toggle('hidden', tab.dataset.tab !== 'login');
      document.getElementById('register-form').classList.toggle('hidden', tab.dataset.tab !== 'register');
      document.getElementById('auth-error').classList.add('hidden');
    });
  });

  // Login form
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

  // Register form
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

  // Nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showPage(link.dataset.page);
    });
  });

  // Page action buttons
  document.getElementById('add-skill-btn').addEventListener('click', openAddSkill);
  document.getElementById('add-goal-btn').addEventListener('click', openAddGoal);
  document.getElementById('add-project-btn').addEventListener('click', openAddProject);

  // Filters
  document.getElementById('skill-search').addEventListener('input', loadSkills);
  document.getElementById('skill-status-filter').addEventListener('change', loadSkills);
  document.getElementById('goal-priority-filter').addEventListener('change', loadGoals);
  document.getElementById('goal-completed-filter').addEventListener('change', loadGoals);

  // Modal close
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal')) closeModal();
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', logout);

  // Auto-login if token exists
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 > Date.now()) {
        setLoggedIn({ name: payload.name, email: payload.email });
        return;
      }
    } catch { /* invalid token */ }
    logout();
  }
});
