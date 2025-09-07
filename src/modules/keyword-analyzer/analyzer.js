const AIConnector = require('../../utils/ai-connector');

class KeywordAnalyzer {
  constructor(apiKey) {
    this.aiConnector = new AIConnector(apiKey);
  }

  async extractKeywords(topic) {
    const prompt = `لیست کلمات کلیدی تخصصی و پرترافیک برای موضوع: ${topic}
    - حداقل 10 کلمه کلیدی اصلی
    - 20 کلمه کلیدی فرعی
    - میزان سرچ و سختی هر کلمه`;

    const response = await this.aiConnector.generateContent(prompt, 'gemini-pro');
    
    // پردازش پاسخ و استخراج کلمات کلیدی
    return this.parseKeywords(response);
  }

  parseKeywords(response) {
    // منطق پردازش پاسخ AI و تبدیل به ساختار استاندارد
    return {
      mainKeywords: [],
      secondaryKeywords: [],
      keywordDetails: {}
    };
  }
}

module.exports = KeywordAnalyzer;