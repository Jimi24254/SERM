// src/modules/prompt-generator/index.js

class PromptGenerator {
    /**
     * این کلاس، نتیجه تحلیل استراتژیک (JSON) را می‌گیرد
     * و یک پرامپت کامل و دقیق برای نویسنده محتوا (Gemini 2.5 Pro) تولید می‌کند.
     */
    constructor() {
        // در حال حاضر کانفیگ خاصی نیاز ندارد، اما برای آینده آماده است
    }

    /**
     * تابع اصلی برای تولید پرامپت
     * @param {object} analysisResult - آبجکت JSON خروجی از UnifiedAnalyzer
     * @param {string} topic - موضوع اصلی که تحلیل شده است
     * @returns {string} - پرامپت نهایی به صورت یک رشته متنی
     */
    generate(analysisResult, topic) {
        const { keywords, contentGuide } = analysisResult;
        const { structure } = contentGuide;

        // محاسبه تعداد تصاویر (جدید اما اختیاری، بر اساس طول مقاله)
        const wordCount = structure.totalWordCount || 2500;
        const imageCount = Math.ceil(wordCount / 500); // 1 تصویر هر 500 کلمه

        // پرامپت دو بخشی (بروزرسانی شده - ساختار قبلی حفظ شده، اما حالا دو بخش مجزا)
        let prompt = `
**وظیفه اصلی:** تو یک نویسنده محتوای سئو متخصص و خلاق هستی. یک مقاله کامل، جامع و سئو شده درباره "${topic}" بنویس.

Output in two separate sections, clearly marked:
Section 1: Instructions for writing the full HTML code of the article.
Section 2: Prompts for generating images (in English, for any AI image generator like Gemini Imagen or Midjourney).

**Section 1: Instructions for Article HTML**
- مهمترین دستورالعمل: خروجی نهایی باید یک کد HTML کامل و تمیز باشد. از هیچ فرمت دیگری مانند Markdown استفاده نکن. تمام متن باید داخل تگ‌های HTML مناسب قرار گیرد.
- عنوان اصلی (تگ <h1>): ${contentGuide.contentStrategy.title}
- توضیحات متا (برای درک بهتر زمینه): ${contentGuide.contentStrategy.metaDescription}
- تعداد کلمات: حدود ${wordCount} کلمه.
- کلمات کلیدی: کلمات کلیدی اصلی مانند "${keywords.mainKeywords.map(k => k.keyword).join(', ')}" و کلمات فرعی را به صورت طبیعی در متن، به خصوص در سرفصل‌ها و پاراگراف‌های کلیدی, به کار ببر.
- ساختار دقیق و دستورالعمل‌های مقاله:
  - مقدمه: ${structure.introduction.purpose}
  - بدنه اصلی: بر اساس سرفصل‌ها و دستورالعمل‌های دقیق زیر عمل کن. برای هر سرفصل اصلی از <h2> و برای زیرمجموعه‌ها از <h3> استفاده کن.
`;

        structure.mainBody.sections.forEach((section, index) => {
            prompt += `
---
### سرفصل ${index + 1}: ${section.title}
*   هدف اصلی این بخش: ${section.purpose}
`;

            if (section.internalLinkOpportunities && section.internalLinkOpportunities.length > 0) {
                prompt += `*   دستورالعمل لینک‌سازی داخلی:\n`;
                section.internalLinkOpportunities.forEach(link => {
                    prompt += `    *   در این بخش، به صورت طبیعی عبارت کلیدی **"${link.anchorTextSuggestion}"** را به مقاله‌ای با موضوع کلی **"${link.linkToTopic}"** لینک بده. (از بانک محتوایی که در اختیارت قرار گرفته، بهترین URL را برای این موضوع پیدا کن).\n`;
                });
            }

            if (section.visualElements && section.visualElements.length > 0) {
                prompt += `*   دستورالعمل تصویرگذاری (جزئیات در Section 2):\n`;
                section.visualElements.forEach(visual => {
                    prompt += `    *   مکان دقیق: ${visual.placementSuggestion}\n`;
                    prompt += `    *   یک تگ \`<figure>\` در این مکان قرار بده و داخل آن از تگ \`<img>\` استفاده کن.\n`;
                    prompt += `    *   متن Alt تصویر (ویژگی alt): \`${visual.suggestedAltText}\`\n`;
                    prompt += `    *   نام فایل پیشنهادی (ویژگی src): \`/images/${visual.suggestedFilename}\`\n`;
                });
            }
        });

        prompt += `
---
- نتیجه‌گیری: ${structure.conclusion.purpose}. در انتها با یک فراخوان به عمل قوی مانند "${structure.conclusion.callToAction}" مقاله را به پایان برسان.
- قوانین فرمت‌بندی نهایی HTML:
  - برای پاراگراف‌ها از تگ <p> استفاده کن.
  - برای لیست‌های شماره‌دار از <ol> و <li> و برای لیست‌های نقطه‌ای از <ul> و <li> استفاده کن.
  - برای تاکید روی کلمات مهم، از تگ <strong> و <em> استفاده کن.
  - **3 منبع معتبر بین‌المللی:** در انتهای مقاله، سه منبع معتبر را به صورت یک لیست <ul> با لینک‌های nofollow اضافه کن. مثال: <li><a href="https://example.com" rel="nofollow noopener noreferrer" target="_blank">عنوان منبع</a>: توضیح کوتاه درباره چرایی اعتبار این منبع.</li>

**Section 2: Image Generation Prompts**
- برای هر تصویر در مقاله (${imageCount} تصویر)، یک پرامپت انگلیسی دقیق بنویس که بتوان با هر ابزار تولید تصویر (مانند Gemini Imagen یا Midjourney) استفاده کرد.
- در هر پرامپت، مشخص کن:
  - Resolution: Optimized for web (e.g., 800x600 pixels for horizontal to fit content width of 800-1000px, or 600x800 for vertical; ensure scalable aspect ratio like 16:9 or 4:3).
  - Style: Professional infographic or illustrative, high-quality HD, with colors like blue and green for SEO themes.
  - Details: Original, relevant to the section (e.g., charts, icons, Persian elements if needed), creative, and precise.

شروع کن! فقط خروجی دو بخشی را ارائه بده.
`;

        return prompt;
    }
}

module.exports = PromptGenerator;