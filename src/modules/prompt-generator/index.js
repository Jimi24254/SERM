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

        // محاسبه تعداد تصاویر بر اساس طول مقاله (جدید اما اختیاری و حفظ ساختار فعلی)
        const wordCount = structure.totalWordCount || 2500;
        const imageCount = Math.ceil(wordCount / 500); // مثلاً 1 تصویر هر 500 کلمه

        // پرامپت دو بخشی (بروزرسانی شده به انگلیسی برای دقت، اما خروجی فارسی - ساختار فعلی حفظ شده)
        let prompt = `
You are an expert SEO content writer specializing in Persian content. Write a comprehensive ${wordCount}-word SEO-optimized article in Persian about "${topic}". Focus on keywords like "${keywords.mainKeywords.map(k => k.keyword).join(', ')}" with 1.5-2% density, and secondary keywords with 0.8-1.2% density. Include:
- Structure: Introduction (${structure.introduction.purpose}), main sections as detailed below, conclusion (${structure.conclusion.purpose}) with CTA "${structure.conclusion.callToAction}".
- Formatting: Use <h1> for main title "${contentGuide.contentStrategy.title}", <h2> for main sections, <h3> for subsections, <p> for paragraphs, <strong> and <em> for emphasis, <ol>/<ul> for lists, tables, emojis.
- Images: Place ${imageCount} relevant images in sections (use placeholder src like "/images/[descriptive-name-slug].jpg" with Persian alt text).
- Internal links: Natural links to related internal content.
- External sources: 3 credible international sources with nofollow links and descriptions at the end in a <ul>.
- Unique, practical content with Iranian examples.
- Meta description for context: "${contentGuide.contentStrategy.metaDescription}".

Output in two separate sections, clearly marked:
Section 1: The full, clean HTML code of the article (no Markdown, just pure HTML with <html><head><body> etc.).

Section 2: For each image in the HTML, provide a detailed English prompt for any AI image generator (e.g., Gemini Imagen, Midjourney). In each prompt, specify:
- Resolution: Optimized for web articles (e.g., 800x600 pixels for horizontal images to fit content width of 800-1000px, or 600x800 for vertical; ensure scalable and responsive-friendly aspect ratio like 16:9 or 4:3).
- Style: Professional infographic or illustrative, high-quality HD, with colors like blue and green for SEO themes.
- Details: Make it original, relevant to the section (e.g., include charts, icons, or Persian text if needed), creative, and precise for best results.

**Detailed structure instructions for main body (use <h2> and <h3>):**
`;

        structure.mainBody.sections.forEach((section, index) => {
            prompt += `
---
### Section ${index + 1}: ${section.title}
*   **Main purpose:** ${section.purpose}
`;

            if (section.internalLinkOpportunities && section.internalLinkOpportunities.length > 0) {
                prompt += `*   **Internal linking instructions:**\n`;
                section.internalLinkOpportunities.forEach(link => {
                    prompt += `    *   Naturally link the anchor text **"${link.anchorTextSuggestion}"** to an article about **"${link.linkToTopic}"** (use the content bank to find the best URL).\n`;
                });
            }

            if (section.visualElements && section.visualElements.length > 0) {
                prompt += `*   **Image placement instructions (handle in Section 2 for prompts):**\n`;
                section.visualElements.forEach(visual => {
                    prompt += `    *   **Exact placement:** ${visual.placementSuggestion}\n`;
                    prompt += `    *   Use <figure> with <img> tag.\n`;
                    prompt += `    *   **Alt text (alt attribute):** \`${visual.suggestedAltText}\`\n`;
                    prompt += `    *   **Suggested filename (src attribute):** \`/images/${visual.suggestedFilename}\`\n`;
                    // توجه: imageGenerationPrompt فعلی به Section 2 منتقل می‌شه، اما در پرامپت نهایی در Section 2 استفاده می‌شه
                });
            }
        });

        prompt += `
---
Ensure the article is 100% unique, engaging, and SEO-friendly. Start writing!
`;

        return prompt;
    }
}

module.exports = PromptGenerator;