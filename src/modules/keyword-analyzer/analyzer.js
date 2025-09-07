class KeywordAnalyzer {
  static async analyze(inputKeywords = []) {
    // TODO: پیاده‌سازی تحلیل کلمات کلیدی
    console.log('🔑 تحلیل کلمات کلیدی');
    return inputKeywords.length ? inputKeywords : ['سئو', 'محتوا', 'بازاریابی'];
  }
}

module.exports = KeywordAnalyzer;