const KeywordAnalyzer = require('../modules/keyword-analyzer');
const CompetitorAnalyzer = require('../modules/competitor-analysis');
const ContentGenerator = require('../modules/content-generator');
const Validator = require('../utils/validator');

class Main {
  constructor() {
    this.config = {
      apiKey: process.env.API_KEY_FIRST_AI || process.env.API_KEY_GEMINI || process.env.API_KEY_GPT,
      language: 'fa',
      region: 'IR'
    };

    // اعتبارسنجی کلید API
    if (!this.config.apiKey) {
      throw new Error('کلید API الزامی است');
    }

    // ایجاد نمونه‌های ماژول‌ها
    this.keywordAnalyzer = new KeywordAnalyzer(this.config);
    this.competitorAnalyzer = new CompetitorAnalyzer(this.config);
    this.contentGenerator = new ContentGenerator(this.config);
    this.validator = new Validator();
  }

  async start(inputTopic = null) {
    try {
      console.log('🚀 شروع تحلیل SERM...');
      
      // موضوع پیش‌فرض یا دریافتی از کاربر
      const topic = inputTopic || 'تولید محتوای سئو';
      
      // اعتبارسنجی ورودی
      const validationResult = this.validator.validateInput({ topic });
      if (!validationResult.isValid) {
        throw new Error(`خطای اعتبارسنجی: ${validationResult.errors.join(', ')}`);
      }

      console.log(`📝 تحلیل موضوع: ${topic}`);

      // مرحله 1: تحلیل کلمات کلیدی
      console.log('🔍 تحلیل کلمات کلیدی...');
      const keywords = await this.keywordAnalyzer.extractKeywords(topic);
      console.log(`✅ ${keywords.totalKeywords || 0} کلمه کلیدی شناسایی شد`);

      // مرحله 2: تحلیل رقبا
      console.log('🏆 تحلیل رقبا...');
      const competitors = await this.competitorAnalyzer.findTopCompetitors(topic);
      console.log(`✅ ${competitors.competitors?.length || 0} رقیب تحلیل شد`);

      // مرحله 3: تولید راهنمای محتوا
      console.log('📋 تولید راهنمای محتوا...');
      const contentResult = await this.contentGenerator.generateContentGuide(topic, keywords, competitors);
      console.log('✅ راهنمای محتوا و پرامپت نهایی تولید شد');

      // ساخت نتیجه نهایی
      const result = {
        // اطلاعات اساسی
        topic: topic,
        analysisDate: new Date().toISOString(),
        
        // نتایج تحلیل کلمات کلیدی
        keywords: {
          mainKeywords: keywords.mainKeywords || [],
          secondaryKeywords: keywords.secondaryKeywords || [],
          longTailKeywords: keywords.longTailKeywords || [],
          semanticKeywords: keywords.semanticKeywords || [],
          keywordDensity: keywords.keywordDensity || 1.5,
          totalAnalyzed: keywords.totalKeywords || 0
        },

        // نتایج تحلیل رقبا
        competitors: {
          list: competitors.competitors || [],
          totalAnalyzed: competitors.competitors?.length || 0,
          marketAnalysis: competitors.marketAnalysis || {},
          detailedAnalysis: competitors.detailedAnalysis || []
        },

        // راهنمای محتوا
        contentGuide: contentResult.contentGuide || {},

        // پرامپت نهایی برای Gemini Pro 2.5
        finalPrompt: contentResult.finalPrompt || {},

        // متادیتا
        metadata: {
          language: this.config.language,
          region: this.config.region,
          processedAt: new Date().toISOString(),
          version: '1.0',
          engine: 'SERM'
        },

        // خلاصه اجرایی
        executiveSummary: this.generateExecutiveSummary(topic, keywords, competitors, contentResult)
      };

      console.log('🎉 تحلیل SERM با موفقیت تکمیل شد');
      return result;

    } catch (error) {
      console.error('❌ خطا در اجرای SERM:', error.message);
      
      // لاگ خطای دقیق‌تر برای دیباگ
      if (process.env.NODE_ENV === 'development') {
        console.error('جزئیات خطا:', error);
      }

      // بازگشت نتیجه خطا
      return {
        success: false,
        error: error.message,
        topic: inputTopic || 'نامشخص',
        timestamp: new Date().toISOString(),
        fallbackResult: this.getFallbackResult(inputTopic || 'تولید محتوای سئو')
      };
    }
  }

