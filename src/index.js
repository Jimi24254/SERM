const express = require('express');
const cors = require('cors');
require('dotenv').config();

const Main = require('./core/main');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ایجاد نمونه اصلی SERM
let mainInstance;
try {
  mainInstance = new Main();
  console.log('✅ SERM Engine آماده است');
} catch (error) {
  console.error('❌ خطا در راه‌اندازی SERM:', error.message);
  process.exit(1);
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
    
    const result = await mainInstance.start(topic);
    
    res.json({
      success: true,
      data: result,
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
    
    const result = await mainInstance.start(decodedTopic);
    
    res.json({
      success: true,
      data: result,
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
    
    const result = await mainInstance.start('تست سریع سئو');
    
    res.json({
      success: true,
      message: 'تست سریع با موفقیت انجام شد',
      summary: {
        topic: result.topic,
        keywordsFound: result.keywords?.totalAnalyzed || 0,
        competitorsAnalyzed: result.competitors?.totalAnalyzed || 0,
        contentGuideGenerated: !!result.contentGuide,
        finalPromptGenerated: !!result.finalPrompt
      },
      executiveSummary: result.executiveSummary,
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