const { calculateSkillFitScore } = require('../src/services/skillFitService');
describe('skillFitService - calculateSkillFitScore', () => {
  const userSkills = [
    { name: 'JavaScript', current_level: 70 },
    { name: 'CSS', current_level: 80 },
    { name: 'HTML', current_level: 90 },
  ];

  test('returns null score when no project skills defined', () => {
    const result = calculateSkillFitScore([], userSkills);
    expect(result.score).toBeNull();
  });

  test('calculates 100% when user meets all requirements', () => {
    const projectSkills = [{ skill_name: 'HTML', required_level: 90 }];
    const result = calculateSkillFitScore(projectSkills, userSkills);
    expect(result.score).toBe(100);
  });

  test('calculates partial score correctly', () => {
    const projectSkills = [
      { skill_name: 'JavaScript', required_level: 100 },
    ];
    const result = calculateSkillFitScore(projectSkills, userSkills);
    expect(result.score).toBe(70);
  });

  test('missing skill counts as 0', () => {
    const projectSkills = [{ skill_name: 'Python', required_level: 80 }];
    const result = calculateSkillFitScore(projectSkills, userSkills);
    expect(result.score).toBe(0);
    expect(result.breakdown[0].user_level).toBe(0);
  });

  test('score does not exceed 100 even if user level exceeds requirement', () => {
    const projectSkills = [{ skill_name: 'HTML', required_level: 50 }];
    const result = calculateSkillFitScore(projectSkills, userSkills);
    expect(result.score).toBe(100);
  });

  test('provides correct message for high score', () => {
    const projectSkills = [{ skill_name: 'HTML', required_level: 80 }];
    const result = calculateSkillFitScore(projectSkills, userSkills);
    expect(result.message).toContain('Great fit');
  });

  test('provides correct message for low score', () => {
    const projectSkills = [{ skill_name: 'Python', required_level: 80 }];
    const result = calculateSkillFitScore(projectSkills, userSkills);
    expect(result.message).toContain('Low fit');
  });

  test('breakdown contains all project skills', () => {
    const projectSkills = [
      { skill_name: 'JavaScript', required_level: 70 },
      { skill_name: 'CSS', required_level: 80 },
    ];
    const result = calculateSkillFitScore(projectSkills, userSkills);
    expect(result.breakdown).toHaveLength(2);
    expect(result.breakdown[0].skill).toBe('JavaScript');
  });
});
