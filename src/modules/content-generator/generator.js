class ContentGenerator {
  static async generate(competitorData) {
    console.log('📝 تولید محتوا');
    // TODO: پیاده‌سازی تولید محتوا
    return {
      prompt: 'دستورالعمل تولید محتوای سئو',
      wordCount: 1800,
      tone: 'حرفه‌ای',
      keywordDensity: '1-2%'
    };
  }
}

module.exports = ContentGenerator;