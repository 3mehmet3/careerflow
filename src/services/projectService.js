const { getDb } = require('../db/database');

function validateProject({ title, status, deadline }) {
  const errors = [];
  if (!title || title.trim().length < 1) errors.push('Title is required');
  if (status && !['active', 'completed', 'paused', 'cancelled'].includes(status)) errors.push('Invalid status');
  if (deadline && isNaN(Date.parse(deadline))) errors.push('Invalid deadline date');
  return errors;
}

function getProjects(userId, filters = {}) {
  const db = getDb();
  let query = 'SELECT * FROM projects WHERE user_id = ?';
  const params = [userId];

  if (filters.status) { query += ' AND status = ?'; params.push(filters.status); }
  if (filters.search) { query += ' AND title LIKE ?'; params.push(`%${filters.search}%`); }

  query += ' ORDER BY created_at DESC';
  const projects = db.prepare(query).all(...params);

  return projects.map(p => ({
    ...p,
    skills: db.prepare('SELECT * FROM project_skills WHERE project_id = ?').all(p.id)
  }));
}

function getProjectById(userId, projectId) {
  const db = getDb();
  const project = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(projectId, userId);
  if (!project) return null;
  project.skills = db.prepare('SELECT * FROM project_skills WHERE project_id = ?').all(projectId);
  return project;
}

function createProject(userId, data) {
  const errors = validateProject(data);
  if (errors.length > 0) return { success: false, errors };

  const db = getDb();
  const result = db.prepare(
    'INSERT INTO projects (user_id, title, description, client, status, deadline, technologies) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(userId, data.title.trim(), data.description ?? null, data.client ?? null,
    data.status ?? 'active', data.deadline ?? null, data.technologies ?? null);

  if (data.skills && Array.isArray(data.skills)) {
    const insertSkill = db.prepare('INSERT INTO project_skills (project_id, skill_name, required_level) VALUES (?, ?, ?)');
    data.skills.forEach(s => insertSkill.run(result.lastInsertRowid, s.skill_name, s.required_level ?? 50));
  }

  return { success: true, project: getProjectById(userId, result.lastInsertRowid) };
}

function updateProject(userId, projectId, data) {
  const existing = getProjectById(userId, projectId);
  if (!existing) return { success: false, errors: ['Project not found'] };

  const merged = { ...existing, ...data };
  const errors = validateProject(merged);
  if (errors.length > 0) return { success: false, errors };

  const db = getDb();
  db.prepare(
    'UPDATE projects SET title = ?, description = ?, client = ?, status = ?, deadline = ?, technologies = ? WHERE id = ? AND user_id = ?'
  ).run(merged.title, merged.description, merged.client, merged.status, merged.deadline, merged.technologies, projectId, userId);

  if (data.skills !== undefined) {
    db.prepare('DELETE FROM project_skills WHERE project_id = ?').run(projectId);
    if (Array.isArray(data.skills)) {
      const insertSkill = db.prepare('INSERT INTO project_skills (project_id, skill_name, required_level) VALUES (?, ?, ?)');
      data.skills.forEach(s => insertSkill.run(projectId, s.skill_name, s.required_level ?? 50));
    }
  }

  return { success: true, project: getProjectById(userId, projectId) };
}

function deleteProject(userId, projectId) {
  if (!getProjectById(userId, projectId)) return { success: false, errors: ['Project not found'] };
  getDb().prepare('DELETE FROM projects WHERE id = ? AND user_id = ?').run(projectId, userId);
  return { success: true };
}

module.exports = { getProjects, getProjectById, createProject, updateProject, deleteProject, validateProject };
