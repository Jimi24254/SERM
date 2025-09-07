const Main = require('../src/core/main');

describe('SERM Main Module', () => {
  let originalEnv;

  beforeAll(() => {
    // ذخیره محیط اصلی
    originalEnv = { ...process.env };
  });

  afterAll(() => {
    // بازگرداندن محیط اصلی
    process.env = originalEnv;
  });

  beforeEach(() => {
    // تنظیم کلید API معتبر
    process.env.API_KEY_FIRST_AI = '[REDACTED]';
  });

  test('اجرای موفق start method با موضوع پیش‌فرض', async () => {
    const main = new Main();
    const result = await main.start();
    
    expect(result).toBeTruthy();
    expect(result.topic).toBe('تولید محتوای سئو');
  });

  test('بررسی استخراج کلمات کلیدی', async () => {
    const main = new Main();
    const result = await main.start('سئو محتوا');
    
    expect(result.keywords).toBeTruthy();
    expect(result.keywords.mainKeywords).toBeInstanceOf(Array);
    expect(result.keywords.secondaryKeywords).toBeInstanceOf(Array);
    expect(result.keywords.mainKeywords.length).toBeGreaterThan(0);
    expect(result.keywords.secondaryKeywords.length).toBeGreaterThan(0);
    expect(result.keywords).toHaveProperty('keywordDensity');
  });

  test('بررسی تحلیل رقبا', async () => {
    const main = new Main();
    const result = await main.start('بازاریابی محتوایی');
    
    expect(result.competitors).toHaveLength(3);
    result.competitors.forEach(competitor => {
      expect(competitor).toHaveProperty('name');
      expect(competitor).toHaveProperty('url');
      expect(competitor).toHaveProperty('strengths');
      expect(competitor).toHaveProperty('weaknesses');
    });
  });

  test('بررسی راهنمای تولید محتوا', async () => {
    const main = new Main();
    const result = await main.start('استراتژی سئو');
    
    expect(result.contentGuide).toBeTruthy();
    expect(result.contentGuide).toHaveProperty('topic');
    expect(result.contentGuide).toHaveProperty('wordCount', 1800);
    expect(result.contentGuide).toHaveProperty('tone', 'حرفه‌ای');
  });

  test('بررسی متادیتا', async () => {
    const main = new Main({ language: 'fa', region: 'IR' });
    const result = await main.start();
    
    expect(result.metadata).toBeTruthy();
    expect(result.metadata.language).toBe('fa');
    expect(result.metadata.region).toBe('IR');
    expect(result.metadata).toHaveProperty('processedAt');
  });

  test('بررسی برخورد با خطای کلید API نامعتبر', async () => {
    const main = new Main({ apiKey: '' });
    
    await expect(main.start()).rejects.toThrow('کلید API الزامی است');
  });
});