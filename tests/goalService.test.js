const { validateGoal } = require('../src/services/goalService');
describe('goalService - validateGoal', () => {
  test('valid goal returns no errors', () => {
    const errors = validateGoal({ title: 'Get promoted', priority: 'high', progress: 50, deadline: '2025-12-31' });
    expect(errors).toHaveLength(0);
  });

  test('missing title returns error', () => {
    const errors = validateGoal({ title: '' });
    expect(errors).toContain('Title is required');
  });

  test('invalid priority returns error', () => {
    const errors = validateGoal({ title: 'Goal', priority: 'extreme' });
    expect(errors).toContain('Priority must be low, medium, or high');
  });

  test('progress above 100 returns error', () => {
    const errors = validateGoal({ title: 'Goal', progress: 110 });
    expect(errors).toContain('Progress must be between 0 and 100');
  });

  test('progress below 0 returns error', () => {
    const errors = validateGoal({ title: 'Goal', progress: -5 });
    expect(errors).toContain('Progress must be between 0 and 100');
  });

  test('invalid deadline returns error', () => {
    const errors = validateGoal({ title: 'Goal', deadline: 'not-a-date' });
    expect(errors).toContain('Invalid deadline date');
  });

  test('valid priorities do not return errors', () => {
    ['low', 'medium', 'high'].forEach(priority => {
      const errors = validateGoal({ title: 'Goal', priority });
      expect(errors).not.toContain('Priority must be low, medium, or high');
    });
  });
});
