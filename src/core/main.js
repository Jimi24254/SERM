const Validator = require('../utils/validator');
const KeywordAnalyzer = require('../modules/keyword-analyzer');
const CompetitorAnalyzer = require('../modules/competitor-analysis');
const ContentGenerator = require('../modules/content-generator');

class Main {
  constructor(config = {}) {
    // پیکربندی پیش‌فرض
    this.config = {
      apiKey: process.env.API_KEY_FIRST_AI,
      language: 'fa',
      region: 'IR',
      ...config
    };

    // اعتبارسنجی اولیه کلید API
    if (!this.config.apiKey) {
      throw new Error('کلید API الزامی است');
    }
  }

  async start(topic = 'تولید محتوای سئو') {
    try {
      // اعتبارسنجی کلید API
      Validator.validateApiKey(this.config.apiKey);

      // بررسی و پاکسازی موضوع
      const sanitizedTopic = Validator.sanitizeInput(topic) || 'تولید محتوای سئو';

      // ایجاد نمونه ماژول‌ها با تنظیمات مشترک
      const moduleConfig = {
        apiKey: this.config.apiKey,
        language: this.config.language,
        region: this.config.region
      };

      const keywordAnalyzer = new KeywordAnalyzer(moduleConfig);
      const competitorAnalyzer = new CompetitorAnalyzer(moduleConfig);
      const contentGenerator = new ContentGenerator(moduleConfig);

      // اجرای موازی تحلیل‌ها
      const [keywords, competitors, contentGuide] = await Promise.all([
        keywordAnalyzer.extractKeywords(sanitizedTopic),
        competitorAnalyzer.findTopCompetitors(sanitizedTopic),
        contentGenerator.generateSEOContentGuide({ 
          topic: sanitizedTopic,
          language: this.config.language
        })
      ]);

      // بازگرداندن نتیجه نهایی
      return {
        topic: sanitizedTopic,
        keywords,
        competitors,
        contentGuide,
        metadata: {
          language: this.config.language,
          region: this.config.region,
          processedAt: new Date().toISOString()
        },
        prompt: 'دستورالعمل تولید محتوای سئو',
        wordCount: 1800,
        tone: 'حرفه‌ای'
      };
    } catch (error) {
      // ثبت و مدیریت خطا
      console.error('خطا در اجرای main.start', error);
      throw error;
    }
  }
}

module.exports = Main;