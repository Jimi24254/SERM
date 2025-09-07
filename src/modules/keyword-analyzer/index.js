// src/modules/keyword-analyzer/index.js
class KeywordAnalyzer {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async extractKeywords(topic) {
    // استخراج کلمات کلیدی اصلی و فرعی
    const mainKeywords = [
      'سئو محتوا',
      'بازاریابی محتوایی',
      'استراتژی سئو'
    ];

    const secondaryKeywords = [
      'تولید محتوا',
      'رتبه‌بندی گوگل',
      'کلمات کلیدی'
    ];

    return {
      mainKeywords,
      secondaryKeywords,
      keywordDensity: 1.5 // درصد چگالی کلمات کلیدی
    };
  }
}

module.exports = KeywordAnalyzer;