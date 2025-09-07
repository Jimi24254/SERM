const axios = require('axios');

class CompetitorAnalyzer {
  constructor(config) {
    this.config = config;
    this.apiKey = config.apiKey;
    this.language = config.language || 'fa';
    this.region = config.region || 'IR';
  }

  async findTopCompetitors(topic) {
    try {
      // شناسایی رقبای برتر با استفاده از AI
      const competitorPrompt = `
تو یک متخصص تحلیل رقبا و سئو هستی. برای موضوع "${topic}" در بازار ایران:

1. 5 سایت رقیب برتر را شناسایی کن که در گوگل ایران رتبه بالا دارند
2. برای هر رقیب نقاط قوت و ضعف سئو را مشخص کن
3. شکاف‌های محتوایی آن‌ها را پیدا کن
4. فرصت‌های رقابتی را تعیین کن
5. استراتژی پیشنهادی برای پیشی گرفتن از آن‌ها

خروجی را به صورت JSON با این ساختار بده:
{
  "competitors": [
    {
      "name": "نام سایت",
      "url": "آدرس سایت",
      "domainAuthority": "اتوریتی دامنه (1-100)",
      "strengths": ["نقاط قوت"],
      "weaknesses": ["نقاط ضعف"],
      "contentGaps": ["شکاف‌های محتوایی"],
      "topKeywords": ["کلمات کلیدی اصلی آن‌ها"],
      "averageContentLength": "متوسط طول محتوا",
      "updateFrequency": "فرکانس بروزرسانی",
      "socialPresence": "حضور در شبکه‌های اجتماعی",
      "technicalSEO": "امتیاز سئو فنی (1-10)"
    }
  ],
  "marketAnalysis": {
    "competitionLevel": "سطح رقابت کلی",
    "opportunities": ["فرصت‌های شناسایی شده"],
    "threats": ["تهدیدات"],
    "recommendations": ["توصیه‌های استراتژیک"]
  }
}

فقط JSON خالص برگردان، بدون توضیح اضافی.
`;

      const response = await this.callAI(competitorPrompt);
      const competitorData = JSON.parse(response);

      // تحلیل عمیق‌تر رقبا
      const detailedAnalysis = await this.performDeepAnalysis(competitorData.competitors, topic);

      return {
        ...competitorData,
        detailedAnalysis,
        analysisDate: new Date().toISOString(),
        topic: topic
      };

    } catch (error) {
      console.error('خطا در تحلیل رقبا:', error);
      return this.getFallbackCompetitors(topic);
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
        temperature: 0.2,
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

  async performDeepAnalysis(competitors, topic) {
    const deepAnalysis = [];

    for (const competitor of competitors) {
      try {
        const analysis = await this.analyzeSingleCompetitor(competitor, topic);
        deepAnalysis.push(analysis);
      } catch (error) {
        console.error(`خطا در تحلیل عمیق ${competitor.name}:`, error);
      }
    }

    return deepAnalysis;
  }

  async analyzeSingleCompetitor(competitor, topic) {
    const analysisPrompt = `
برای رقیب "${competitor.name}" در موضوع "${topic}":

1. استراتژی محتوایی آن‌ها را تحلیل کن
2. الگوی لینک‌سازی داخلی و خارجی
3. سرعت سایت و عملکرد فنی
4. تجربه کاربری و طراحی
5. استراتژی شبکه‌های اجتماعی
6. نقاط قابل بهبود برای ما

JSON خروجی:
{
  "competitorName": "${competitor.name}",
  "contentStrategy": {
    "contentTypes": ["انواع محتوا"],
    "publishingFrequency": "فرکانس انتشار",
    "contentQuality": "کیفیت محتوا (1-10)",
    "engagementRate": "نرخ تعامل"
  },
  "linkingStrategy": {
    "internalLinks": "استراتژی لینک داخلی",
    "backlinks": "کیفیت بک‌لینک‌ها",
    "anchorTextStrategy": "استراتژی متن لنگر"
  },
  "technicalAnalysis": {
    "siteSpeed": "سرعت سایت (1-10)",
    "mobileOptimization": "بهینه‌سازی موبایل (1-10)",
    "sslSecurity": "امنیت SSL",
    "structuredData": "داده‌های ساختاریافته"
  },
  "userExperience": {
    "designQuality": "کیفیت طراحی (1-10)",
    "navigation": "سهولت ناوبری (1-10)",
    "loadTime": "زمان بارگذاری",
    "bounceRate": "نرخ خروج تقریبی"
  },
  "competitiveAdvantages": ["مزایای رقابتی"],
  "vulnerabilities": ["آسیب‌پذیری‌ها"],
  "opportunitiesToExploit": ["فرصت‌هایی که می‌توانیم از آن استفاده کنیم"]
}
`;

    try {
      const response = await this.callAI(analysisPrompt);
      return JSON.parse(response);
    } catch (error) {
      return {
        competitorName: competitor.name,
        contentStrategy: {
          contentTypes: ["مقاله", "راهنما"],
          publishingFrequency: "هفتگی",
          contentQuality: 7,
          engagementRate: "متوسط"
        },
        technicalAnalysis: {
          siteSpeed: 7,
          mobileOptimization: 8,
          sslSecurity: "فعال",
          structuredData: "جزئی"
        },
        competitiveAdvantages: ["محتوای منظم"],
        vulnerabilities: ["سرعت قابل بهبود"],
        opportunitiesToExploit: ["محتوای عمیق‌تر"]
      };
    }
  }

  getFallbackCompetitors(topic) {
    return {
      list: [ // نام این کلید از competitors به list تغییر کرد تا با ساختار داخلی main.js همخوانی داشته باشد
        {
          name: "رقیب شماره ۱",
          url: "https://competitor1.example.com",
          domainAuthority: 65,
          strengths: ["محتوای جامع", "سئو فنی قوی", "بروزرسانی منظم"],
          weaknesses: ["طراحی قدیمی", "سرعت پایین در موبایل"],
          contentGaps: ["محتوای ویدئویی", "راهنماهای تصویری"],
          topKeywords: [topic, `راهنمای ${topic}`, `آموزش ${topic}`],
          averageContentLength: 2500,
          updateFrequency: "هفتگی",
          socialPresence: "متوسط",
          technicalSEO: 8
        },
        {
          name: "رقیب شماره ۲",
          url: "https://competitor2.example.com",
          domainAuthority: 58,
          strengths: ["حضور قوی در شبکه‌های اجتماعی", "محتوای تعاملی"],
          weaknesses: ["سئو فنی ضعیف", "محتوای کم‌عمق"],
          contentGaps: ["محتوای تخصصی", "مطالعات موردی"],
          topKeywords: [`نکات ${topic}`, `بهترین روش ${topic}`],
          averageContentLength: 1800,
          updateFrequency: "دوهفته‌ای",
          socialPresence: "قوی",
          technicalSEO: 6
        },
        {
          name: "رقیب شماره ۳",
          url: "https://competitor3.example.com",
          domainAuthority: 72,
          strengths: ["اتوریتی بالا", "بک‌لینک‌های قوی"],
          weaknesses: ["محتوای قدیمی", "تجربه کاربری ضعیف"],
          contentGaps: ["محتوای به‌روز", "پاسخ به سوالات کاربران"],
          topKeywords: [`${topic} حرفه‌ای`, `استراتژی ${topic}`],
          averageContentLength: 3200,
          updateFrequency: "ماهانه",
          socialPresence: "ضعیف",
          technicalSEO: 9
        }
      ],
      marketAnalysis: {
        competitionLevel: "بالا",
        opportunities: [
          "تولید محتوای به‌روزتر",
          "بهبود تجربه کاربری",
          "محتوای ویدئویی",
          "پاسخ‌دهی سریع‌تر به ترندها"
        ],
        threats: [
          "رقبای با اتوریتی بالا",
          "سرمایه‌گذاری زیاد رقبا در تبلیغات"
        ],
        recommendations: [
          "تمرکز بر محتوای منحصربه‌فرد",
          "بهینه‌سازی برای جستجوهای صوتی",
          "ایجاد محتوای تعاملی",
          "استفاده از داده‌های محلی"
        ]
      },
      analysisDate: new Date().toISOString(),
      topic: topic,
      totalAnalyzed: 3
    };
  }

  // متد کمکی برای مقایسه عملکرد
  async comparePerformance(competitors) {
    const comparison = {
      bestPerformers: {
        contentQuality: null,
        technicalSEO: null,
        userExperience: null,
        socialPresence: null
      },
      averageScores: {
        domainAuthority: 0,
        technicalSEO: 0,
        contentQuality: 0
      },
      competitiveGaps: []
    };

    // محاسبه میانگین‌ها و شناسایی بهترین‌ها
    let totalDA = 0;
    let totalTechSEO = 0;

    competitors.forEach(competitor => {
      totalDA += competitor.domainAuthority || 0;
      totalTechSEO += competitor.technicalSEO || 0;
    });

    comparison.averageScores.domainAuthority = Math.round(totalDA / competitors.length);
    comparison.averageScores.technicalSEO = Math.round(totalTechSEO / competitors.length);

    return comparison;
  }
}

module.exports = CompetitorAnalyzer;