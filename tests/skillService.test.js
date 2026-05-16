const { validateSkill } = require('../../src/services/skillService');

describe('skillService - validateSkill', () => {
  test('valid skill returns no errors', () => {
    const errors = validateSkill({
      name: 'JavaScript',
      category: 'Frontend',
      current_level: 70,
      target_level: 90,
      status: 'learning'
    });
    expect(errors).toHaveLength(0);
  });

  test('missing name returns error', () => {
    const errors = validateSkill({ name: '', category: 'Frontend' });
    expect(errors).toContain('Skill name is required');
  });

  test('missing category returns error', () => {
    const errors = validateSkill({ name: 'JS', category: '' });
    expect(errors).toContain('Category is required');
  });

  test('current_level above 100 returns error', () => {
    const errors = validateSkill({ name: 'JS', category: 'FE', current_level: 150 });
    expect(errors).toContain('Current level must be between 0 and 100');
  });

  test('current_level below 0 returns error', () => {
    const errors = validateSkill({ name: 'JS', category: 'FE', current_level: -1 });
    expect(errors).toContain('Current level must be between 0 and 100');
  });

  test('invalid status returns error', () => {
    const errors = validateSkill({ name: 'JS', category: 'FE', status: 'unknown' });
    expect(errors).toContain('Status must be learning, completed, or paused');
  });

  test('valid status values do not return error', () => {
    ['learning', 'completed', 'paused'].forEach(status => {
      const errors = validateSkill({ name: 'JS', category: 'FE', status });
      expect(errors).not.toContain('Status must be learning, completed, or paused');
    });
  });
});
