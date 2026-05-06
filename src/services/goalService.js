const { getDb } = require('../db/database');

function validateGoal({ title, priority, progress, deadline }) {
  const errors = [];
  if (!title || title.trim().length < 1) errors.push('Title is required');
  if (priority && !['low', 'medium', 'high'].includes(priority)) errors.push('Priority must be low, medium, or high');
  if (progress !== undefined && (progress < 0 || progress > 100)) errors.push('Progress must be between 0 and 100');
  if (deadline && isNaN(Date.parse(deadline))) errors.push('Invalid deadline date');
  return errors;
}

function getGoals(userId, filters = {}) {
  const db = getDb();
  let query = 'SELECT * FROM goals WHERE user_id = ?';
  const params = [userId];

  if (filters.priority) { query += ' AND priority = ?'; params.push(filters.priority); }
  if (filters.completed !== undefined) { query += ' AND completed = ?'; params.push(filters.completed ? 1 : 0); }

  query += ' ORDER BY priority DESC, deadline ASC';
  return db.prepare(query).all(...params);
}

function getGoalById(userId, goalId) {
  return getDb().prepare('SELECT * FROM goals WHERE id = ? AND user_id = ?').get(goalId, userId);
}

function createGoal(userId, data) {
  const errors = validateGoal(data);
  if (errors.length > 0) return { success: false, errors };

  const db = getDb();
  const result = db.prepare(
    'INSERT INTO goals (user_id, title, description, deadline, priority, progress) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(userId, data.title.trim(), data.description ?? null, data.deadline ?? null, data.priority ?? 'medium', data.progress ?? 0);

  return { success: true, goal: getGoalById(userId, result.lastInsertRowid) };
}

function updateGoal(userId, goalId, data) {
  const existing = getGoalById(userId, goalId);
  if (!existing) return { success: false, errors: ['Goal not found'] };

  const merged = { ...existing, ...data };
  const errors = validateGoal(merged);
  if (errors.length > 0) return { success: false, errors };

  const db = getDb();
  const completed = data.progress === 100 ? 1 : (data.completed !== undefined ? (data.completed ? 1 : 0) : existing.completed);
  db.prepare(
    'UPDATE goals SET title = ?, description = ?, deadline = ?, priority = ?, progress = ?, completed = ? WHERE id = ? AND user_id = ?'
  ).run(merged.title, merged.description, merged.deadline, merged.priority, merged.progress, completed, goalId, userId);

  return { success: true, goal: getGoalById(userId, goalId) };
}

function deleteGoal(userId, goalId) {
  if (!getGoalById(userId, goalId)) return { success: false, errors: ['Goal not found'] };
  getDb().prepare('DELETE FROM goals WHERE id = ? AND user_id = ?').run(goalId, userId);
  return { success: true };
}

module.exports = { getGoals, getGoalById, createGoal, updateGoal, deleteGoal, validateGoal };
