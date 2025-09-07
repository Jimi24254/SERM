/**
 * بر اساس راهنمای محتوای تولید شده، یک پرامپت نهایی برای تولید مقاله می‌سازد.
 * @param {string} topic - موضوع اصلی تحلیل.
 * @param {object} unifiedResult - نتیجه تحلیل یکپارچه از هوش مصنوعی.
 * @returns {object} - آبجکتی شامل پرامپت متنی و متادیتا.
 */
function generateFinalPrompt(topic, unifiedResult) {
  const guide = unifiedResult.contentGuide;
  if (!guide || !guide.contentStrategy || !guide.structure) {
    // بازگشت یک پرامپت پیش‌فرض در صورت عدم وجود راهنمای محتوا
    return {
      prompt: `یک مقاله کامل و جامع درباره "${topic}" بنویس.`,
      metadata: { generatedFor: topic, targetModel: 'gemini-2.5-pro', language: 'fa', createdAt: new Date().toISOString() }
    };
  }
  
  const mainBodySections = guide.structure.mainBody.sections.map(s => `"${s.title}"`).join(' و ');

  const promptText = `
یک مقاله سئو شده کامل و جامع درباره "${topic}" بنویس.
- تعداد کلمات: ${guide.structure.totalWordCount || 2500}
- کلمات کلیدی اصلی: ${unifiedResult.keywords.mainKeywords.map(k => k.keyword).join(', ')}
- ساختار:
  - H1: ${guide.contentStrategy.title}
  - مقدمه: ${guide.structure.introduction.purpose}
  - بدنه اصلی: شامل بخش‌های ${mainBodySections}
  - نتیجه‌گیری: ${guide.structure.conclusion.purpose} با فراخوان به عمل "${guide.structure.conclusion.callToAction}"
- از فرمت‌بندی مناسب (بولد، لیست، جدول) و 3 منبع معتبر با لینک nofollow استفاده کن.
`.trim();

  return {
    prompt: promptText,
    metadata: {
      generatedFor: topic,
      targetModel: 'gemini-2.5-pro',
      language: 'fa',
      createdAt: new Date().toISOString()
    }
  };
}

/**
 * یک خلاصه مدیریتی برای نمایش سریع نتایج کلیدی تولید می‌کند.
 * @param {string} topic - موضوع اصلی تحلیل.
 * @param {object} unifiedResult - نتیجه تحلیل یکپارچه از هوش مصنوعی.
 * @param {Array} realCompetitors - لیست رقبای واقعی از SerpApi.
 * @returns {object} - آبجکت خلاصه مدیریتی.
 */
function generateExecutiveSummary(topic, unifiedResult, realCompetitors) {
  return {
    overview: `تحلیل جامع موضوع "${topic}" شامل ${unifiedResult.keywords.mainKeywords.length} کلمه کلیدی اصلی و ${realCompetitors.length} رقیب اصلی`,
    keyFindings: [
      `کلمات کلیدی اصلی: ${unifiedResult.keywords.mainKeywords.slice(0, 3).map(k => k.keyword).join(', ')}`,
      `سطح رقابت: ${unifiedResult.competitors.marketAnalysis.competitionLevel || 'نامشخص'}`,
      `فرصت‌های شناسایی شده: ${unifiedResult.competitors.marketAnalysis.opportunities.length} مورد`,
      `تعداد کلمات پیشنهادی محتوا: ${unifiedResult.contentGuide.structure.totalWordCount || 2500}`
    ],
    recommendations: [
      "تمرکز بر کلمات کلیدی با رقابت کمتر",
      "استفاده از شکاف‌های محتوایی رقبا",
      "بهینه‌سازی برای جستجوهای محلی",
      "تولید محتوای عمیق‌تر از رقبا"
    ],
    nextSteps: [
      "استفاده از پرامپت نهایی برای تولید محتوا",
      "بررسی و تنظیم محتوا بر اساس راهنما",
      "پیاده‌سازی استراتژی‌های سئو پیشنهادی",
      "نظارت بر عملکرد و بهینه‌سازی مداوم"
    ],
    competitiveAdvantage: [
      "محتوای جامع‌تر",
      "رویکرد عملی‌تر",
      "اطلاعات به‌روزتر"
    ]
  };
}

module.exports = {
  generateFinalPrompt,
  generateExecutiveSummary
};