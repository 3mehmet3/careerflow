const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { getProjects, getProjectById, createProject, updateProject, deleteProject } = require('../services/projectService');
const { getSkills } = require('../services/skillService');
const { calculateSkillFitScore } = require('../services/skillFitService');

router.use(authMiddleware);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, completed, paused, cancelled] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of projects }
 */
router.get('/', (req, res) => {
  res.json(getProjects(req.user.id, req.query));
});

router.get('/:id', (req, res) => {
  const project = getProjectById(req.user.id, req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

/**
 * @swagger
 * /api/projects/{id}/skill-fit:
 *   get:
 *     summary: Calculate skill-fit score for a project
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Skill fit score with breakdown
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 score: { type: integer, example: 80 }
 *                 message: { type: string }
 *                 breakdown: { type: array }
 */
router.get('/:id/skill-fit', (req, res) => {
  const project = getProjectById(req.user.id, req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const userSkills = getSkills(req.user.id);
  const result = calculateSkillFitScore(project.skills, userSkills);
  res.json(result);
});

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string, example: "E-commerce Website" }
 *               description: { type: string }
 *               client: { type: string }
 *               status: { type: string, enum: [active, completed, paused, cancelled] }
 *               deadline: { type: string, format: date }
 *               technologies: { type: string, example: "Node.js, React, PostgreSQL" }
 *               skills:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     skill_name: { type: string }
 *                     required_level: { type: integer }
 *     responses:
 *       201: { description: Project created }
 */
router.post('/', (req, res) => {
  const result = createProject(req.user.id, req.body);
  if (!result.success) return res.status(400).json({ errors: result.errors });
  res.status(201).json(result.project);
});

router.put('/:id', (req, res) => {
  const result = updateProject(req.user.id, req.params.id, req.body);
  if (!result.success) return res.status(result.errors[0] === 'Project not found' ? 404 : 400).json({ errors: result.errors });
  res.json(result.project);
});

router.delete('/:id', (req, res) => {
  const result = deleteProject(req.user.id, req.params.id);
  if (!result.success) return res.status(404).json({ errors: result.errors });
  res.json({ message: 'Project deleted' });
});

module.exports = router;
