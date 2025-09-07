const CompetitorAnalyzer = require('../modules/competitor-analysis');
const UnifiedAnalyzer = require('../modules/unified-analyzer');
const { generateFinalPrompt, generateExecutiveSummary } = require('../utils/helpers');
const { validateApiKeys } = require('../utils/validator'); // <-- این خط اصلاح شد

class Main {
  constructor() {
    this.config = {
      apiKey: process.env.AVALAI_API_KEY,
      serpApiKey: process.env.SERPAPI_KEY,
      language: 'fa',
      region: 'IR',
    };

    validateApiKeys(this.config); // این فراخوانی حالا درست کار می‌کند

    this.competitorAnalyzer = new CompetitorAnalyzer(this.config);
    this.unifiedAnalyzer = new UnifiedAnalyzer(this.config);
  }

  async start(topic) {
    console.log(`🚀 شروع تحلیل SERM برای موضوع: ${topic}`);
    const analysisDate = new Date().toISOString();

    try {
      // مرحله ۱: دریافت سریع رقبای واقعی (فقط یک تماس API به SerpApi)
      const realCompetitors = await this.competitorAnalyzer.fetchRealCompetitors(topic);
      console.log(`✅ ${realCompetitors.length} رقیب واقعی از SerpApi دریافت شد.`);

      // مرحله ۲: اجرای تحلیل یکپارچه و هوشمند (فقط یک تماس API به AI)
      const unifiedResult = await this.unifiedAnalyzer.analyze(topic, realCompetitors);
      console.log('✅ تحلیل یکپارچه با هوش مصنوعی تکمیل شد.');

      // مرحله ۳: ساخت خروجی نهایی (بدون تماس API)
      const finalPrompt = generateFinalPrompt(topic, unifiedResult);
      const executiveSummary = generateExecutiveSummary(topic, unifiedResult, realCompetitors);
      const metadata = {
        language: this.config.language,
        region: this.config.region,
        processedAt: analysisDate,
        version: "1.0.0",
        engine: "SERM"
      };

      const finalData = {
        topic,
        analysisDate,
        keywords: unifiedResult.keywords,
        competitors: {
          list: realCompetitors,
          totalAnalyzed: realCompetitors.length,
          marketAnalysis: unifiedResult.competitors.marketAnalysis,
          detailedAnalysis: [],
        },
        contentGuide: unifiedResult.contentGuide,
        finalPrompt,
        metadata,
        executiveSummary
      };

      console.log('🎉 تحلیل SERM با موفقیت تکمیل شد.');
      return finalData;

    } catch (error) {
      console.error(`❌ خطا در اجرای تحلیل SERM: ${error.message}`);
      throw error;
    }
  }

  getConfig() {
    return {
      language: this.config.language,
      region: this.config.region,
      hasAvalaiKey: !!this.config.apiKey,
      hasSerpApiKey: !!this.config.serpApiKey
    };
  }

  async testConnection() {
    try {
      await this.unifiedAnalyzer.analyze("تست اتصال", []);
      return { status: 'ok', message: 'اتصال با سرویس‌ها برقرار است.' };
    } catch (e) {
      return { status: 'failed', message: e.message };
    }
  }
}

module.exports = Main;