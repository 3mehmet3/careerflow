const { getDb } = require('../db/database');

function validateSkill({ name, category, current_level, target_level, status }) {
  const errors = [];
  if (!name || name.trim().length < 1) errors.push('Skill name is required');
  if (!category || category.trim().length < 1) errors.push('Category is required');
  if (current_level !== undefined && (current_level < 0 || current_level > 100)) errors.push('Current level must be between 0 and 100');
  if (target_level !== undefined && (target_level < 0 || target_level > 100)) errors.push('Target level must be between 0 and 100');
  if (status && !['learning', 'completed', 'paused'].includes(status)) errors.push('Status must be learning, completed, or paused');
  return errors;
}

function getSkills(userId, filters = {}) {
  const db = getDb();
  let query = 'SELECT * FROM skills WHERE user_id = ?';
  const params = [userId];

  if (filters.category) {
    query += ' AND category = ?';
    params.push(filters.category);
  }
  if (filters.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }
  if (filters.search) {
    query += ' AND name LIKE ?';
    params.push(`%${filters.search}%`);
  }

  query += ' ORDER BY name ASC';
  return db.prepare(query).all(...params);
}

function getSkillById(userId, skillId) {
  const db = getDb();
  return db.prepare('SELECT * FROM skills WHERE id = ? AND user_id = ?').get(skillId, userId);
}

function createSkill(userId, data) {
  const errors = validateSkill(data);
  if (errors.length > 0) return { success: false, errors };

  const db = getDb();
  const result = db.prepare(
    'INSERT INTO skills (user_id, name, category, current_level, target_level, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(userId, data.name.trim(), data.category.trim(), data.current_level ?? 0, data.target_level ?? 100, data.status ?? 'learning', data.notes ?? null);

  return { success: true, skill: getSkillById(userId, result.lastInsertRowid) };
}

function updateSkill(userId, skillId, data) {
  const existing = getSkillById(userId, skillId);
  if (!existing) return { success: false, errors: ['Skill not found'] };

  const merged = { ...existing, ...data };
  const errors = validateSkill(merged);
  if (errors.length > 0) return { success: false, errors };

  const db = getDb();
  db.prepare(
    'UPDATE skills SET name = ?, category = ?, current_level = ?, target_level = ?, status = ?, notes = ? WHERE id = ? AND user_id = ?'
  ).run(merged.name, merged.category, merged.current_level, merged.target_level, merged.status, merged.notes, skillId, userId);

  return { success: true, skill: getSkillById(userId, skillId) };
}

function deleteSkill(userId, skillId) {
  const existing = getSkillById(userId, skillId);
  if (!existing) return { success: false, errors: ['Skill not found'] };

  const db = getDb();
  db.prepare('DELETE FROM skills WHERE id = ? AND user_id = ?').run(skillId, userId);
  return { success: true };
}

module.exports = { getSkills, getSkillById, createSkill, updateSkill, deleteSkill, validateSkill };
