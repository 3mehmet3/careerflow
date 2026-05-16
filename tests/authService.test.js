const { validateRegisterInput, validateLoginInput } = require('../../src/services/authService');

describe('authService - validateRegisterInput', () => {
  test('valid input returns no errors', () => {
    const errors = validateRegisterInput({ name: 'Ali', email: 'ali@test.com', password: 'secret123' });
    expect(errors).toHaveLength(0);
  });

  test('short name returns error', () => {
    const errors = validateRegisterInput({ name: 'A', email: 'ali@test.com', password: 'secret123' });
    expect(errors).toContain('Name must be at least 2 characters');
  });

  test('invalid email returns error', () => {
    const errors = validateRegisterInput({ name: 'Ali', email: 'not-an-email', password: 'secret123' });
    expect(errors).toContain('Valid email is required');
  });

  test('short password returns error', () => {
    const errors = validateRegisterInput({ name: 'Ali', email: 'ali@test.com', password: '123' });
    expect(errors).toContain('Password must be at least 6 characters');
  });

  test('missing all fields returns multiple errors', () => {
    const errors = validateRegisterInput({});
    expect(errors.length).toBeGreaterThanOrEqual(3);
  });
});

describe('authService - validateLoginInput', () => {
  test('valid input returns no errors', () => {
    const errors = validateLoginInput({ email: 'ali@test.com', password: 'secret' });
    expect(errors).toHaveLength(0);
  });

  test('missing email returns error', () => {
    const errors = validateLoginInput({ password: 'secret' });
    expect(errors).toContain('Email is required');
  });

  test('missing password returns error', () => {
    const errors = validateLoginInput({ email: 'ali@test.com' });
    expect(errors).toContain('Password is required');
  });
});
