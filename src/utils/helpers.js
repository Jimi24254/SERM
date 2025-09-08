function generateFinalPrompt(topic, unifiedResult) {
  const guide = unifiedResult.contentGuide;
  if (!guide || !guide.contentStrategy || !guide.structure) {
    return {
      prompt: `Write a comprehensive article about "${topic}" as a clean HTML code, in Persian language.`,
      metadata: { generatedFor: topic, targetModel: 'gemini-2.5-pro', language: 'fa', createdAt: new Date().toISOString() }
    };
  }
  
  const mainBodySections = guide.structure.mainBody.sections.map(s => `<li>${s.title}</li>`).join('');
  const mainKeywords = unifiedResult.keywords.mainKeywords.map(k => k.keyword).join(', ');

  // (رویکرد ترکیبی) دستورات فنی به انگلیسی، محتوا به فارسی
  const promptText = `
**Primary Task:** You are an expert SEO content writer. Your task is to write a comprehensive, high-quality, and SEO-optimized article about "${topic}". The entire article must be in the **Persian language**.

**CRITICAL INSTRUCTION: The final output must be a clean, complete HTML code. Do not use any other format like Markdown. The entire text must be inside appropriate HTML tags.**

---

### **Content and Language Details (Persian)**

1.  **عنوان اصلی (تگ <h1>):** ${guide.contentStrategy.title}
2.  **کلمات کلیدی اصلی:** کلمات کلیدی "${mainKeywords}" را به صورت طبیعی در متن، به خصوص در سرفصل‌ها و پاراگراف اول، به کار ببر.
3.  **ساختار مقاله:**
    *   **مقدمه (تگ <p>):** هدف: ${guide.structure.introduction.purpose}
    *   **بدنه اصلی (تگ‌های <h2> و <h3>):** باید شامل این سرفصل‌ها باشد:
        <ul>
            ${mainBodySections}
        </ul>
    *   **نتیجه‌گیری (تگ <p>):** هدف: ${guide.structure.conclusion.purpose}. در انتها از این فراخوان به عمل استفاده کن: "${guide.structure.conclusion.callToAction}"

---

### **Technical HTML Formatting Rules (English)**

*   **Target Word Count:** Approximately ${guide.structure.totalWordCount || 2500} words.
*   **Paragraphs:** Use the <p> tag for all paragraphs.
*   **Lists:** Use <ol> and <li> for numbered lists, and <ul> and <li> for bullet points.
*   **Emphasis:** Use <strong> for bolding important phrases and <em> for italics.
*   **External Links:** At the end of the article, add a section with 3 credible, international sources related to psychology or family counseling. Each source must be in a <li> tag with a nofollow link. Example: \`<li><a href="https://example.com" rel="nofollow noopener noreferrer" target="_blank">Source Title</a>: A brief explanation of why this source is credible.</li>\`

---

**Begin! Provide only the HTML code in Persian.**
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