import { pool } from '../config/database';
import { settingsService } from './settingsService';
import bcrypt from 'bcryptjs';

export class PasswordPolicyService {
  async getPolicy() {
    return {
      minLength: await settingsService.getNumber('password_min_length', 8),
      requireUppercase: await settingsService.isEnabled('password_require_uppercase'),
      requireLowercase: await settingsService.isEnabled('password_require_lowercase'),
      requireNumber: await settingsService.isEnabled('password_require_number'),
      requireSymbol: await settingsService.isEnabled('password_require_symbol'),
      expiryDays: await settingsService.getNumber('password_expiry_days', 0),
      preventReuseCount: await settingsService.getNumber('password_prevent_reuse', 0),
    };
  }

  async validate(password: string): Promise<{ valid: boolean; errors: string[] }> {
    const policy = await this.getPolicy();
    const errors: string[] = [];

    if (password.length < policy.minLength)
      errors.push(`Password must be at least ${policy.minLength} characters`);
    if (policy.requireUppercase && !/[A-Z]/.test(password))
      errors.push('Password must contain at least one uppercase letter (A-Z)');
    if (policy.requireLowercase && !/[a-z]/.test(password))
      errors.push('Password must contain at least one lowercase letter (a-z)');
    if (policy.requireNumber && !/[0-9]/.test(password))
      errors.push('Password must contain at least one number (0-9)');
    if (policy.requireSymbol && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password))
      errors.push('Password must contain at least one special character (!@#$...)');

    return { valid: errors.length === 0, errors };
  }

  async checkReuse(userId: string, newPassword: string): Promise<{ reused: boolean; message?: string }> {
    const count = await settingsService.getNumber('password_prevent_reuse', 0);
    if (count === 0) return { reused: false };

    // Check password_history table for last N passwords
    const { rows } = await pool.query(
      `SELECT password_hash FROM password_history
       WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
      [userId, count]
    );

    for (const row of rows) {
      if (await bcrypt.compare(newPassword, row.password_hash)) {
        return {
          reused: true,
          message: `Password was used recently. Choosing one of your last ${count} passwords is not allowed.`
        };
      }
    }
    return { reused: false };
  }

  async checkExpiry(user: any): Promise<{ expired: boolean; daysRemaining?: number }> {
    const expiryDays = await settingsService.getNumber('password_expiry_days', 0);
    if (expiryDays === 0) return { expired: false }; // no expiry

    if (!user.password_changed_at) return { expired: true };

    const daysSinceChange = Math.floor(
      (Date.now() - new Date(user.password_changed_at).getTime())
      / 1000 / 60 / 60 / 24
    );
    const daysRemaining = expiryDays - daysSinceChange;

    return {
      expired: daysRemaining <= 0,
      daysRemaining: Math.max(0, daysRemaining)
    };
  }

  async addToHistory(userId: string, passwordHash: string) {
    await pool.query(
      'INSERT INTO password_history (user_id, password_hash) VALUES (?, ?)',
      [userId, passwordHash]
    );
    
    // Cleanup old history
    const count = await settingsService.getNumber('password_prevent_reuse', 5);
    await pool.query(
      'DELETE FROM password_history WHERE user_id = ? AND id NOT IN (SELECT id FROM (SELECT id FROM password_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?) as tmp)',
      [userId, userId, count + 1]
    );
  }

  async generateCompliantPassword(): Promise<string> {
    const policy = await this.getPolicy();
    const length = Math.max(policy.minLength, 12);
    
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let chars = lowercase;
    if (policy.requireUppercase) chars += uppercase;
    if (policy.requireNumber) chars += numbers;
    if (policy.requireSymbol) chars += symbols;
    
    let password = '';
    // Ensure at least one of each required type
    if (policy.requireUppercase) password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    if (policy.requireNumber) password += numbers[Math.floor(Math.random() * numbers.length)];
    if (policy.requireSymbol) password += symbols[Math.floor(Math.random() * symbols.length)];
    
    while (password.length < length) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }
    
    // Shuffle
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  }
}

export const passwordPolicy = new PasswordPolicyService();
