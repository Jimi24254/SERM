const axios = require('axios');

class UnifiedAnalyzer {
  constructor(config) {
    this.apiKey = config.apiKey;
  }

  extractJson(text) {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```|({[\s\S]*})/);
    if (jsonMatch) { return jsonMatch[1] || jsonMatch[2]; }
    return text;
  }

  buildPrompt(topic, competitors) {
    const competitorList = competitors.length > 0
      ? competitors.map(c => `- ${c.name} (${c.url})`).join('\n')
      : 'هیچ رقیب مستقیمی در نتایج اولیه یافت نشد.';

    return `
تو یک استراتژیست ارشد سئو هستی. برای موضوع "${topic}" در بازار ایران، یک تحلیل جامع و کامل ارائه بده.

رقبای شناسایی شده از گوگل:
${competitorList}

وظایف تو:
1.  **تحلیل کلمات کلیدی:** لیستی جامع از کلمات کلیدی اصلی، فرعی و طولانی (long-tail) مرتبط با موضوع تولید کن.
2.  **تحلیل رقبا:** بر اساس لیست رقبای واقعی (یا اگر خالی بود، بر اساس دانش خودت)، سطح رقابت و فرصت‌های کلیدی بازار را تحلیل کن.
3.  **راهنمای محتوا:** یک استراتژی محتوای دقیق و ساختاریافته برای نوشتن یک مقاله ۲۵۰۰ کلمه‌ای پیشنهاد بده.

خروجی نهایی باید **فقط یک آبجکت JSON خالص** با ساختار دقیق زیر باشد و هیچ متنی خارج از آن وجود نداشته باشد:

{
  "keywords": {
    "mainKeywords": [{"keyword": "کلمه کلیدی اصلی", "searchVolume": "بالا", "competition": "سخت"}],
    "secondaryKeywords": [{"keyword": "کلمه کلیدی فرعی", "searchVolume": "متوسط", "competition": "متوسط"}],
    "longTailKeywords": ["مثال کلمه کلیدی طولانی"]
  },
  "competitors": {
    "marketAnalysis": {
      "competitionLevel": "سطح رقابت (مثلا: بالا)",
      "opportunities": ["یک فرصت استراتژیک کلیدی"]
    }
  },
  "contentGuide": {
    "contentStrategy": {"title": "عنوان پیشنهادی جذاب برای مقاله", "metaDescription": "توضیحات متای بهینه شده"},
    "structure": {
      "totalWordCount": 2500,
      "introduction": {"purpose": "هدف مقدمه"},
      "mainBody": {"sections": [{"title": "عنوان بخش اول"}, {"title": "عنوان بخش دوم"}]},
      "conclusion": {"purpose": "هدف نتیجه‌گیری", "callToAction": "فراخوان به عمل پیشنهادی"}
    },
    "seoOptimization": {
      "headingStructure": {
        "h1": "ساختار پیشنهادی تگ H1",
        "h2": ["مثال برای تگ H2"]
      }
    }
  }
}
`;
  }

  async analyze(topic, competitors) {
    const prompt = this.buildPrompt(topic, competitors);
    try {
      const url = 'https://api.avalai.ir/v1/chat/completions';
      const response = await axios.post(url, {
        model: 'gemini-2.5-pro',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 4096,
        response_format: { type: "json_object" }
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const rawContent = response.data.choices[0].message.content;
      const cleanJsonString = this.extractJson(rawContent);
      return JSON.parse(cleanJsonString);

    } catch (error) {
      console.error('خطا در تحلیل یکپارچه:', error.response ? error.response.data : error.message);
      throw new Error('فراخوانی به سرویس هوش مصنوعی ناموفق بود.');
    }
  }
}

module.exports = UnifiedAnalyzer;