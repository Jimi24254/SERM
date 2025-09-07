const Validator = require('../src/utils/validator');

describe('Validator Utility', () => {
  describe('validateApiKey', () => {
    test('کلید API معتبر باید تایید شود', () => {
      const validKeys = [
        '[REDACTED]',
        'valid_api_key_123',
        'test-api-key-456',
        'ABCDEFG_1234567890',
        '[test_key]',
        'valid-key-with-brackets-[123]'
      ];

      validKeys.forEach(key => {
        expect(() => Validator.validateApiKey(key)).not.toThrow();
      });
    });

    test('کلید API نامعتبر باید خطا ایجاد کند', () => {
      const invalidKeys = [
        '',
        null,
        undefined,
        '   ',
        'short',
        '!@#$%^&*',
        'کلید فارسی',
        'a'.repeat(200),
        'key with space',
        'key@with@symbols'
      ];

      invalidKeys.forEach(key => {
        expect(() => Validator.validateApiKey(key)).toThrow();
      });
    });

    test('کلید API با فاصله اضافی باید پاک شود', () => {
      const key = '   valid_api_key_123   ';
      expect(() => Validator.validateApiKey(key)).not.toThrow();
    });
  });

  describe('sanitizeInput', () => {
    test('ورودی آلوده باید پاکسازی شود', () => {
      const dirtyInputs = [
        '<script>alert("XSS")</script>محتوای امن',
        'محتوا با <a href="malicious.com">لینک مخرب</a>',
        '<b>محتوای با تگ HTML</b>'
      ];

      dirtyInputs.forEach(input => {
        const sanitizedInput = Validator.sanitizeInput(input);
        expect(sanitizedInput).not.toContain('<script');
        expect(sanitizedInput).not.toContain('<a');
        expect(sanitizedInput).not.toContain('<b>');
      });
    });

    test('ورودی غیر رشته باید برگردانده شود', () => {
      const nonStringInputs = [
        123,
        true,
        null,
        undefined,
        {},
        []
      ];

      nonStringInputs.forEach(input => {
        expect(Validator.sanitizeInput(input)).toBe(input);
      });
    });

    test('ورودی خالی باید پاکسازی شود', () => {
      const emptyInputs = [
        '',
        '   ',
        '\t\n'
      ];

      emptyInputs.forEach(input => {
        expect(Validator.sanitizeInput(input)).toBe('');
      });
    });
  });
});