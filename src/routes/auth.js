const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../services/authService');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: "Ali Yılmaz" }
 *               email: { type: string, example: "ali@example.com" }
 *               password: { type: string, example: "secret123" }
 *     responses:
 *       201: { description: User created }
 *       400: { description: Validation error }
 */
router.post('/register', async (req, res) => {
  const result = await registerUser(req.body);
  if (!result.success) return res.status(400).json({ errors: result.errors });
  res.status(201).json({ token: result.token, user: result.user });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
router.post('/login', async (req, res) => {
  const result = await loginUser(req.body);
  if (!result.success) return res.status(401).json({ errors: result.errors });
  res.json({ token: result.token, user: result.user });
});

module.exports = router;
