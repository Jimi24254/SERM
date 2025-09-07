const axios = require('axios');

class CompetitorAnalyzer {
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

  async findTopCompetitors(topic) {
    try {
      const competitorPrompt = `
تو یک متخصص تحلیل رقبا و سئو هستی. برای موضوع "${topic}" در بازار ایران:

1. 5 سایت رقیب برتر را شناسایی کن که در گوگل ایران رتبه بالا دارند
2. برای هر رقیب نقاط قوت و ضعف سئو را مشخص کن
3. فرصت‌های رقابتی را تعیین کن

خروجی را به صورت JSON با این ساختار بده:
{
  "competitors": [
    {
      "name": "نام سایت",
      "url": "آدرس سایت",
      "strengths": ["نقاط قوت"],
      "weaknesses": ["نقاط ضعف"]
    }
  ],
  "marketAnalysis": {
    "competitionLevel": "سطح رقابت کلی (بالا/متوسط/کم)",
    "opportunities": ["فرصت‌های شناسایی شده برای پیشی گرفتن"]
  }
}

فقط JSON خالص برگردان، بدون متن اضافی.`;

      const rawResponse = await this.callAI(competitorPrompt);
      const cleanJsonString = this.extractJson(rawResponse);
      const competitorData = JSON.parse(cleanJsonString);

      return {
        list: competitorData.competitors || [],
        totalAnalyzed: competitorData.competitors?.length || 0,
        marketAnalysis: competitorData.marketAnalysis || {},
        detailedAnalysis: [],
        analysisDate: new Date().toISOString(),
        topic: topic
      };

    } catch (error) {
      console.error('خطا در تحلیل رقبا:', error);
      return this.getFallbackCompetitors(topic);
    }
  }

  async callAI(prompt) {
    const url = 'https://api.avalai.ir/v1/chat/completions';
    try {
      const response = await axios.post(url, {
        model: 'gemini-2.5-pro', // نام مدل به شناسه صحیح اصلاح شد
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
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

  getFallbackCompetitors(topic) {
    return {
      list: [{ name: "رقیب پیش‌فرض", url: "https://example.com", strengths: ["-"], weaknesses: ["-"] }],
      totalAnalyzed: 1,
      marketAnalysis: { competitionLevel: "متوسط", opportunities: ["-"] },
      detailedAnalysis: [],
      analysisDate: new Date().toISOString(),
      topic: topic
    };
  }
}

module.exports = CompetitorAnalyzer;