  generateExecutiveSummary(topic, keywords, competitors, contentResult) {
    return {
      overview: `تحلیل جامع موضوع "${topic}" شامل ${keywords.totalKeywords || 0} کلمه کلیدی و ${competitors.competitors?.length || 0} رقیب اصلی`,
      
      keyFindings: [
        `کلمات کلیدی اصلی: ${keywords.mainKeywords?.slice(0, 3).map(k => k.keyword || k).join(', ') || 'نامشخص'}`,
        `سطح رقابت: ${competitors.marketAnalysis?.competitionLevel || 'متوسط'}`,
        `فرصت‌های شناسایی شده: ${competitors.marketAnalysis?.opportunities?.length || 0} مورد`,
        `تعداد کلمات پیشنهادی محتوا: ${contentResult.contentGuide?.structure?.totalWordCount || 2500}`
      ],

      recommendations: [
        'تمرکز بر کلمات کلیدی با رقابت کمتر',
        'استفاده از شکاف‌های محتوایی رقبا',
        'بهینه‌سازی برای جستجوهای محلی',
        'تولید محتوای عمیق‌تر از رقبا'
      ],

      nextSteps: [
        'استفاده از پرامپت نهایی برای تولید محتوا',
        'بررسی و تنظیم محتوا بر اساس راهنما',
        'پیاده‌سازی استراتژی‌های سئو پیشنهادی',
        'نظارت بر عملکرد و بهینه‌سازی مداوم'
      ],

      competitiveAdvantage: contentResult.contentGuide?.competitiveAdvantage?.differentiators || [
        'محتوای جامع‌تر',
        'رویکرد عملی‌تر',
        'اطلاعات به‌روزتر'
      ]
    };
  }

  getFallbackResult(topic) {
    return {
      topic: topic,
      keywords: {
        mainKeywords: [
          { keyword: topic, searchVolume: 'متوسط', competition: 'متوسط', relevanceScore: 10 },
          { keyword: `راهنمای ${topic}`, searchVolume: 'کم', competition: 'آسان', relevanceScore: 9 },
          { keyword: `نکات ${topic}`, searchVolume: 'کم', competition: 'آسان', relevanceScore: 8 }
        ],
        secondaryKeywords: [
          { keyword: `آموزش ${topic}`, searchVolume: 'کم', competition: 'آسان', relevanceScore: 8 },
          { keyword: `بهترین روش ${topic}`, searchVolume: 'کم', competition: 'متوسط', relevanceScore: 7 }
        ],
        keywordDensity: 1.5,
        totalAnalyzed: 5
      },
      competitors: {
        list: [
          {
            name: 'رقیب اصلی',
            url: 'https://example.com',
            strengths: ['محتوای منظم', 'سئو قوی'],
            weaknesses: ['سرعت پایین', 'تجربه کاربری ضعیف'],
            domainAuthority: 65
          }
        ],
        totalAnalyzed: 1,
        marketAnalysis: {
          competitionLevel: 'متوسط',
          opportunities: ['محتوای عمیق‌تر', 'بهبود سرعت سایت']
        }
      },
      contentGuide: {
        structure: {
          totalWordCount: 2500,
          introduction: { wordCount: 300, purpose: 'جلب توجه' },
          mainBody: { wordCount: 1900, sections: ['مفاهیم اساسی', 'روش‌های عملی'] },
          conclusion: { wordCount: 300, purpose: 'جمع‌بندی' }
        },
        seoOptimization: {
          keywordDensity: { primary: '1.5%', secondary: '1%' },
          headingStructure: { h1: `راهنمای ${topic}`, h2: ['مقدمه', 'محتوای اصلی', 'نتیجه‌گیری'] }
        }
      },
      finalPrompt: {
        prompt: `یک مقاله جامع درباره "${topic}" بنویس که شامل 2500 کلمه باشد و برای سئو بهینه‌سازی شده باشد.`,
        metadata: {
          targetModel: 'Gemini Pro 2.5',
          language: 'fa',
          createdAt: new Date().toISOString()
        }
      },
      metadata: {
        language: 'fa',
        region: 'IR',
        processedAt: new Date().toISOString(),
        version: '1.0',
        engine: 'SERM',
        note: 'نتیجه پیش‌فرض به دلیل خطا در دریافت داده‌های واقعی'
      }
    };
  }

  // متد کمکی برای تست
  async testConnection() {
    try {
      const testResult = await this.keywordAnalyzer.callAI('سلام، این یک تست اتصال است.');
      return { success: true, message: 'اتصال برقرار است' };
    } catch (error) {
      return { success: false, message: `خطا در اتصال: ${error.message}` };
    }
  }

  // متد برای دریافت تنظیمات
  getConfig() {
    return {
      language: this.config.language,
      region: this.config.region,
      hasApiKey: !!this.config.apiKey,
      version: '1.0'
    };
  }
}

module.exports = Main;