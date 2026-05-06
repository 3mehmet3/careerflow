const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { getSkills, getSkillById, createSkill, updateSkill, deleteSkill } = require('../services/skillService');

router.use(authMiddleware);

/**
 * @swagger
 * /api/skills:
 *   get:
 *     summary: Get all skills for the authenticated user
 *     tags: [Skills]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [learning, completed, paused] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of skills }
 */
router.get('/', (req, res) => {
  const skills = getSkills(req.user.id, req.query);
  res.json(skills);
});

/**
 * @swagger
 * /api/skills/{id}:
 *   get:
 *     summary: Get a single skill
 *     tags: [Skills]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Skill data }
 *       404: { description: Not found }
 */
router.get('/:id', (req, res) => {
  const skill = getSkillById(req.user.id, req.params.id);
  if (!skill) return res.status(404).json({ error: 'Skill not found' });
  res.json(skill);
});

/**
 * @swagger
 * /api/skills:
 *   post:
 *     summary: Create a new skill
 *     tags: [Skills]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, category]
 *             properties:
 *               name: { type: string, example: "JavaScript" }
 *               category: { type: string, example: "Frontend" }
 *               current_level: { type: integer, example: 70 }
 *               target_level: { type: integer, example: 90 }
 *               status: { type: string, enum: [learning, completed, paused] }
 *               notes: { type: string }
 *     responses:
 *       201: { description: Skill created }
 *       400: { description: Validation error }
 */
router.post('/', (req, res) => {
  const result = createSkill(req.user.id, req.body);
  if (!result.success) return res.status(400).json({ errors: result.errors });
  res.status(201).json(result.skill);
});

/**
 * @swagger
 * /api/skills/{id}:
 *   put:
 *     summary: Update a skill
 *     tags: [Skills]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200: { description: Skill updated }
 *       404: { description: Not found }
 */
router.put('/:id', (req, res) => {
  const result = updateSkill(req.user.id, req.params.id, req.body);
  if (!result.success) return res.status(result.errors[0] === 'Skill not found' ? 404 : 400).json({ errors: result.errors });
  res.json(result.skill);
});

/**
 * @swagger
 * /api/skills/{id}:
 *   delete:
 *     summary: Delete a skill
 *     tags: [Skills]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Skill deleted }
 *       404: { description: Not found }
 */
router.delete('/:id', (req, res) => {
  const result = deleteSkill(req.user.id, req.params.id);
  if (!result.success) return res.status(404).json({ errors: result.errors });
  res.json({ message: 'Skill deleted' });
});

module.exports = router;
