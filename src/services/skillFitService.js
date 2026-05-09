/**
 * Calculates a compatibility score between a project's required skills
 * and the user's current skill levels.
 *
 * Formula:
 *  - For each required skill, find if the user has it
 *  - Score per skill = min(userLevel / requiredLevel, 1.0) * 100
 *  - Missing skills count as 0
 *  - Final score = average of all skill scores
 */
function calculateSkillFitScore(projectSkills, userSkills) {
  if (!projectSkills || projectSkills.length === 0) {
    return { score: null, breakdown: [], message: 'No required skills defined for this project' };
  }

  const userSkillMap = {};
  userSkills.forEach(s => {
    userSkillMap[s.name.toLowerCase()] = s.current_level;
  });

  const breakdown = projectSkills.map(req => {
    const userLevel = userSkillMap[req.skill_name.toLowerCase()] ?? 0;
    const ratio = req.required_level > 0 ? Math.min(userLevel / req.required_level, 1.0) : 1.0;
    return {
      skill: req.skill_name,
      required_level: req.required_level,
      user_level: userLevel,
      match_percentage: Math.round(ratio * 100)
    };
  });

  const total = breakdown.reduce((sum, s) => sum + s.match_percentage, 0);
  const score = Math.round(total / breakdown.length);

  let message;
  if (score >= 80) message = 'Great fit! You are well-prepared for this project.';
  else if (score >= 50) message = 'Moderate fit. Some skill gaps to work on.';
  else message = 'Low fit. Consider improving your skills before taking this project.';

  return { score, breakdown, message };
}

module.exports = { calculateSkillFitScore };
