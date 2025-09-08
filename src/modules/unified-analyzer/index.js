const axios = require('axios');

class UnifiedAnalyzer {
  constructor(config) {
    this.apiKey = config.apiKey;
  }

  /**
   * (تغییر کلیدی) این تابع هوشمند، متن دریافتی از AI را پاکسازی کرده و به JSON تبدیل می‌کند.
   * این تابع خطاهای رایج مانند کاماهای اضافی (trailing commas) را قبل از parse کردن حذف می‌کند.
   * @param {string} text - رشته متنی خام از پاسخ AI.
   * @returns {object} - آبجکت JSON معتبر.
   */
  cleanAndParseJson(text) {
    // 1. ابتدا بخش JSON را از داخل ```json ... ``` یا متن خالص استخراج می‌کنیم.
    let jsonString = text;
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```|({[\s\S]*})/);
    if (jsonMatch) {
      jsonString = jsonMatch[1] || jsonMatch[2];
    }

    // 2. خطاهای رایج نوشتاری را پاکسازی می‌کنیم (مهمترین بخش).
    // حذف کاماهای اضافی که قبل از } یا ] قرار دارند.
    jsonString = jsonString.replace(/,(?=\s*?[}\]])/g, '');

    // 3. حالا رشته پاکسازی شده را parse می‌کنیم.
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      // اگر حتی بعد از پاکسازی باز هم خطا وجود داشت، آن را برای دیباگ نمایش می‌دهیم.
      console.error("خطای parse کردن JSON حتی پس از پاکسازی. رشته مشکل‌ساز:", jsonString);
      throw new Error(`فرمت JSON دریافتی از AI نامعتبر است: ${e.message}`);
    }
  }

  buildPrompt(topic, competitors) {
    const competitorList = competitors.length > 0
      ? competitors.map(c => `- ${c.name} (${c.url})`).join('\n')
      : 'هیچ رقیب مستقیمی در نتایج اولیه یافت نشد.';

    return `
تو یک استراتژیست ارشد سئو هستی که عمیقاً به اصول E-E-A-T (تجربه، تخصص، اعتبار، اعتماد) و "قصد کاربر" معتقدی.

**فلسفه اصلی تو:**
تمام تحلیل‌های زیر باید بر اساس این اصل اساسی انجام شود: چگونه می‌توانیم بهترین، کامل‌ترین و قابل‌اعتمادترین پاسخ را به "قصد واقعی کاربر" از جستجوی موضوع "${topic}" بدهیم؟

**موضوع تحلیل:** "${topic}"
**بازار هدف:** ایران
**رقبای شناسایی شده:**
${competitorList}

**وظایف تو:**
1.  **تحلیل کلمات کلیدی:** لیستی جامع از کلمات کلیدی اصلی، فرعی و طولانی تولید کن. (با در نظر گرفتن قصدهای مختلف کاربر).
2.  **تحلیل رقبا:** سطح رقابت را بسنج و فرصت‌های کلیدی بازار را بر اساس ضعف رقبا در پاسخ به قصد کاربر و ایجاد اعتماد، شناسایی کن.
3.  **تحلیل کاربرمحور:** یک بخش اختصاصی برای تحلیل عمیق قصد کاربر و استراتژی جلب اعتماد او ارائه بده.
4.  **راهنمای محتوا:** یک استراتژی محتوای دقیق طراحی کن که "سفر کاربر" از کنجکاوی تا اعتماد را پوشش دهد و به تمام سوالات پنهان او پاسخ دهد.

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
      "primaryIntent": "قصد اصلی کاربر (مثلا: کسب اطلاعات جامع)",
      "secondaryIntents": ["قصدهای فرعی کاربر (مثلا: مقایسه روش‌ها، یافتن یک متخصص)"],
      "unspokenQuestions": ["سوالات پنهانی که کاربر در ذهن دارد ولی جستجو نمی‌کند"]
    },
    "trustSignalsStrategy": {
      "E": "چگونه 'تجربه' (Experience) خود را در محتوا نشان دهیم؟ (مثال: ارائه مطالعه موردی)",
      "E2": "چگونه 'تخصص' (Expertise) خود را اثبات کنیم؟ (مثال: ارائه آمار و داده‌های دقیق)",
      "A": "چگونه 'اعتبار' (Authoritativeness) بسازیم؟ (مثال: معرفی نویسنده متخصص)",
      "T": "چگونه 'اعتماد' (Trustworthiness) ایجاد کنیم؟ (مثال: شفافیت در منابع، لینک به منابع معتبر)"
    }
  },
  "contentGuide": {
    "contentStrategy": {"title": "عنوان پیشنهادی جذاب که قصد کاربر را هدف می‌گیرد", "metaDescription": "توضیحات متای بهینه شده و قابل اعتماد"},
    "structure": {
      "totalWordCount": 2500,
      "introduction": {"purpose": "هدف مقدمه (قلاب، ایجاد اعتماد اولیه)"},
      "mainBody": {"sections": [{"title": "عنوان بخشی که به یکی از سوالات کاربر پاسخ می‌دهد"}]},
      "conclusion": {"purpose": "هدف نتیجه‌گیری (جمع‌بندی، ایجاد حس اطمینان)", "callToAction": "فراخوان به عمل کاربرمحور"}
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
        temperature: 0.5,
        max_tokens: 4096,
        response_format: { type: "json_object" }
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const rawContent = response.data.choices[0].message.content;
      // (تغییر کلیدی) به جای parse کردن مستقیم، از تابع هوشمند و مقاوم خودمان استفاده می‌کنیم.
      return this.cleanAndParseJson(rawContent);

    } catch (error) {
      console.error('خطا در تحلیل یکپارچه:', error.message);
      throw new Error('فراخوانی به سرویس هوش مصنوعی ناموفق بود.');
    }
  }
}

module.exports = UnifiedAnalyzer;