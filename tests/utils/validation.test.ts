import { describe, it, expect } from 'vitest';
import { validateSearchQuery, validateEditReason, validatePaginationParams, validateFinancialInput } from '../../server/utils/validation';

describe('Validation Functions - Security & Input Sanitization', () => {
  describe('validateSearchQuery', () => {
    it('should accept valid search queries', () => {
      const result = validateSearchQuery('John Doe');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('John Doe');
    });

    it('should reject queries over 200 characters', () => {
      const longQuery = 'a'.repeat(201);
      const result = validateSearchQuery(longQuery);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('200 characters');
    });

    it('should sanitize and trim whitespace', () => {
      const result = validateSearchQuery('  John   Doe  ');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('John Doe');
    });

    it('should handle empty queries', () => {
      const result = validateSearchQuery('');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('');
    });

    it('should handle special characters safely', () => {
      const result = validateSearchQuery('O\'Brien & Sons');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('O\'Brien & Sons');
    });
  });

  describe('validateEditReason', () => {
    it('should accept valid edit reasons (10+ words, 3+ chars each)', () => {
      const reason = 'Customer requested extension of rental period due to unexpected delay in return flight';
      const result = validateEditReason(reason);
      expect(result.valid).toBe(true);
    });

    it('should reject reasons with fewer than 10 words', () => {
      const reason = 'Customer requested extension of rental period';
      const result = validateEditReason(reason);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('10'); // Contains "10" in the message
      expect(result.wordCount).toBeLessThan(10);
    });

    it('should reject reasons with words shorter than 3 characters', () => {
      const reason = 'We do it as we go on up to do it'; // Many words < 3 chars
      const result = validateEditReason(reason);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('10'); // Should fail for word count
    });

    it('should reject bypass attempts with repeated short words', () => {
      const reason = 'aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa';
      const result = validateEditReason(reason);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('meaningful');
    });

    it('should trim and normalize whitespace', () => {
      const reason = '  Customer   requested   extension   of   rental   period   due   to   unexpected   delay   from   airport   customs   clearance  ';
      const result = validateEditReason(reason);
      expect(result.valid).toBe(true); // 13 valid words, 13 unique
    });
  });

  describe('validatePaginationParams', () => {
    it('should accept valid pagination params', () => {
      const result = validatePaginationParams(10, 0);
      expect(result.valid).toBe(true);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
    });

    it('should enforce minimum limit of 1', () => {
      const result = validatePaginationParams(0, 0);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('between 1 and 1000');
    });

    it('should enforce maximum limit of 1000', () => {
      const result = validatePaginationParams(1001, 0);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('between 1 and 1000');
    });

    it('should reject negative offset', () => {
      const result = validatePaginationParams(10, -1);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('non-negative');
    });

    it('should handle string inputs and convert to numbers', () => {
      const result = validatePaginationParams('50' as any, '100' as any);
      expect(result.valid).toBe(true);
      expect(result.limit).toBe(50);
      expect(result.offset).toBe(100);
    });

    it('should reject non-numeric inputs', () => {
      const result = validatePaginationParams('abc' as any, 0);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('valid number');
    });
  });

  describe('validateFinancialInput - NaN Protection', () => {
    it('should accept valid numbers', () => {
      expect(validateFinancialInput(100, 'amount')).toBe(100);
      expect(validateFinancialInput(99.99, 'price')).toBe(99.99);
      expect(validateFinancialInput(0, 'discount')).toBe(0);
    });

    it('should accept string numbers and convert them', () => {
      expect(validateFinancialInput('100', 'amount')).toBe(100);
      expect(validateFinancialInput('99.99', 'price')).toBe(99.99);
    });

    it('should reject NaN values', () => {
      expect(() => validateFinancialInput(NaN, 'amount')).toThrow('Invalid amount');
      expect(() => validateFinancialInput('abc', 'price')).toThrow('Invalid price');
      expect(() => validateFinancialInput(undefined, 'total')).toThrow('Invalid total');
    });

    it('should reject Infinity', () => {
      expect(() => validateFinancialInput(Infinity, 'amount')).toThrow('Invalid amount');
      expect(() => validateFinancialInput(-Infinity, 'amount')).toThrow('Invalid amount');
    });

    it('should handle edge cases', () => {
      expect(validateFinancialInput(-50, 'refund')).toBe(-50); // Negative numbers OK (refunds)
      expect(validateFinancialInput(0.01, 'cents')).toBe(0.01); // Very small numbers
      expect(validateFinancialInput(999999.99, 'large')).toBe(999999.99); // Large numbers
    });
  });
});
