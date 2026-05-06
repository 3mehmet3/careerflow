const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { getGoals, getGoalById, createGoal, updateGoal, deleteGoal } = require('../services/goalService');

router.use(authMiddleware);

/**
 * @swagger
 * /api/goals:
 *   get:
 *     summary: Get all goals
 *     tags: [Goals]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [low, medium, high] }
 *       - in: query
 *         name: completed
 *         schema: { type: boolean }
 *     responses:
 *       200: { description: List of goals }
 */
router.get('/', (req, res) => {
  const filters = { ...req.query };
  if (filters.completed !== undefined) filters.completed = filters.completed === 'true';
  res.json(getGoals(req.user.id, filters));
});

router.get('/:id', (req, res) => {
  const goal = getGoalById(req.user.id, req.params.id);
  if (!goal) return res.status(404).json({ error: 'Goal not found' });
  res.json(goal);
});

/**
 * @swagger
 * /api/goals:
 *   post:
 *     summary: Create a new career goal
 *     tags: [Goals]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string, example: "Get a senior developer role" }
 *               description: { type: string }
 *               deadline: { type: string, format: date, example: "2025-12-31" }
 *               priority: { type: string, enum: [low, medium, high] }
 *               progress: { type: integer, minimum: 0, maximum: 100 }
 *     responses:
 *       201: { description: Goal created }
 */
router.post('/', (req, res) => {
  const result = createGoal(req.user.id, req.body);
  if (!result.success) return res.status(400).json({ errors: result.errors });
  res.status(201).json(result.goal);
});

router.put('/:id', (req, res) => {
  const result = updateGoal(req.user.id, req.params.id, req.body);
  if (!result.success) return res.status(result.errors[0] === 'Goal not found' ? 404 : 400).json({ errors: result.errors });
  res.json(result.goal);
});

router.delete('/:id', (req, res) => {
  const result = deleteGoal(req.user.id, req.params.id);
  if (!result.success) return res.status(404).json({ errors: result.errors });
  res.json({ message: 'Goal deleted' });
});

module.exports = router;
