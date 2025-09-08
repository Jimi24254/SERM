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
     * @returns {object} - آبجکت با دو پرامپت: contentPrompt (برای تولید مقاله HTML) و imagePromptsPrompt (برای تولید لیست پرامپت‌های تصویر)
     */
    generate(analysisResult, topic) {
        const { keywords, contentGuide } = analysisResult;
        const { structure } = contentGuide;

        // محاسبه تعداد تصاویر (اختیاری، بر اساس طول مقاله - حفظ شده)
        const wordCount = structure.totalWordCount || 2500;
        const imageCount = Math.ceil(wordCount / 500); // 1 تصویر هر 500 کلمه

        // پرامپت اول: دقیقاً مثل قبل، بدون هیچ تغییری (برای تولید مقاله HTML)
        let contentPrompt = `
**وظیفه اصلی:** تو یک نویسنده محتوای سئو متخصص و خلاق هستی. یک مقاله کامل، جامع و سئو شده درباره "${topic}" بنویس.

**مهمترین دستورالعمل: خروجی نهایی باید یک کد HTML کامل و تمیز باشد. از هیچ فرمت دیگری مانند Markdown استفاده نکن. تمام متن باید داخل تگ‌های HTML مناسب قرار گیرد.**

**جزئیات محتوا:**
1.  **عنوان اصلی (تگ <h1>):** ${contentGuide.contentStrategy.title}
2.  **توضیحات متا (برای درک بهتر زمینه):** ${contentGuide.contentStrategy.metaDescription}
3.  **تعداد کلمات:** حدود ${structure.totalWordCount} کلمه.
4.  **کلمات کلیدی:** کلمات کلیدی اصلی مانند "${keywords.mainKeywords.map(k => k.keyword).join(', ')}" و کلمات فرعی را به صورت طبیعی در متن، به خصوص در سرفصل‌ها و پاراگراف‌های کلیدی, به کار ببر.

**ساختار دقیق و دستورالعمل‌های مقاله:**
*   **مقدمه:** ${structure.introduction.purpose}
*   **بدنه اصلی:** بر اساس سرفصل‌ها و دستورالعمل‌های دقیق زیر عمل کن. برای هر سرفصل اصلی از <h2> و برای زیرمجموعه‌ها از <h3> استفاده کن.
`;

        structure.mainBody.sections.forEach((section, index) => {
            contentPrompt += `
---
### سرفصل ${index + 1}: ${section.title}
*   **هدف اصلی این بخش:** ${section.purpose}
`;

            if (section.internalLinkOpportunities && section.internalLinkOpportunities.length > 0) {
                contentPrompt += `*   **دستورالعمل لینک‌سازی داخلی:**\n`;
                section.internalLinkOpportunities.forEach(link => {
                    contentPrompt += `    *   در این بخش، به صورت طبیعی عبارت کلیدی **"${link.anchorTextSuggestion}"** را به مقاله‌ای با موضوع کلی **"${link.linkToTopic}"** لینک بده. (از بانک محتوایی که در اختیارت قرار گرفته، بهترین URL را برای این موضوع پیدا کن).\n`;
                });
            }

            if (section.visualElements && section.visualElements.length > 0) {
                contentPrompt += `*   **دستورالعمل تصویرگذاری:**\n`;
                section.visualElements.forEach(visual => {
                    contentPrompt += `    *   **مکان دقیق:** ${visual.placementSuggestion}\n`;
                    contentPrompt += `    *   یک تگ \`<figure>\` در این مکان قرار بده و داخل آن از تگ \`<img>\` استفاده کن.\n`;
                    contentPrompt += `    *   **متن Alt تصویر (ویژگی alt):** \`${visual.suggestedAltText}\`\n`;
                    contentPrompt += `    *   **نام فایل پیشنهادی (ویژگی src):** \`/images/${visual.suggestedFilename}\`\n`;
                    contentPrompt += `    *   **توضیح برای تولید تصویر (Image Generation Prompt):** "${visual.imageGenerationPrompt}" (توجه: خود این توضیح را در مقاله ننویس، این فقط یک راهنما برای انتخاب یا ساخت تصویر است).\n`;
                });
            }
        });

        contentPrompt += `
---
*   **نتیجه‌گیری:** ${structure.conclusion.purpose}. در انتها با یک فراخوان به عمل قوی مانند "${structure.conclusion.callToAction}" مقاله را به پایان برسان.

**قوانین فرمت‌بندی نهایی HTML:**
*   برای پاراگراف‌ها از تگ <p> استفاده کن.
*   برای لیست‌های شماره‌دار از <ol> و <li> و برای لیست‌های نقطه‌ای از <ul> و <li> استفاده کن.
*   برای تاکید روی کلمات مهم، از تگ <strong> و <em> استفاده کن.
*   **3 منبع معتبر بین‌المللی:** در انتهای مقاله، سه منبع معتبر را به صورت یک لیست <ul> با لینک‌های nofollow اضافه کن. مثال: <li><a href="https://example.com" rel="nofollow noopener noreferrer" target="_blank">عنوان منبع</a>: توضیح کوتاه درباره چرایی اعتبار این منبع.</li>

**شروع کن! فقط کد HTML را ارائه بده.**
`;

        // پرامپت دوم: پرامپت جدید برای بخش 2 (برای تولید لیست پرامپت‌های تصویر آماده)
        let imagePromptsPrompt = `
You are an expert in generating detailed image prompts for AI tools. Based on the following article structure for topic "${topic}", create exactly ${imageCount} ready-to-use English prompts for generating images. Each prompt should be for one specific image in the article sections.

Article details for reference:
- Total images needed: ${imageCount} (one for each major section or as suggested).
- Structure: Introduction, main sections: ${structure.mainBody.sections.map(s => s.title).join(', ')}, Conclusion.

For each prompt, include:
- Resolution: Optimized for web articles (e.g., 800x600 pixels for horizontal images to fit content width of 800-1000px, or 600x800 for vertical; ensure scalable and responsive-friendly aspect ratio like 16:9 or 4:3).
- Style: Professional infographic or illustrative, high-quality HD, with colors like blue and green for SEO themes.
- Details: Make it original, relevant to the section (e.g., include charts, icons, or Persian text if needed), creative, and precise for best results.

Output as a numbered list (1 to ${imageCount}), each item a complete prompt ready to copy-paste into an AI image generator like Gemini Imagen or Midjourney.

Start generating!
`;

        // بازگشت object با دو پرامپت
        return {
            contentPrompt: contentPrompt, // بخش 1: پرامپت تولید مقاله HTML (بدون تغییر)
            imagePromptsPrompt: imagePromptsPrompt // بخش 2: پرامپت تولید لیست پرامپت‌های تصویر
        };
    }
}

module.exports = PromptGenerator;