const axios = require('axios');

class UnifiedAnalyzer {
  constructor(config) {
    this.apiKey = config.apiKey;
  }

  cleanAndParseJson(text) {
    let jsonString = text;
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```|({[\s\S]*})/);
    if (jsonMatch) {
      jsonString = jsonMatch[1] || jsonMatch[2];
    }

    jsonString = jsonString.replace(/,(?=\s*?[}\]])/g, '');

    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("خطای parse کردن JSON حتی پس از پاکسازی. رشته مشکل‌ساز:", jsonString);
      throw new Error(`فرمت JSON دریافتی از AI نامعتبر است: ${e.message}`);
    }
  }

  buildPrompt(topic, competitors) {
    const competitorList = competitors.length > 0
      ? competitors.map(c => `- ${c.name} (${c.url})`).join('\n')
      : 'هیچ رقیب مستقیمی در نتایج اولیه یافت نشد.';

    return `
تو یک استراتژیست ارشد سئو و محتوا هستی که عمیقاً به اصول E-E-A-T و "قصد کاربر" معتقدی.

**فلسفه اصلی تو:**
تمام تحلیل‌های زیر باید بر اساس این اصل اساسی انجام شود: چگونه می‌توانیم بهترین، کامل‌ترین و قابل‌اعتمادترین پاسخ را به "قصد واقعی کاربر" از جستجوی موضوع "${topic}" بدهیم و یک تجربه محتوایی بی‌نظیر خلق کنیم؟

**موضوع تحلیل:** "${topic}"
**بازار هدف:** ایران
**رقبای شناسایی شده:**
${competitorList}

**وظایف تو (با قابلیت‌های جدید):**
1.  **تحلیل کلمات کلیدی:** لیستی جامع از کلمات کلیدی اصلی، فرعی و طولانی تولید کن.
2.  **تحلیل رقبا:** سطح رقابت را بسنج و فرصت‌های کلیدی بازار را شناسایی کن.
3.  **تحلیل کاربرمحور:** قصد کاربر و استراتژی جلب اعتماد او را عمیقاً تحلیل کن.
4.  **راهنمای محتوا (پیشرفته):** یک استراتژی محتوای دقیق طراحی کن که شامل موارد زیر باشد:
    *   **ساختار کلی:** مقدمه، بدنه اصلی و نتیجه‌گیری.
    *   **استراتژی لینک‌سازی داخلی:** برای هر بخش اصلی، فرصت‌های لینک‌سازی داخلی را با متن پیشنهادی و موضوع مقاله مقصد مشخص کن.
    *   **استراتژی بصری:** بر اساس طول محتوا (تقریباً هر 400-500 کلمه یک تصویر)، دستورالعمل‌های دقیقی برای جایگذاری تصاویر ارائه بده. این دستورالعمل باید شامل مکان دقیق، یک پرامپت حرفه‌ای برای تولید تصویر با هوش مصنوعی، متن alt بهینه برای سئو و نام فایل مناسب باشد.

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
      "opportunities": ["یک فرصت استراتژیک کلیدی مبتنی بر ضعف رقبا"]
    }
  },
  "userCentricAnalysis": {
    "userIntent": {
      "primaryIntent": "قصد اصلی کاربر",
      "secondaryIntents": ["قصدهای فرعی کاربر"],
      "unspokenQuestions": ["سوالات پنهانی که کاربر در ذهن دارد"]
    },
    "trustSignalsStrategy": {
      "E": "چگونه 'تجربه' (Experience) خود را در محتوا نشان دهیم؟",
      "E2": "چگونه 'تخصص' (Expertise) خود را اثبات کنیم؟",
      "A": "چگونه 'اعتبار' (Authoritativeness) بسازیم؟",
      "T": "چگونه 'اعتماد' (Trustworthiness) ایجاد کنیم؟"
    }
  },
  "contentGuide": {
    "contentStrategy": {"title": "عنوان پیشنهادی جذاب", "metaDescription": "توضیحات متای بهینه شده"},
    "structure": {
      "totalWordCount": 3000,
      "introduction": {"purpose": "هدف مقدمه (قلاب، ایجاد اعتماد اولیه)"},
      "mainBody": {
        "sections": [
          {
            "title": "عنوان بخشی که به یکی از سوالات کاربر پاسخ می‌دهد",
            "purpose": "هدف این بخش و ارزشی که برای کاربر ایجاد می‌کند.",
            "internalLinkOpportunities": [
              {
                "anchorTextSuggestion": "متن پیشنهادی برای لینک داخلی",
                "linkToTopic": "موضوع کلی مقاله‌ای که باید به آن لینک شود (مثلا: راهنمای کامل سئو تکنیکال)"
              }
            ],
            "visualElements": [
              {
                "type": "image",
                "placementSuggestion": "بعد از پاراگراف اول، برای توضیح بصری مفهوم X.",
                "imageGenerationPrompt": "یک اینفوگرافیک مدرن و تمیز که مراحل فلان فرآیند را نشان می‌دهد. با پالت رنگی آبی و زرد.",
                "suggestedAltText": "اینفوگرافیک مراحل انجام فرآیند X برای بهبود سئو",
                "suggestedFilename": "process-x-infographic.jpg"
              }
            ]
          }
        ]
      },
      "conclusion": {"purpose": "هدف نتیجه‌گیری", "callToAction": "فراخوان به عمل کاربرمحور"}
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
        temperature: 0.5,
        max_tokens: 8192, 
        response_format: { type: "json_object" }
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const rawContent = response.data.choices[0].message.content;
      return this.cleanAndParseJson(rawContent);

    } catch (error) {
      console.error('خطا در تحلیل یکپارچه:', error.message);
      throw new Error('فراخوانی به سرویس هوش مصنوعی ناموفق بود.');
    }
  }
}

module.exports = UnifiedAnalyzer;