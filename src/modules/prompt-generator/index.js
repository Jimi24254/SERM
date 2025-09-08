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
     * @returns {object} - آبجکت با contentPrompt (برای تولید مقاله HTML) و imagePromptsList (لیست مستقیم پرامپت‌های آماده برای تصاویر)
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

        // لیست مستقیم پرامپت‌های تصویر (جدید: مستقیم تولید می‌شه، انگلیسی، با جزئیات)
        let imagePromptsList = '';
        let currentImageIndex = 1;

        // ابتدا بر اساس visualElements خاص از بخش‌ها پرامپت بساز
        structure.mainBody.sections.forEach((section) => {
            if (section.visualElements && section.visualElements.length > 0) {
                section.visualElements.forEach((visual) => {
                    if (currentImageIndex <= imageCount) {
                        imagePromptsList += `Image ${currentImageIndex} for section "${section.title}": Create a professional HD infographic illustrating ${visual.suggestedAltText} related to ${topic}, with aspect ratio 16:9, resolution 800x450 pixels (horizontal to fit content width of 800-1000px), in blue and green colors, including charts and icons – ensure all text on the image is in English (e.g., "Best SEO Methods") for accurate generation, no Persian text to avoid errors.\n\n`;
                        currentImageIndex++;
                    }
                });
            }
        });

        // اگر تعداد کمتر از imageCount بود، پرامپت‌های عمومی اضافه کن (برای تکمیل)
        while (currentImageIndex <= imageCount) {
            imagePromptsList += `Image ${currentImageIndex} (general for article): Create a illustrative HD graphic summarizing key points of ${topic}, with aspect ratio 4:3, resolution 600x800 pixels (vertical for better scrolling), professional style with blue and green tones, including English text overlays like "SEO Tips" – avoid any non-English text for best results.\n\n`;
            currentImageIndex++;
        }

        // اگر هیچ تصویری نبود، یک پیام ساده بگذار
        if (imagePromptsList === '') {
            imagePromptsList = 'No specific images suggested in analysis. Consider adding manually.';
        }

        // بازگشت object با دو بخش
        return {
            contentPrompt: contentPrompt, // بخش 1: پرامپت تولید مقاله HTML (بدون تغییر)
            imagePromptsList: imagePromptsList.trim() // بخش 2: لیست مستقیم پرامپت‌های آماده (انگلیسی، با جزئیات)
        };
    }
}

module.exports = PromptGenerator;