const axios = require('axios');

class CompetitorAnalyzer {
  constructor(config) {
    this.config = config;
    this.apiKey = config.apiKey;
    this.serpApiKey = process.env.SERPAPI_KEY;
    this.language = config.language || 'fa';
    this.region = config.region || 'IR';
  }

  extractJson(text) {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```|({[\s\S]*})/);
    if (jsonMatch) { return jsonMatch[1] || jsonMatch[2]; }
    return text;
  }

  async fetchRealCompetitors(topic) {
    if (!this.serpApiKey) {
      console.warn('کلید SERPAPI_KEY تنظیم نشده است.');
      return [];
    }
    try {
      const response = await axios.get('https://serpapi.com/search.json', {
        params: {
          api_key: this.serpApiKey,
          q: topic,
          google_domain: 'google.com',
          gl: 'ir',
          hl: 'fa'
        }
      });

      // --- FIX: کد اصلاح شده و قوی‌تر برای استخراج داده ---
      const organicResults = response.data?.organic_results;
      if (!Array.isArray(organicResults) || organicResults.length === 0) {
        console.log('آرایه "organic_results" در پاسخ SerpApi یافت نشد یا خالی است.');
        return [];
      }

      return organicResults.slice(0, 5).map(result => ({
        name: result.title || 'بدون عنوان',
        url: result.link || '#'
      }));
      // --- END FIX ---

    } catch (error) {
      console.error('خطا در فراخوانی SerpApi:', error.message);
      return [];
    }
  }

  async findTopCompetitors(topic) {
    const realCompetitors = await this.fetchRealCompetitors(topic);

    if (realCompetitors.length === 0) {
      console.log('هیچ رقیب واقعی پیدا نشد، از حالت تحلیل خلاقانه هوش مصنوعی استفاده می‌شود.');
      return this.generateHypotheticalCompetitors(topic);
    }

    try {
      const competitorInfo = realCompetitors.map(c => `- ${c.name} (${c.url})`).join('\n');
      const competitorPrompt = `
تو یک متخصص تحلیل سئو هستی. رقبای اصلی برای موضوع "${topic}" اینها هستند:
${competitorInfo}
بر اساس این لیست واقعی، یک تحلیل کلی از سطح رقابت و چند فرصت استراتژیک برای پیشی گرفتن از این رقبا پیشنهاد بده.
خروجی را به صورت JSON با ساختار زیر بده:
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

      return {
        list: realCompetitors, // حالا لیست واقعی را اینجا قرار می‌دهیم
        totalAnalyzed: realCompetitors.length,
        marketAnalysis: analysisData.marketAnalysis || {},
        detailedAnalysis: [],
        analysisDate: new Date().toISOString(),
        topic: topic
      };

    } catch (error) {
      console.error('خطا در تحلیل رقبا با هوش مصنوعی:', error);
      return { list: realCompetitors, totalAnalyzed: realCompetitors.length, marketAnalysis: {}, detailedAnalysis: [], analysisDate: new Date().toISOString(), topic: topic };
    }
  }

  async generateHypotheticalCompetitors(topic) {
    // این متد فقط زمانی اجرا می‌شود که SerpApi نتیجه‌ای برنگرداند
    try {
      const prompt = `
تو یک متخصص تحلیل رقبا هستی. برای موضوع "${topic}" در بازار ایران، 3 رقیب فرضی و واقع‌گرایانه با تحلیل بازار تولید کن.
خروجی JSON: { "competitors": [...], "marketAnalysis": {...} }`;
      const rawResponse = await this.callAI(prompt);
      const data = JSON.parse(this.extractJson(rawResponse));
      return {
        list: data.competitors || [], totalAnalyzed: data.competitors?.length || 0,
        marketAnalysis: data.marketAnalysis || {}, detailedAnalysis: [],
        analysisDate: new Date().toISOString(), topic: topic
      };
    } catch (error) {
      console.error("خطا در تولید رقبای فرضی:", error);
      return { list: [], totalAnalyzed: 0, marketAnalysis: {}, detailedAnalysis: [], analysisDate: new Date().toISOString(), topic: topic };
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
}

module.exports = CompetitorAnalyzer;