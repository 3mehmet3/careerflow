const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../db/database');
const { JWT_SECRET } = require('../middleware/auth');

function validateRegisterInput({ name, email, password }) {
  const errors = [];
  if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email is required');
  if (!password || password.length < 6) errors.push('Password must be at least 6 characters');
  return errors;
}

function validateLoginInput({ email, password }) {
  const errors = [];
  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');
  return errors;
}

async function registerUser({ name, email, password }) {
  const errors = validateRegisterInput({ name, email, password });
  if (errors.length > 0) return { success: false, errors };

  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) return { success: false, errors: ['Email already in use'] };

  const hashed = await bcrypt.hash(password, 10);
  const result = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)')
    .run(name.trim(), email.toLowerCase(), hashed);

  const token = jwt.sign({ id: result.lastInsertRowid, email: email.toLowerCase(), name: name.trim() }, JWT_SECRET, { expiresIn: '7d' });
  return { success: true, token, user: { id: result.lastInsertRowid, name: name.trim(), email: email.toLowerCase() } };
}

async function loginUser({ email, password }) {
  const errors = validateLoginInput({ email, password });
  if (errors.length > 0) return { success: false, errors };

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user) return { success: false, errors: ['Invalid credentials'] };

  const match = await bcrypt.compare(password, user.password);
  if (!match) return { success: false, errors: ['Invalid credentials'] };

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
  return { success: true, token, user: { id: user.id, name: user.name, email: user.email } };
}

module.exports = { registerUser, loginUser, validateRegisterInput, validateLoginInput };
