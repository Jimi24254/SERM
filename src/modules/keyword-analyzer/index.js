const axios = require('axios');

class KeywordAnalyzer {
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

  async extractKeywords(topic) {
    try {
      const keywordPrompt = `
تو یک متخصص سئو و تحلیلگر کلمات کلیدی هستی. برای موضوع "${topic}" در بازار ایران:

1. 10 کلمه کلیدی اصلی استخراج کن که بیشترین جستجو را دارند
2. 15 کلمه کلیدی فرعی مرتبط پیدا کن
3. حجم جستجوی تقریبی هر کلمه را مشخص کن (بالا/متوسط/کم)
4. سطح رقابت (آسان/متوسط/سخت) هر کلمه را تعیین کن
5. کلمات کلیدی long-tail مرتبط پیدا کن

خروجی را به صورت JSON با این ساختار بده:
{
  "mainKeywords": [
    {
      "keyword": "کلمه کلیدی",
      "searchVolume": "حجم جستجو",
      "competition": "سطح رقابت",
      "relevanceScore": "امتیاز مرتبط بودن از 1 تا 10"
    }
  ],
  "secondaryKeywords": [...],
  "longTailKeywords": [...],
  "semanticKeywords": ["کلمات مرتبط معنایی"]
}

فقط JSON خالص برگردان، بدون هیچ متن اضافی.`;

      const rawResponse = await this.callAI(keywordPrompt);
      const cleanJsonString = this.extractJson(rawResponse);
      const keywordData = JSON.parse(cleanJsonString);

      return this.processKeywordData(keywordData, topic);

    } catch (error) {
      console.error('خطا در استخراج کلمات کلیدی:', error);
      return this.getFallbackKeywords(topic);
    }
  }

  async callAI(prompt) {
    const url = 'https://api.avalai.ir/v1/chat/completions';
    try {
      const response = await axios.post(url, {
        model: 'gemini-2.5-pro', // نام مدل به شناسه صحیح اصلاح شد
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 4096
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

  processKeywordData(data, topic) {
    return {
      mainKeywords: data.mainKeywords || [],
      secondaryKeywords: data.secondaryKeywords || [],
      longTailKeywords: data.longTailKeywords || [],
      semanticKeywords: data.semanticKeywords || [],
      totalAnalyzed: (data.mainKeywords?.length || 0) + (data.secondaryKeywords?.length || 0),
      analysisDate: new Date().toISOString(),
      topic: topic
    };
  }

  getFallbackKeywords(topic) {
    return {
      mainKeywords: [{ keyword: topic, searchVolume: "متوسط", competition: "متوسط", relevanceScore: 10 }],
      secondaryKeywords: [{ keyword: `راهنمای ${topic}`, searchVolume: "کم", competition: "آسان", relevanceScore: 8 }],
      longTailKeywords: [],
      semanticKeywords: ["راهنما", "آموزش"],
      totalAnalyzed: 2,
      analysisDate: new Date().toISOString(),
      topic: topic
    };
  }
}

module.exports = KeywordAnalyzer;