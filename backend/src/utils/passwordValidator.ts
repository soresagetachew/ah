import { settingsService } from '../services/settingsService';

export const validatePasswordPolicy = async (password: string): Promise<{ isValid: boolean; message?: string }> => {
  const minLength = await settingsService.getNumber('password_min_length', 8);
  const requireUppercase = await settingsService.isEnabled('password_require_uppercase');
  const requireNumbers = await settingsService.isEnabled('password_require_numbers');
  const requireSpecial = await settingsService.isEnabled('password_require_special');

  if (password.length < minLength) {
    return { isValid: false, message: `Password must be at least ${minLength} characters long.` };
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter.' };
  }

  if (requireNumbers && !/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number.' };
  }

  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character.' };
  }

  return { isValid: true };
};
