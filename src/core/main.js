const keywordAnalyzer = require('../modules/keyword-analyzer/analyzer');
const competitorAnalysis = require('../modules/competitor-analysis/competitor');
const contentGenerator = require('../modules/content-generator/generator');

class Main {
  static async start() {
    console.log('🔍 شروع پردازش SERM');
    
    try {
      const keywords = await keywordAnalyzer.analyze();
      const competitorData = await competitorAnalysis.analyze(keywords);
      const contentPrompt = await contentGenerator.generate(competitorData);
      
      console.log('✅ پردازش کامل شد');
      return contentPrompt;
    } catch (error) {
      console.error('❌ خطا در پردازش:', error);
      throw error;
    }
  }
}

module.exports = Main;