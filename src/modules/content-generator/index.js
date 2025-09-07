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
      const competitorsList = competitors.list || competitors.competitors || []; // سازگاری با هر دو ساختار
      const contentPrompt = `
تو یک متخصص تولید محتوای سئو و استراتژیست محتوا هستی. برای موضوع "${topic}" با در نظر گیری:

کلمات کلیدی اصلی: ${keywords.mainKeywords?.map(k => k.keyword || k).join(', ')}
کلمات کلیدی فرعی: ${keywords.secondaryKeywords?.map(k => k.keyword || k).join(', ')}

تحلیل رقبا نشان می‌دهد:
${competitorsList.map(c => `- ${c.name}: قوت‌ها: ${c.strengths?.join(', ')}, ضعف‌ها: ${c.weaknesses?.join(', ')}`).join('\n')}

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

      // تولید پرامپت نهایی برای Gemini
      const finalPrompt = await this.generateFinalPrompt(contentGuide, topic, keywords);

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

  async generateFinalPrompt(contentGuide, topic, keywords) {
    try {
      // این متد اکنون از داده‌های ساختاریافته برای تولید یک پرامپت دقیق استفاده می‌کند
      const promptData = {
        mainTopic: topic,
        wordCount: contentGuide.structure?.totalWordCount || 2500,
        tone: contentGuide.contentTone || { style: "حرفه‌ای اما قابل فهم", voice: "دوستانه و قابل اعتماد" },
        targetAudience: contentGuide.contentStrategy?.targetAudience || "کاربران فارسی‌زبان در ایران",
        mainKeywords: keywords.mainKeywords?.map(k => k.keyword || k),
        secondaryKeywords: keywords.secondaryKeywords?.map(k => k.keyword || k),
        keywordDensity: contentGuide.seoOptimization?.keywordDensity || { primary: "1.5-2%", secondary: "0.8-1.2%" },
        structure: contentGuide.structure,
        headings: contentGuide.seoOptimization?.headingStructure,
        formatting: {
          bolding: "نکات مهم",
          italics: "تاکیدات",
          lists: "حداقل 3 لیست شماره‌دار یا نقطه‌ای",
          tables: "حداقل یک جدول مقایسه‌ای",
          emojis: "استفاده مناسب برای بهبود خوانایی"
        },
        resources: {
          count: 3,
          type: "معتبر بین‌المللی",
          linkType: "nofollow",
          description: "یک پاراگراف توضیح برای هر منبع"
        },
        specialInstructions: [
          "محتوا باید 100% منحصربه‌فرد و ارزشمند باشد.",
          "از زبان ساده و روان با مثال‌های عملی و کاربردی استفاده شود.",
          "محتوا برای موبایل کاملاً بهینه باشد."
        ]
      };

      // تبدیل داده‌های ساختاریافته به یک پرامپت متنی
      const finalPromptString = this.buildPromptString(promptData);

      const finalPromptObject = {
        prompt: finalPromptString,
        additionalInstructions: promptData.specialInstructions,
        qualityChecklist: [
          "آیا کلمات کلیدی به طور طبیعی استفاده شده‌اند؟",
          "آیا محتوا ارزش واقعی برای خواننده دارد؟",
          "آیا ساختار عناوین صحیح است؟",
          "آیا فرمت‌بندی مناسب انجام شده؟",
          "آیا منابع معتبر اضافه شده‌اند؟"
        ],
        metadata: {
          generatedFor: topic,
          targetModel: "gemini-1.5-pro-latest",
          language: this.language,
          region: this.region,
          createdAt: new Date().toISOString()
        }
      };

      return finalPromptObject;

    } catch (error) {
      console.error('خطا در تولید پرامپت نهایی:', error);
      return this.getFallbackPrompt(topic, keywords);
    }
  }

  buildPromptString(data) {
    let prompt = `تو یک نویسنده محتوای سئو حرفه‌ای هستی. یک مقاله جامع و بهینه شده درباره "${data.mainTopic}" بنویس که:\n\n`;
    prompt += `📋 **مشخصات کلی:**\n- تعداد کلمات: ${data.wordCount} کلمه\n- لحن: ${data.tone.style} و ${data.tone.voice}\n- مخاطب: ${data.targetAudience}\n\n`;
    prompt += `🎯 **کلمات کلیدی:**\n- اصلی: ${data.mainKeywords.join(', ')}\n- فرعی: ${data.secondaryKeywords.join(', ')}\n- چگالی: ${data.keywordDensity.primary} برای اصلی, ${data.keywordDensity.secondary} برای فرعی\n\n`;
    prompt += `📝 **ساختار مقاله:**\n\n**H1:** ${data.headings.h1}\n\n`;
    prompt += `**مقدمه (${data.structure.introduction.wordCount} کلمه):**\n- ${data.structure.introduction.purpose}\n\n`;

    data.structure.mainBody.sections.forEach(section => {
      prompt += `**H2:** ${section.title} (${section.wordCount} کلمه)\n`;
      section.keyPoints.forEach(point => {
        prompt += `- ${point}\n`;
      });
      prompt += `\n`;
    });

    prompt += `**H2:** ${data.headings.h2.slice(-1)[0]} (${data.structure.conclusion.wordCount} کلمه)\n- ${data.structure.conclusion.purpose}\n- فراخوان به عمل: ${data.structure.conclusion.callToAction}\n\n`;
    prompt += `🎨 **فرمت‌بندی:**\n- از **بولد** برای ${data.formatting.bolding} استفاده کن\n- از *ایتالیک* برای ${data.formatting.italics} استفاده کن\n- ${data.formatting.lists} ایجاد کن\n- ${data.formatting.tables} اضافه کن\n\n`;
    prompt += `🔗 **منابع:**\nدر انتهای مقاله، ${data.resources.count} منبع ${data.resources.type} اضافه کن که لینک nofollow داشته باشند و هر کدام ${data.resources.description} داشته باشند.\n\n`;
    prompt += `⚡ **نکات مهم:**\n- ${data.specialInstructions.join('\n- ')}\n\nمقاله را کامل و آماده انتشار بنویس.`;

    return prompt;
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
        max_tokens: 8192 // افزایش ظرفیت برای پاسخ‌های بسیار کامل
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
              keywordsToInclude: []
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
          semantic: keywords.semanticKeywords || ["راهنما", "آموزش", "نکات"]
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
      competitiveAdvantage: {
        differentiators: [
          "محتوای جامع‌تر از رقبا",
          "رویکرد عملی و کاربردی",
          "به‌روزترین اطلاعات"
        ],
        gapFilling: competitors.marketAnalysis?.opportunities || [],
        valueProposition: "تنها منبعی که همه چیز را در یک جا ارائه می‌دهد"
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

**H2:** مفاهیم اساسی ${topic} (600 کلمه)
- **H3:** تعریف دقیق ${topic}
- **H3:** اهمیت و کاربردهای ${topic}

**H2:** راهکارهای عملی ${topic} (800 کلمه)
- **H3:** مراحل اجرا گام به گام
- **H3:** ابزارها و منابع مورد نیاز

**H2:** نکات پیشرفته و بهترین شیوه‌ها (500 کلمه)
- **H3:** تکنیک‌های پیشرفته
- **H3:** اجتناب از اشتباهات رایج

**H2:** نتیجه‌گیری و قدم‌های بعدی (300 کلمه)
- خلاصه نکات کلیدی
- فراخوان به عمل

🎨 **فرمت‌بندی:**
- از **بولد** برای نکات مهم استفاده کن
- از *ایتالیک* برای تاکید استفاده کن
- حداقل 3 لیست شماره‌دار یا نقطه‌ای ایجاد کن
- یک جدول مقایسه‌ای اضافه کن
- از ایموجی مناسب برای بهبود خوانایی استفاده کن

🔗 **منابع:**
در انتهای مقاله، 3 منبع معتبر بین‌المللی با لینک nofollow و توضیحات مرتبط اضافه کن.

مقاله را کامل و آماده انتشار بنویس.`,
      additionalInstructions: [
        "محتوا باید 100% منحصربه‌فرد باشد",
        "مثال‌های محلی و مرتبط با ایران استفاده کن",
        "ساختار منطقی و جریان روان داشته باشد"
      ],
      qualityChecklist: [
        "آیا کلمات کلیدی به طور طبیعی استفاده شده‌اند؟",
        "آیا محتوا ارزش واقعی برای خواننده دارد؟",
        "آیا ساختار عناوین صحیح است؟"
      ],
      metadata: {
        generatedFor: topic,
        targetModel: "gemini-1.5-pro-latest",
        language: this.language,
        region: this.region,
        createdAt: new Date().toISOString()
      }
    };
  }
}

module.exports = ContentGenerator;