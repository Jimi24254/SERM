const express = require('express');
const cors = require('cors');
require('dotenv').config();

const Main = require('./core/main');
const PromptGenerator = require('./modules/prompt-generator');
const { GoogleGenerativeAI } = require('@google/generative-ai'); // اضافه جدید برای callGemini

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ایجاد نمونه اصلی SERM و PromptGenerator
let mainInstance;
const promptGenerator = new PromptGenerator(); // <-- تغییر جدید: ساخت یک نمونه از ژنراتور پرامپت
try {
  mainInstance = new Main();
  console.log('✅ SERM Engine آماده است');
} catch (error) {
  console.error('❌ خطا در راه‌اندازی SERM:', error.message);
  process.exit(1);
}

// تابع جدید برای فراخوانی Gemini (اضافه شده برای ارسال پرامپت و گرفتن خروجی دو بخشی)
async function callGemini(prompt) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' }); // مدل پیشنهادی (اگر 2.5 موجوده، تغییر بده)
    const result = await model.generateContent(prompt);
    return result.response.text(); // خروجی متنی دو بخشی
  } catch (error) {
    console.error('Error calling Gemini:', error);
    throw new Error('Failed to generate content from AI');
  }
}

// Routes

// صفحه اصلی - نمایش اطلاعات API
app.get('/', (req, res) => {
  res.json({
    name: 'SERM - SEO Engine Requirements Motor',
    version: '1.0.0',
    description: 'موتور تحلیل سئو و تولید محتوا',
    endpoints: {
      '/': 'اطلاعات API',
      '/analyze': 'تحلیل موضوع (POST)',
      '/analyze/:topic': 'تحلیل موضوع مشخص (GET)',
      '/health': 'وضعیت سلامت سیستم',
      '/config': 'تنظیمات سیستم'
    },
    usage: {
      post: 'POST /analyze با body: {"topic": "موضوع مورد نظر"}',
      get: 'GET /analyze/موضوع-مورد-نظر'
    },
    status: 'آماده',
    timestamp: new Date().toISOString()
  });
});

// تحلیل موضوع - POST Method
app.post('/analyze', async (req, res) => {
  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'موضوع الزامی است',
        example: { topic: 'تولید محتوای سئو' }
      });
    }

    console.log(`🔍 درخواست تحلیل موضوع: ${topic}`);
    
    // مرحله ۱: اجرای تحلیل استراتژیک
    const strategicResult = await mainInstance.start(topic);
    
    // مرحله ۲: تولید پرامپت نهایی با استفاده از نتیجه مرحله ۱ (حفظ شده)
    const finalPrompt = promptGenerator.generate(strategicResult, topic);
    
    // مرحله جدید: ارسال پرامپت به Gemini برای تولید خروجی دو بخشی
    const aiResponse = await callGemini(finalPrompt);
    
    // ارسال هر دو نتیجه در پاسخ نهایی (بروزرسانی شده با aiResponse)
    res.json({
      success: true,
      data: {
        strategicAnalysis: strategicResult,
        finalPromptForWriter: aiResponse // حالا دو بخشی
      },
      processingTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('خطا در تحلیل:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// تحلیل موضوع - GET Method
app.get('/analyze/:topic', async (req, res) => {
  try {
    const { topic } = req.params;
    
    // دیکد کردن URL encoding
    const decodedTopic = decodeURIComponent(topic);
    
    console.log(`🔍 درخواست تحلیل موضوع: ${decodedTopic}`);
    
    // مرحله ۱: اجرای تحلیل استراتژیک
    const strategicResult = await mainInstance.start(decodedTopic);

    // مرحله ۲: تولید پرامپت نهایی (حفظ شده)
    const finalPrompt = promptGenerator.generate(strategicResult, decodedTopic);
    
    // مرحله جدید: ارسال پرامپت به Gemini برای تولید خروجی دو بخشی
    const aiResponse = await callGemini(finalPrompt);
    
    // ارسال هر دو نتیجه در پاسخ نهایی (بروزرسانی شده با aiResponse)
    res.json({
      success: true,
      data: {
        strategicAnalysis: strategicResult,
        finalPromptForWriter: aiResponse // حالا دو بخشی
      },
      processingTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('خطا در تحلیل:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// بررسی سلامت سیستم
app.get('/health', async (req, res) => {
  try {
    const config = mainInstance.getConfig();
    const connectionTest = await mainInstance.testConnection();
    
    res.json({
      status: 'healthy',
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version,
        platform: process.platform
      },
      serm: {
        version: '1.0.0',
        config: config,
        apiConnection: connectionTest
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// نمایش تنظیمات سیستم
app.get('/config', (req, res) => {
  try {
    const config = mainInstance.getConfig();
    res.json({
      success: true,
      config: config,
      environment: {
        nodeEnv: process.env.NODE_ENV || 'production',
        port: port,
        hasApiKey: !!process.env.API_KEY_FIRST_AI || !!process.env.API_KEY_GEMINI || !!process.env.API_KEY_GPT
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// تحلیل سریع - برای تست
app.get('/quick-test', async (req, res) => {
  try {
    console.log('🧪 اجرای تست سریع...');
    const topic = 'تست سریع سئو';
    
    const strategicResult = await mainInstance.start(topic);
    const finalPrompt = promptGenerator.generate(strategicResult, topic);
    
    // بروزرسانی اختیاری: اگر می‌خوای در quick-test هم دو بخشی باشه، می‌تونی اضافه کنی (اما حفظ فعلی)
    res.json({
      success: true,
      message: 'تست سریع با موفقیت انجام شد',
      summary: {
        topic: strategicResult.topic,
        keywordsFound: strategicResult.keywords?.totalAnalyzed || 0,
        competitorsAnalyzed: strategicResult.competitors?.totalAnalyzed || 0,
        contentGuideGenerated: !!strategicResult.contentGuide,
        finalPromptGenerated: !!finalPrompt
      },
      executiveSummary: strategicResult.executiveSummary,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// مدیریت خطاهای 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'آدرس مورد نظر یافت نشد',
    availableEndpoints: [
      'GET /',
      'POST /analyze',
      'GET /analyze/:topic',
      'GET /health',
      'GET /config',
      'GET /quick-test'
    ],
    timestamp: new Date().toISOString()
  });
});

// مدیریت خطاهای عمومی
app.use((error, req, res, next) => {
  console.error('خطای سرور:', error);
  res.status(500).json({
    success: false,
    error: 'خطای داخلی سرور',
    message: process.env.NODE_ENV === 'development' ? error.message : 'مشکل فنی رخ داده است',
    timestamp: new Date().toISOString()
  });
});

// راه‌اندازی سرور
app.listen(port, () => {
  console.log(`
🚀 SERM Server در حال اجرا است
📍 آدرس: http://localhost:${port}
🌐 محیط: ${process.env.NODE_ENV || 'production'}
⚡ آماده دریافت درخواست...

📋 Endpoints:
   GET  /                    - اطلاعات API
   POST /analyze            - تحلیل موضوع
   GET  /analyze/:topic     - تحلیل موضوع مشخص
   GET  /health             - وضعیت سلامت
   GET  /config             - تنظیمات سیستم
   GET  /quick-test         - تست سریع
  `);
});

// مدیریت خاموش شدن برنامه
process.on('SIGINT', () => {
  console.log('\n🛑 در حال خاموش کردن SERM Server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 دریافت سیگنال خاموش شدن...');
  process.exit(0);
});

// مدیریت خطاهای catch نشده
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

module.exports = app;