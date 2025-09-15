/**
 * @fileoverview Tests for fallback checkout functionality
 */

import {
  createFallbackCheckout,
  validateFallbackData,
  createPaymentTrackingRecord,
} from '../fallbacks/manual-checkout';
import type { FallbackCheckoutData } from '../types';

describe('Fallback Checkout Tests', () => {
  const validCheckoutData: FallbackCheckoutData = {
    amount: 2000, // $20.00 in cents
    currency: 'usd',
    description: 'Test payment',
    customerEmail: 'customer@example.com',
    metadata: {
      orderId: '123',
      source: 'web',
    },
  };

  describe('Manual Checkout Creation', () => {
    it('should create manual checkout with all required data', () => {
      const result = createFallbackCheckout(validCheckoutData, {
        mode: 'manual',
        contactEmail: 'support@example.com',
        contactPhone: '+1-555-0123',
      });

      expect(result.type).toBe('manual');
      expect(result.reference).toMatch(/^REF-/);
      if (result.type === 'manual') {
        expect(result.instructions).toContain('Payment Amount: $20.00');
        expect(result.contactInfo.email).toBe('support@example.com');
        expect(result.contactInfo.phone).toBe('+1-555-0123');
        expect(result.paymentMethods).toContain('Bank Transfer');
        expect(result.totalAmount).toBe('$20.00');
        expect(result.currency).toBe('USD');
      }
    });

    it('should create redirect checkout with proper URL', () => {
      const result = createFallbackCheckout(validCheckoutData, {
        mode: 'redirect',
        redirectUrl: 'https://payments.example.com/checkout',
      });

      expect(result.type).toBe('redirect');
      expect(result.reference).toMatch(/^REF-/);
      if (result.type === 'redirect') {
        expect(result.url).toContain('https://payments.example.com/checkout');
        expect(result.url).toContain('amount=2000');
        expect(result.url).toContain('currency=usd');
        expect(result.url).toContain('description=Test+payment');
      }
    });

    it('should include customer email in redirect URL', () => {
      const result = createFallbackCheckout(validCheckoutData, {
        mode: 'redirect',
        redirectUrl: 'https://payments.example.com/checkout',
      });

      if (result.type === 'redirect') {
        expect(result.url).toContain('email=customer%40example.com');
      }
    });

    it('should include metadata in redirect URL', () => {
      const result = createFallbackCheckout(validCheckoutData, {
        mode: 'redirect',
        redirectUrl: 'https://payments.example.com/checkout',
      });

      expect(result.type).toBe('redirect');
      if (result.type === 'redirect') {
        expect(result.url).toContain('metadata=');
      }
    });

    it('should generate unique reference numbers', () => {
      const result1 = createFallbackCheckout(validCheckoutData, { mode: 'manual' });
      const result2 = createFallbackCheckout(validCheckoutData, { mode: 'manual' });

      expect(result1.reference).not.toBe(result2.reference);
      expect(result1.reference).toMatch(/^REF-/);
      expect(result2.reference).toMatch(/^REF-/);
    });

    it('should use custom reference when provided', () => {
      const customRef = 'CUSTOM-REF-123';
      const result = createFallbackCheckout(validCheckoutData, {
        mode: 'manual',
        reference: customRef,
      });

      expect(result.reference).toBe(customRef);
    });
  });

  describe('Data Validation', () => {
    it('should validate correct checkout data', () => {
      const validation = validateFallbackData(validCheckoutData);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject negative amounts', () => {
      const invalidData = { ...validCheckoutData, amount: -100 };
      const validation = validateFallbackData(invalidData);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Amount must be positive');
    });

    it('should reject zero amounts', () => {
      const invalidData = { ...validCheckoutData, amount: 0 };
      const validation = validateFallbackData(invalidData);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Amount must be positive');
    });

    it('should reject amounts too large for manual processing', () => {
      const invalidData = { ...validCheckoutData, amount: 100000000 }; // $1M
      const validation = validateFallbackData(invalidData);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Amount too large for manual processing');
    });

    it('should reject invalid currency codes', () => {
      const invalidData = { ...validCheckoutData, currency: 'INVALID' };
      const validation = validateFallbackData(invalidData);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Invalid currency code');
    });

    it('should reject empty descriptions', () => {
      const invalidData = { ...validCheckoutData, description: '' };
      const validation = validateFallbackData(invalidData);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Description is required');
    });

    it('should reject invalid email formats', () => {
      const invalidData = { ...validCheckoutData, customerEmail: 'invalid-email' };
      const validation = validateFallbackData(invalidData);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Invalid email format');
    });

    it('should accept valid email formats', () => {
      const testEmails = [
        'user@example.com',
        'user+tag@example.co.uk',
        'user.name@subdomain.example.org',
      ];

      testEmails.forEach(email => {
        const data = { ...validCheckoutData, customerEmail: email };
        const validation = validateFallbackData(data);
        expect(validation.valid).toBe(true);
      });
    });

    it('should accept data without customer email', () => {
      const dataWithoutEmail = { ...validCheckoutData };
      delete dataWithoutEmail.customerEmail;
      
      const validation = validateFallbackData(dataWithoutEmail);
      expect(validation.valid).toBe(true);
    });
  });

  describe('Payment Tracking Records', () => {
    it('should create tracking record with all data', () => {
      const reference = 'REF-TEST-123';
      const metadata = { sessionId: 'session_123' };
      
      const record = createPaymentTrackingRecord(
        validCheckoutData,
        reference,
        metadata
      );

      expect(record).toEqual({
        reference,
        amount: 2000,
        currency: 'usd',
        description: 'Test payment',
        customerEmail: 'customer@example.com',
        status: 'pending',
        method: 'manual',
        createdAt: expect.any(String),
        metadata: {
          orderId: '123',
          source: 'web',
          sessionId: 'session_123',
          fallback: 'true',
          originalProvider: 'stripe',
        },
      });
    });

    it('should include fallback metadata markers', () => {
      const record = createPaymentTrackingRecord(
        validCheckoutData,
        'REF-TEST-123'
      );

      expect(record.metadata).toMatchObject({
        fallback: 'true',
        originalProvider: 'stripe',
      });
    });

    it('should create valid ISO date string', () => {
      const record = createPaymentTrackingRecord(
        validCheckoutData,
        'REF-TEST-123'
      );

      expect(() => new Date(record.createdAt)).not.toThrow();
      expect(new Date(record.createdAt).toISOString()).toBe(record.createdAt);
    });
  });

  describe('Amount Formatting', () => {
    it('should format USD amounts correctly', () => {
      const testCases = [
        { amount: 100, expected: '$1.00' },
        { amount: 1000, expected: '$10.00' },
        { amount: 12345, expected: '$123.45' },
        { amount: 0, expected: '$0.00' },
      ];

      testCases.forEach(({ amount, expected }) => {
        const data = { ...validCheckoutData, amount };
        const result = createFallbackCheckout(data, { mode: 'manual' });
        
        if (result.type === 'manual') {
          expect(result.totalAmount).toBe(expected);
        }
      });
    });

    it('should format different currencies', () => {
      const eurData = { ...validCheckoutData, currency: 'eur', amount: 2000 };
      const result = createFallbackCheckout(eurData, { mode: 'manual' });
      
      if (result.type === 'manual') {
        expect(result.totalAmount).toBe('€20.00');
        expect(result.currency).toBe('EUR');
      }
    });
  });

  describe('Instructions Generation', () => {
    it('should include all required payment information', () => {
      const result = createFallbackCheckout(validCheckoutData, { mode: 'manual' });
      
      if (result.type === 'manual') {
        const instructions = result.instructions.join(' ');
        
        expect(instructions).toContain('$20.00');
        expect(instructions).toContain('Test payment');
        expect(instructions).toContain('Bank Transfer');
        expect(instructions).toContain('reference number');
        expect(instructions).toContain('1-3 business days');
      }
    });

    it('should include reference number in instructions', () => {
      const result = createFallbackCheckout(validCheckoutData, { mode: 'manual' });
      
      if (result.type === 'manual') {
        const instructions = result.instructions.join(' ');
        expect(instructions).toContain(result.reference);
      }
    });
  });
});