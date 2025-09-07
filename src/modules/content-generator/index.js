const axios = require('axios');

class ContentGenerator {
  constructor(config) {
    this.config = config;
    this.apiKey = config.apiKey;
    this.language = config.language || 'fa';
    this.region = config.region || 'IR';
  }

  async generateContentGuide(topic, keywords, competitors) {
    try {
      // تولید راهنمای جامع محتوا
      const contentPrompt = `
تو یک متخصص تولید محتوای سئو و استراتژیست محتوا هستی. برای موضوع "${topic}" با در نظر گیری:

کلمات کلیدی اصلی: ${keywords.mainKeywords?.map(k => k.keyword || k).join(', ')}
کلمات کلیدی فرعی: ${keywords.secondaryKeywords?.map(k => k.keyword || k).join(', ')}

تحلیل رقبا نشان می‌دهد:
${competitors.competitors?.map(c => `- ${c.name}: قوت‌ها: ${c.strengths?.join(', ')}, ضعف‌ها: ${c.weaknesses?.join(', ')}`).join('\n')}

یک راهنمای کامل تولید محتوا ایجاد کن که شامل:

1. ساختار بهینه محتوا (مقدمه، بدنه، نتیجه‌گیری)
2. تعداد کلمات مناسب برای هر بخش
3. چگالی کلمات کلیدی بهینه
4. استراتژی استفاده از عناوین H1, H2, H3
5. پیشنهادات لینک‌سازی داخلی
6. استراتژی استفاده از تصاویر و ویدئو
7. نکات سئو فنی
8. استراتژی برای غلبه بر رقبا

خروجی را به صورت JSON با این ساختار بده:
{
  "contentStrategy": {
    "title": "عنوان پیشنهادی مقاله",
    "metaDescription": "متا دیسکریپشن بهینه",
    "targetAudience": "مخاطب هدف",
    "contentGoals": ["اهداف محتوا"],
    "uniqueSellingPoint": "نقطه تمایز از رقبا"
  },
  "structure": {
    "totalWordCount": "تعداد کل کلمات پیشنهادی",
    "introduction": {
      "wordCount": "تعداد کلمات مقدمه",
      "purpose": "هدف مقدمه",
      "keyElements": ["عناصر کلیدی مقدمه"],
      "hookStrategy": "استراتژی جلب توجه"
    },
    "mainBody": {
      "wordCount": "تعداد کلمات بدنه اصلی",
      "sections": [
        {
          "title": "عنوان بخش",
          "wordCount": "تعداد کلمات",
          "purpose": "هدف بخش",
          "keyPoints": ["نکات کلیدی"],
          "keywordsToInclude": ["کلمات کلیدی مرتبط"]
        }
      ]
    },
    "conclusion": {
      "wordCount": "تعداد کلمات نتیجه‌گیری",
      "purpose": "هدف نتیجه‌گیری",
      "callToAction": "فراخوان به عمل پیشنهادی"
    }
  },
  "seoOptimization": {
    "keywordDensity": {
      "primary": "چگالی کلمات اصلی",
      "secondary": "چگالی کلمات فرعی",
      "semantic": "کلمات مرتبط معنایی"
    },
    "headingStructure": {
      "h1": "عنوان اصلی",
      "h2": ["عناوین سطح دوم"],
      "h3": ["عناوین سطح سوم"]
    },
    "internalLinking": {
      "strategy": "استراتژی لینک‌سازی داخلی",
      "suggestedLinks": ["پیشنهادات لینک داخلی"],
      "anchorTexts": ["متن‌های لنگر پیشنهادی"]
    }
  },
  "contentEnhancements": {
    "visualElements": {
      "images": {
        "count": "تعداد تصاویر پیشنهادی",
        "types": ["انواع تصاویر"],
        "altTextStrategy": "استراتژی alt text"
      },
      "videos": {
        "suggestions": ["پیشنهادات ویدئو"],
        "placement": "جایگذاری ویدئو"
      },
      "infographics": ["پیشنهادات اینفوگرافیک"],
      "tables": ["جداول پیشنهادی"],
      "lists": ["لیست‌های پیشنهادی"]
    },
    "interactiveElements": ["عناصر تعاملی پیشنهادی"],
    "userEngagement": ["استراتژی‌های تعامل با کاربر"]
  },
  "competitiveAdvantage": {
    "differentiators": ["نقاط تمایز از رقبا"],
    "gapFilling": ["پر کردن شکاف‌های محتوایی رقبا"],
    "valueProposition": "ارزش منحصربه‌فرد محتوا"
  },
  "technicalSEO": {
    "schemaMarkup": ["انواع schema پیشنهادی"],
    "pageSpeed": ["نکات بهبود سرعت"],
    "mobileOptimization": ["بهینه‌سازی موبایل"],
    "coreWebVitals": ["بهبود Core Web Vitals"]
  },
  "contentTone": {
    "style": "سبک نوشتار",
    "voice": "لحن محتوا",
    "personality": "شخصیت برند در محتوا"
  },
  "qualityAssurance": {
    "factChecking": ["منابع مورد نیاز برای fact-checking"],
    "expertReview": "نیاز به بررسی متخصص",
    "userTesting": "تست با کاربران هدف"
  }
}

فقط JSON خالص برگردان، بدون توضیح اضافی.
`;

      const response = await this.callAI(contentPrompt);
      const contentGuide = JSON.parse(response);

      // تولید پرامپت نهایی برای Gemini Pro 2.5
      const finalPrompt = await this.generateFinalPrompt(contentGuide, topic, keywords, competitors);

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

  async generateFinalPrompt(contentGuide, topic, keywords, competitors) {
    try {
      const promptGenerationPrompt = `
بر اساس راهنمای محتوای ارائه شده، یک پرامپت کامل و دقیق برای Gemini Pro 2.5 تولید کن که:

موضوع: ${topic}
کلمات کلیدی اصلی: ${keywords.mainKeywords?.map(k => k.keyword || k).join(', ')}

راهنمای محتوا:
${JSON.stringify(contentGuide, null, 2)}

پرامپت باید شامل این موارد باشد:
1. دستورالعمل دقیق تولید محتوا
2. ساختار کامل مقاله
3. نحوه استفاده از کلمات کلیدی
4. راهنمای فرمت‌بندی (بولد، ایتالیک، لیست‌ها)
5. دستورات سئو فنی
6. نحوه ایجاد جداول و لیست‌ها
7. راهنمای نوشتن عناوین جذاب
8. نکات تجربه کاربری
9. راهنمای اضافه کردن 3 منبع معتبر بین‌المللی با لینک nofollow

پرامپت را به گونه‌ای بنویس که Gemini Pro 2.5 بتواند مستقیماً یک مقاله کامل و بهینه شده تولید کند.

خروجی:
{
  "prompt": "پرامپت کامل برای Gemini Pro 2.5",
  "additionalInstructions": ["دستورات اضافی"],
  "qualityChecklist": ["چک‌لیست کیفی برای بررسی نهایی"]
}
`;

      const response = await this.callAI(promptGenerationPrompt);
      const promptData = JSON.parse(response);

      return {
        ...promptData,
        metadata: {
          generatedFor: topic,
          targetModel: "Gemini Pro 2.5",
          language: this.language,
          region: this.region,
          createdAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('خطا در تولید پرامپت نهایی:', error);
      return this.getFallbackPrompt(topic, keywords);
    }
  }

  async callAI(prompt) {
    try {
      const response = await axios.post('https://api.first-ai.com/v1/chat/completions', {
        model: 'gemini-pro-2.5',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('خطا در فراخوانی API:', error);
      throw error;
    }
  }

  getFallbackContentGuide(topic, keywords, competitors) {
    const fallbackGuide = {
      contentStrategy: {
        title: `راهنمای جامع ${topic}: همه چیزی که باید بدانید`,
        metaDescription: `راهنمای کامل ${topic} - نکات کاربردی، استراتژی‌های موثر و بهترین روش‌های اجرا. اطلاعات به‌روز و قابل اعتماد.`,
        targetAudience: "کاربران علاقه‌مند به یادگیری و بهبود مهارت‌هایشان",
        contentGoals: [
          "آموزش مفاهیم اساسی",
          "ارائه راهکارهای عملی",
          "بهبود رتبه‌بندی در گوگل"
        ],
        uniqueSellingPoint: "محتوای جامع و به‌روز با رویکرد عملی"
      },
      structure: {
        totalWordCount: 2500,
        introduction: {
          wordCount: 300,
          purpose: "جلب توجه و معرفی موضوع",
          keyElements: [
            "هوک جذاب",
            "مشکل یا نیاز کاربر",
            "ارزش پیشنهادی مقاله",
            "پیش‌نمایی محتوا"
          ],
          hookStrategy: "شروع با آمار جالب یا سوال تحریک‌آمیز"
        },
        mainBody: {
          wordCount: 1900,
          sections: [
            {
              title: `مفاهیم اساسی ${topic}`,
              wordCount: 600,
              purpose: "پایه‌گذاری دانش پایه",
              keyPoints: [
                "تعریف دقیق مفاهیم",
                "اهمیت و کاربردها",
                "مزایا و چالش‌ها"
              ],
              keywordsToInclude: keywords.mainKeywords?.slice(0, 2) || [topic]
            },
            {
              title: `راهکارهای عملی ${topic}`,
              wordCount: 800,
              purpose: "ارائه راه‌حل‌های کاربردی",
              keyPoints: [
                "مراحل اجرا گام به گام",
                "ابزارها و منابع مورد نیاز",
                "نکات و ترفندهای کاربردی"
              ],
              keywordsToInclude: keywords.secondaryKeywords?.slice(0, 3) || [`راهنمای ${topic}`]
            },
            {
              title: `نکات پیشرفته و بهترین شیوه‌ها`,
              wordCount: 500,
              purpose: "ارائه دانش تخصصی",
              keyPoints: [
                "تکنیک‌های پیشرفته",
                "اجتناب از اشتباهات رایج",
                "بهینه‌سازی و بهبود عملکرد"
              ],
              keywordsToInclude: keywords.mainKeywords?.slice(2, 4) || [`${topic} حرفه‌ای`]
            }
          ]
        },
        conclusion: {
          wordCount: 300,
          purpose: "جمع‌بندی و تشویق به عمل",
          callToAction: "شروع اجرای راهکارهای آموخته شده"
        }
      },
      seoOptimization: {
        keywordDensity: {
          primary: "1.5-2%",
          secondary: "0.8-1.2%",
          semantic: keywords.semanticKeywords || ["راهنما", "آموزش", "نکات", "استراتژی"]
        },
        headingStructure: {
          h1: `راهنمای جامع ${topic}: همه چیزی که باید بدانید`,
          h2: [
            `مفاهیم اساسی ${topic}`,
            `راهکارهای عملی ${topic}`,
            `نکات پیشرفته و بهترین شیوه‌ها`,
            "نتیجه‌گیری و قدم‌های بعدی"
          ],
          h3: [
            `تعریف ${topic}`,
            "اهمیت و کاربردها",
            "مراحل اجرا گام به گام",
            "ابزارها و منابع",
            "تکنیک‌های پیشرفته",
            "اجتناب از اشتباهات"
          ]
        },
        internalLinking: {
          strategy: "لینک‌دهی طبیعی و مفید به محتوای مرتبط",
          suggestedLinks: [
            "مقالات مرتبط در همین موضوع",
            "راهنماهای تکمیلی",
            "ابزارها و منابع"
          ],
          anchorTexts: [
            "بیشتر بخوانید",
            "راهنمای کامل",
            "نکات بیشتر"
          ]
        }
      },
      contentEnhancements: {
        visualElements: {
          images: {
            count: 5,
            types: ["تصویر شاخص", "اینفوگرافیک", "نمودار", "اسکرین‌شات"],
            altTextStrategy: "توصیف دقیق با کلمات کلیدی"
          },
          videos: {
            suggestions: ["ویدئو آموزشی کوتاه", "دمو عملی"],
            placement: "در بخش راهکارهای عملی"
          },
          tables: ["مقایسه روش‌ها", "چک‌لیست عملی"],
          lists: ["فهرست نکات", "مراحل گام به گام", "منابع مفید"]
        },
        interactiveElements: ["نظرسنجی", "چک‌لیست تعاملی"],
        userEngagement: ["سوال از خواننده", "دعوت به اشتراک تجربه"]
      },
      competitiveAdvantage: {
        differentiators: [
          "محتوای جامع‌تر از رقبا",
          "رویکرد عملی و کاربردی",
          "به‌روزترین اطلاعات"
        ],
        gapFilling: competitors.marketAnalysis?.opportunities || [
          "محتوای عمیق‌تر",
          "مثال‌های عملی بیشتر",
          "پوشش جنبه‌های مغفول"
        ],
        valueProposition: "تنها منبعی که همه چیز را در یک جا ارائه می‌دهد"
      },
      technicalSEO: {
        schemaMarkup: ["Article", "HowTo", "FAQ"],
        pageSpeed: ["بهینه‌سازی تصاویر", "کاهش درخواست‌های HTTP"],
        mobileOptimization: ["طراحی ریسپانسیو", "سرعت موبایل"],
        coreWebVitals: ["بهبود LCP", "کاهش CLS", "بهینه‌سازی FID"]
      },
      contentTone: {
        style: "آموزشی و راهنما",
        voice: "دوستانه و قابل اعتماد",
        personality: "متخصص اما قابل فهم"
      },
      qualityAssurance: {
        factChecking: ["منابع معتبر", "آمار به‌روز", "مراجع علمی"],
        expertReview: "بررسی توسط متخصص حوزه",
        userTesting: "تست با نمونه کاربران هدف"
      }
    };

    const finalPrompt = this.getFallbackPrompt(topic, keywords);

    return {
      contentGuide: fallbackGuide,
      finalPrompt,
      generationDate: new Date().toISOString(),
      topic: topic
    };
  }

  getFallbackPrompt(topic, keywords) {
    return {
      prompt: `تو یک نویسنده محتوای سئو حرفه‌ای هستی. یک مقاله جامع و بهینه شده درباره "${topic}" بنویس که:

📋 **مشخصات کلی:**
- تعداد کلمات: 2500 کلمه
- لحن: حرفه‌ای اما قابل فهم
- مخاطب: کاربران فارسی‌زبان در ایران

🎯 **کلمات کلیدی:**
- اصلی: ${keywords.mainKeywords?.map(k => k.keyword || k).join(', ') || topic}
- فرعی: ${keywords.secondaryKeywords?.map(k => k.keyword || k).join(', ') || `راهنمای ${topic}`}
- چگالی: 1.5-2% برای کلمات اصلی، 0.8-1.2% برای فرعی

📝 **ساختار مقاله:**

**H1:** راهنمای جامع ${topic}: همه چیزی که باید بدانید

**مقدمه (300 کلمه):**
- شروع با هوک جذاب (آمار، سوال، یا مشکل رایج)
- معرفی اهمیت ${topic}
- پیش‌نمایی محتوای مقاله
- استفاده طبیعی از کلمه کلیدی اصلی

**H2:** مفاهیم اساسی ${topic} (600 کلمه)
- **H3:** تعریف دقیق ${topic}
- **H3:** اهمیت و کاربردهای ${topic}
- **H3:** مزایا و چالش‌های ${topic}

**H2:** راهکارهای عملی ${topic} (800 کلمه)
- **H3:** مراحل اجرا گام به گام
- **H3:** ابزارها و منابع مورد نیاز
- **H3:** نکات و ترفندهای کاربردی

**H2:** نکات پیشرفته و بهترین شیوه‌ها (500 کلمه)
- **H3:** تکنیک‌های پیشرفته
- **H3:** اجتناب از اشتباهات رایج

**H2:** نتیجه‌گیری و قدم‌های بعدی (300 کلمه)
- خلاصه نکات کلیدی
- فراخوان به عمل
- تشویق به اجرا

🎨 **فرمت‌بندی:**
- از **بولد** برای نکات مهم استفاده کن
- از *ایتالیک* برای تاکید استفاده کن
- حداقل 3 لیست شماره‌دار یا نقطه‌ای ایجاد کن
- یک جدول مقایسه‌ای اضافه کن
- از ایموجی مناسب برای بهبود خوانایی استفاده کن

🔗 **منابع:**
در انتهای مقاله، 3 منبع معتبر بین‌المللی اضافه کن که:
- مرتبط با موضوع باشند
- از سایت‌های معتبر باشند (نه رقیب)
- لینک nofollow داشته باشند
- هر کدام یک پاراگراف توضیح داشته باشند

⚡ **نکات مهم:**
- محتوا باید منحصربه‌فرد و ارزشمند باشد
- از زبان ساده و روان استفاده کن
- مثال‌های عملی و کاربردی ارائه ده
- پاسخ سوالات رایج کاربران را بده
- محتوا باید برای موبایل خوانا باشد

مقاله را کامل و آماده انتشار بنویس.`,
      additionalInstructions: [
        "محتوا باید 100% منحصربه‌فرد باشد",
        "از کپی‌پیست اجتناب کن",
        "مثال‌های محلی و مرتبط با ایران استفاده کن",
        "زبان ساده و قابل فهم باشد",
        "ساختار منطقی و جریان روان داشته باشد"
      ],
      qualityChecklist: [
        "آیا کلمات کلیدی به طور طبیعی استفاده شده‌اند؟",
        "آیا محتوا ارزش واقعی برای خواننده دارد؟",
        "آیا ساختار عناوین صحیح است؟",
        "آیا فرمت‌بندی مناسب انجام شده؟",
        "آیا منابع معتبر اضافه شده‌اند؟",
        "آیا محتوا برای موبایل بهینه است؟"
      ],
      metadata: {
        generatedFor: topic,
        targetModel: "Gemini Pro 2.5",
        language: this.language,
        region: this.region,
        createdAt: new Date().toISOString()
      }
    };
  }
}

module.exports = ContentGenerator;