const axios = require('axios');

class KeywordAnalyzer {
  constructor(config) {
    this.config = config;
    this.apiKey = config.apiKey;
    this.language = config.language || 'fa';
    this.region = config.region || 'IR';
  }

  async extractKeywords(topic) {
    try {
      // استخراج کلمات کلیدی با استفاده از AI
      const keywordPrompt = `
تو یک متخصص سئو و تحلیلگر کلمات کلیدی هستی. برای موضوع "${topic}" در بازار ایران:

1. 10 کلمه کلیدی اصلی استخراج کن که بیشترین جستجو را دارند
2. 15 کلمه کلیدی فرعی مرتبط پیدا کن
3. حجم جستجوی تقریبی هر کلمه را مشخص کن
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
  "keywordDensity": "درصد پیشنهادی چگالی کلمات کلیدی",
  "semanticKeywords": ["کلمات مرتبط معنایی"]
}

فقط JSON خالص برگردان، بدون توضیح اضافی.
`;

      const response = await this.callAI(keywordPrompt);
      const keywordData = JSON.parse(response);

      // اعتبارسنجی و پردازش نتایج
      return this.processKeywordData(keywordData, topic);

    } catch (error) {
      console.error('خطا در استخراج کلمات کلیدی:', error);
      // بازگشت به داده‌های پیش‌فرض در صورت خطا
      return this.getFallbackKeywords(topic);
    }
  }

  async callAI(prompt) {
    // آدرس API به نقطه پایانی صحیح avalai.ir اصلاح شد
    const url = 'https://api.avalai.ir/v1/chat/completions';

    try {
      const response = await axios.post(url, {
        model: 'gemini-1.5-pro-latest', // استفاده از یک مدل رایج و قدرتمند
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4096 // افزایش ظرفیت برای پاسخ‌های کامل‌تر
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
    // پردازش و بهینه‌سازی داده‌های دریافتی
    return {
      mainKeywords: data.mainKeywords || [],
      secondaryKeywords: data.secondaryKeywords || [],
      longTailKeywords: data.longTailKeywords || [],
      semanticKeywords: data.semanticKeywords || [],
      keywordDensity: data.keywordDensity || 1.5,
      totalKeywords: (data.mainKeywords?.length || 0) + (data.secondaryKeywords?.length || 0),
      analysisDate: new Date().toISOString(),
      topic: topic
    };
  }

  getFallbackKeywords(topic) {
    // داده‌های پیش‌فرض در صورت خطا
    return {
      mainKeywords: [
        {
          keyword: topic,
          searchVolume: "متوسط",
          competition: "متوسط",
          relevanceScore: 10
        }
      ],
      secondaryKeywords: [
        {
          keyword: `راهنمای ${topic}`,
          searchVolume: "کم",
          competition: "آسان",
          relevanceScore: 8
        }
      ],
      longTailKeywords: [
        {
          keyword: `چگونه ${topic} را انجام دهیم`,
          searchVolume: "کم",
          competition: "آسان",
          relevanceScore: 9
        }
      ],
      semanticKeywords: ["راهنما", "آموزش", "نکات"],
      keywordDensity: 1.5,
      totalKeywords: 3,
      analysisDate: new Date().toISOString(),
      topic: topic
    };
  }

  // متد کمکی برای تحلیل رقابت کلمات
  async analyzeKeywordCompetition(keywords) {
    const competitionAnalysis = [];
    
    for (const keyword of keywords) {
      try {
        const analysis = await this.getSingleKeywordAnalysis(keyword);
        competitionAnalysis.push(analysis);
      } catch (error) {
        console.error(`خطا در تحلیل کلمه ${keyword}:`, error);
      }
    }

    return competitionAnalysis;
  }

  async getSingleKeywordAnalysis(keyword) {
    const analysisPrompt = `
برای کلمه کلیدی "${keyword}" در بازار ایران:
1. سطح رقابت را تحلیل کن (1-10)
2. حجم جستجوی تقریبی را مشخص کن
3. فصلی بودن جستجو را بررسی کن
4. پیشنهاد بهترین استراتژی رقابت

JSON خروجی:
{
  "keyword": "${keyword}",
  "competitionLevel": "عدد 1-10",
  "searchVolume": "تقریبی",
  "seasonality": "دائمی/فصلی",
  "strategy": "استراتژی پیشنهادی"
}
`;

    try {
      const response = await this.callAI(analysisPrompt);
      return JSON.parse(response);
    } catch (error) {
      return {
        keyword: keyword,
        competitionLevel: 5,
        searchVolume: "متوسط",
        seasonality: "دائمی",
        strategy: "تولید محتوای باکیفیت"
      };
    }
  }
}

module.exports = KeywordAnalyzer;