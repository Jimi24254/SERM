const express = require('express');
const dotenv = require('dotenv');
const Main = require('./core/main');  // تغییر از main به Main

// بارگذاری متغیرهای محیطی
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ایجاد یک نمونه از کلاس Main
const mainInstance = new Main();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// روت اصلی
app.get('/', async (req, res) => {
  try {
    const result = await mainInstance.start();  // تغییر از main.start به mainInstance.start
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