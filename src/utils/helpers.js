/**
 * بر اساس راهنمای محتوای تولید شده، یک پرامپت نهایی برای تولید مقاله می‌سازد.
 * @param {string} topic - موضوع اصلی تحلیل.
 * @param {object} unifiedResult - نتیجه تحلیل یکپارچه از هوش مصنوعی.
 * @returns {object} - آبجکتی شامل پرامپت متنی و متادیتا.
 */
function generateFinalPrompt(topic, unifiedResult) {
  const guide = unifiedResult.contentGuide;
  if (!guide || !guide.contentStrategy || !guide.structure) {
    return {
      prompt: `یک مقاله کامل و جامع درباره "${topic}" به صورت کد HTML بنویس.`,
      metadata: { generatedFor: topic, targetModel: 'gemini-2.5-pro', language: 'fa', createdAt: new Date().toISOString() }
    };
  }
  
  const mainBodySections = guide.structure.mainBody.sections.map(s => `<li>${s.title}</li>`).join('');
  const mainKeywords = unifiedResult.keywords.mainKeywords.map(k => k.keyword).join(', ');

  // (اصلاح شده) پرامپت با تگ‌های HTML صحیح و رفع اشتباه تایپی
  const promptText = `
**وظیفه اصلی:** تو یک نویسنده محتوای سئو متخصص هستی. یک مقاله کامل، جامع و سئو شده درباره "${topic}" بنویس.

**مهمترین دستورالعمل: خروجی نهایی باید یک کد HTML کامل و تمیز باشد. از هیچ فرمت دیگری مانند Markdown استفاده نکن. تمام متن باید داخل تگ‌های HTML مناسب قرار گیرد.**

**جزئیات محتوا:**
1.  **عنوان اصلی (تگ \`<h1>\`):** ${guide.contentStrategy.title}
2.  **تعداد کلمات:** حدود ${guide.structure.totalWordCount || 2500} کلمه.
3.  **کلمات کلیدی اصلی:** کلمات "${mainKeywords}" را به صورت طبیعی در متن، به خصوص در سرفصل‌ها و پاراگراف اول, به کار ببر.
4.  **ساختار مقاله:**
    *   **مقدمه (تگ \`<p>\`):** با یک قلاب قوی شروع کن که به ${guide.structure.introduction.purpose} بپردازد و اعتماد اولیه کاربر را جلب کند.
    *   **بدنه اصلی:** از تگ‌های \`<h2>\` برای هر یک از سرفصل‌های اصلی زیر استفاده کن. برای زیرمجموعه‌ها از \`<h3>\` استفاده کن.
        <ul>
            ${mainBodySections}
        </ul>
    *   **نتیجه‌گیری:** در بخش پایانی، به ${guide.structure.conclusion.purpose} بپرداز و با یک فراخوان به عمل قوی ("${guide.structure.conclusion.callToAction}") مقاله را تمام کن.

**قوانین فرمت‌بندی HTML:**
*   برای پاراگراف‌ها از تگ \`<p>\` استفاده کن.
*   برای لیست‌های شماره‌دار از \`<ol>\` و \`<li>\` و برای لیست‌های نقطه‌ای از \`<ul>\` و \`<li>\` استفاده کن.
*   برای تاکید روی کلمات مهم، از تگ \`<strong>\` (برای بولد کردن) و \`<em>\` (برای ایتالیک) استفاده کن.
*   **3 منبع معتبر بین‌المللی:** در انتهای مقاله، سه منبع معتبر (مانند مقالات سایت‌های معتبر در زمینه روانشناسی) را به صورت یک لیست \`<ul>\` با لینک‌های nofollow اضافه کن. مثال: \`<li><a href="https://example.com" rel="nofollow noopener noreferrer" target="_blank">عنوان منبع</a>: توضیح کوتاه درباره چرایی اعتبار این منبع.</li>\`

**شروع کن! فقط کد HTML را ارائه بده.**
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
 * (این تابع بدون تغییر است و به درستی کار می‌کند)
 */
function generateExecutiveSummary(topic, unifiedResult, realCompetitors) {
  const userCentricSummary = (unifiedResult.userCentricAnalysis && unifiedResult.userCentricAnalysis.userIntent) ? 
    `قصد اصلی کاربر: ${unifiedResult.userCentricAnalysis.userIntent.primaryIntent}` :
    "تحلیل قصد کاربر انجام نشد.";

  return {
    overview: `تحلیل جامع موضوع "${topic}" شامل ${unifiedResult.keywords.mainKeywords.length} کلمه کلیدی اصلی و ${realCompetitors.length} رقیب اصلی`,
    keyFindings: [
      userCentricSummary,
      `کلمات کلیدی اصلی: ${unifiedResult.keywords.mainKeywords.slice(0, 3).map(k => k.keyword).join(', ')}`,
      `سطح رقابت: ${unifiedResult.competitors.marketAnalysis.competitionLevel || 'نامشخص'}`,
      `تعداد کلمات پیشنهادی محتوا: ${unifiedResult.contentGuide.structure.totalWordCount || 2500}`
    ],
    recommendations: [
      "پاسخ مستقیم به سوالات پنهان کاربر",
      "استفاده از سیگنال‌های اعتماد (E-E-A-T) در محتوا",
      "تمرکز بر کلمات کلیدی طولانی برای هدف‌گیری دقیق‌تر",
      "ایجاد محتوای عمیق‌تر و کاربردی‌تر از رقبا"
    ],
    nextSteps: [
      "کپی کردن پرامپت نهایی و تولید مقاله HTML",
      "بررسی و تنظیم محتوای تولید شده",
      "پیاده‌سازی استراتژی‌های سئو پیشنهادی",
      "نظارت بر عملکرد و بهینه‌سازی مداوم"
    ],
    competitiveAdvantage: [
      "محتوای کاربرمحور",
      "ساختار مبتنی بر E-E-A-T",
      "اطلاعات به‌روز و عملی"
    ]
  };
}

module.exports = {
  generateFinalPrompt,
  generateExecutiveSummary
};