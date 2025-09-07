// تنظیمات Jest
jest.setTimeout(30000);

// پیکربندی محیط تست
beforeEach(() => {
  // تنظیم متغیرهای محیطی تست
  process.env.NODE_ENV = 'test';
  process.env.API_KEY_FIRST_AI = 'test-api-key-123';
});

// پیکربندی خروجی کنسول
global.console = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
};