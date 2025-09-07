const axios = require('axios');

class ContentGenerator {
  constructor(config) {
    this.config = config;
    this.apiKey = config.apiKey;
    this.language = config.language || 'fa';
    this.region = config.region || 'IR';
  }

  extractJson(text) {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```|({[\s\S]*})/);
    if (jsonMatch) {
      return jsonMatch[1] || jsonMatch[2];
    }
    return text;
  }

  async generateContentGuide(topic, keywords, competitors) {
    try {
      const contentPrompt = `
تو یک استراتژیست محتوای سئو هستی. برای موضوع "${topic}" یک راهنمای تولید محتوای جامع به صورت JSON ایجاد کن.
{
  "contentStrategy": {"title": "عنوان پیشنهادی جذاب", "metaDescription": "متا دیسکریپشن بهینه و خوانا"},
  "structure": {
    "totalWordCount": 2500,
    "introduction": {"wordCount": 300, "purpose": "جلب توجه و معرفی موضوع"},
    "mainBody": {"wordCount": 1900, "sections": [{"title": "عنوان بخش اصلی اول"}, {"title": "عنوان بخش اصلی دوم"}]},
    "conclusion": {"wordCount": 300, "purpose": "جمع‌بندی و فراخوان به عمل", "callToAction": "فراخوان به عمل پیشنهادی"}
  },
  "seoOptimization": {
    "headingStructure": {"h1": "ساختار عنوان H1", "h2": ["ساختار عناوین H2"]}
  }
}
فقط JSON خالص برگردان.`;

      const rawResponse = await this.callAI(contentPrompt);
      const cleanJsonString = this.extractJson(rawResponse);
      const contentGuide = JSON.parse(cleanJsonString);

      const finalPrompt = this.generateFinalPrompt(contentGuide, topic, keywords);

      return {
        contentGuide,
        finalPrompt,
        generationDate: new Date().toISOString(),
        topic: topic
      };

    } catch (error) {
      console.error('خطا در تولید راهنمای محتوا:', error);
      return this.getFallbackContentGuide(topic, keywords, competitors);
    }
  }

  generateFinalPrompt(contentGuide, topic, keywords) {
    const prompt = `یک مقاله سئو شده کامل و جامع درباره "${topic}" بنویس.
- تعداد کلمات: ${contentGuide.structure?.totalWordCount || 2500}
- کلمات کلیدی اصلی: ${keywords.mainKeywords?.map(k => k.keyword).join(', ')}
- ساختار:
  - H1: ${contentGuide.seoOptimization?.headingStructure?.h1 || contentGuide.contentStrategy.title}
  - مقدمه: ${contentGuide.structure.introduction.wordCount} کلمه با هدف ${contentGuide.structure.introduction.purpose}
  - بدنه اصلی: شامل بخش‌های ${contentGuide.structure.mainBody.sections.map(s => `"${s.title}"`).join(' و ')}
  - نتیجه‌گیری: ${contentGuide.structure.conclusion.wordCount} کلمه با فراخوان به عمل "${contentGuide.structure.conclusion.callToAction}"
- از فرمت‌بندی مناسب (بولد، لیست، جدول) و 3 منبع معتبر با لینک nofollow استفاده کن.`;

    return {
      prompt: prompt,
      metadata: {
        generatedFor: topic,
        targetModel: "gemini-2.5-pro",
        language: this.language,
        createdAt: new Date().toISOString()
      }
    };
  }

  async callAI(prompt) {
    const url = 'https://api.avalai.ir/v1/chat/completions';
    try {
      const response = await axios.post(url, {
        model: 'gemini-2.5-pro', // نام مدل به شناسه صحیح اصلاح شد
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 8192
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('خطا در فراخوانی API:', error.response ? error.response.data : error.message);
      throw error;
    }
  }

  getFallbackContentGuide(topic, keywords, competitors) {
    const finalPrompt = this.getFallbackPrompt(topic, keywords);
    return {
      contentGuide: {},
      finalPrompt,
      generationDate: new Date().toISOString(),
      topic: topic
    };
  }

  getFallbackPrompt(topic, keywords) {
    return {
      prompt: `یک مقاله جامع درباره "${topic}" بنویس.`,
      metadata: { generatedFor: topic }
    };
  }
}

module.exports = ContentGenerator;