const express = require('express');
const dotenv = require('dotenv');
const main = require('./core/main');

// بارگذاری متغیرهای محیطی
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// روت اصلی
app.get('/', async (req, res) => {
  try {
    const result = await main.start();
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('خطا در اجرای برنامه:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'خطای داخلی سرور',
      error: error.toString() 
    });
  }
});

// راه‌اندازی سرور
app.listen(PORT, () => {
  console.log(`🚀 سرور در پورت ${PORT} راه‌اندازی شد`);
});

// برای Vercel
module.exports = app;