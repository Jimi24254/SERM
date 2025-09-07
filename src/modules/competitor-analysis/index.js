const axios = require('axios');

class CompetitorAnalyzer {
  constructor(config) {
    this.config = config;
    this.apiKey = config.apiKey; // این کلید برای avalai.ir است
    this.serpApiKey = process.env.SERPAPI_KEY; // کلید جدید برای SerpApi
    this.language = config.language || 'fa';
    this.region = config.region || 'IR';
  }

  extractJson(text) {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```|({[\s\S]*})/);
    if (jsonMatch) { return jsonMatch[1] || jsonMatch[2]; }
    return text;
  }

  // متد جدید برای دریافت نتایج واقعی از گوگل
  async fetchRealCompetitors(topic) {
    if (!this.serpApiKey) {
      console.warn('کلید SERPAPI_KEY تنظیم نشده است. از حالت پیش‌فرض استفاده می‌شود.');
      return [];
    }

    try {
      const response = await axios.get('https://serpapi.com/search.json', {
        params: {
          api_key: this.serpApiKey,
          q: topic,
          google_domain: 'google.com', // برای جستجوی جهانی
          gl: 'ir', // کشور: ایران
          hl: 'fa'  // زبان: فارسی
        }
      });

      // فقط 5 نتیجه ارگانیک اول را استخراج می‌کنیم
      return response.data.organic_results?.slice(0, 5).map(result => ({
        name: result.title,
        url: result.link
      })) || [];

    } catch (error) {
      console.error('خطا در فراخوانی SerpApi:', error.message);
      return []; // در صورت خطا، یک لیست خالی برمی‌گردانیم
    }
  }

  async findTopCompetitors(topic) {
    // مرحله ۱: دریافت رقبای واقعی از گوگل با SerpApi
    const realCompetitors = await this.fetchRealCompetitors(topic);

    if (realCompetitors.length === 0) {
      console.log('هیچ رقیب واقعی پیدا نشد، از حالت پیش‌فرض استفاده می‌شود.');
      return this.getFallbackCompetitors(topic);
    }

    try {
      // مرحله ۲: ارسال داده‌های واقعی به هوش مصنوعی برای تحلیل
      const competitorInfo = realCompetitors.map(c => `- ${c.name} (${c.url})`).join('\n');
      const competitorPrompt = `
تو یک متخصص تحلیل رقبا و سئو هستی. رقبای اصلی برای موضوع "${topic}" اینها هستند:
${competitorInfo}

بر اساس این لیست واقعی، موارد زیر را تحلیل کن:
1.  نقاط قوت و ضعف احتمالی هر کدام را (بر اساس نام و حوزه فعالیتشان) حدس بزن.
2.  یک تحلیل کلی از سطح رقابت در این بازار ارائه بده.
3.  چند فرصت استراتژیک برای پیشی گرفتن از این رقبا پیشنهاد بده.

خروجی را به صورت JSON با این ساختار بده:
{
  "marketAnalysis": {
    "competitionLevel": "سطح رقابت (بالا/متوسط/کم)",
    "opportunities": ["یک فرصت استراتژیک کلیدی"]
  }
}
فقط JSON خالص برگردان.`;

      const rawResponse = await this.callAI(competitorPrompt);
      const cleanJsonString = this.extractJson(rawResponse);
      const analysisData = JSON.parse(cleanJsonString);

      // ترکیب نتایج واقعی با تحلیل هوش مصنوعی
      return {
        list: realCompetitors.map(comp => ({ ...comp, strengths: [], weaknesses: [] })), // افزودن فیلدهای خالی برای سازگاری
        totalAnalyzed: realCompetitors.length,
        marketAnalysis: analysisData.marketAnalysis || {},
        detailedAnalysis: [],
        analysisDate: new Date().toISOString(),
        topic: topic
      };

    } catch (error) {
      console.error('خطا در تحلیل رقبا با هوش مصنوعی:', error);
      // اگر تحلیل AI شکست خورد، حداقل لیست رقبا را برمی‌گردانیم
      return {
        list: realCompetitors,
        totalAnalyzed: realCompetitors.length,
        marketAnalysis: { competitionLevel: "نامشخص", opportunities: ["تحلیل AI ناموفق بود."] },
        detailedAnalysis: [],
        analysisDate: new Date().toISOString(),
        topic: topic
      };
    }
  }

  async callAI(prompt) {
    const url = 'https://api.avalai.ir/v1/chat/completions';
    try {
      const response = await axios.post(url, {
        model: 'gemini-2.5-pro',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 4096
      }, {
        headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' }
      });
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('خطا در فراخوانی API avalai:', error.response ? error.response.data : error.message);
      throw error;
    }
  }

  getFallbackCompetitors(topic) {
    return {
      list: [], totalAnalyzed: 0, marketAnalysis: {}, detailedAnalysis: [],
      analysisDate: new Date().toISOString(),
      topic: topic
    };
  }
}

module.exports = CompetitorAnalyzer;