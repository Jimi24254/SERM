const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../../logs');
    
    // ایجاد پوشه لاگ اگر وجود ندارد
    if (!fs.existsSync(this.logDir)){
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  error(message, error = null) {
    const logFile = path.join(this.logDir, 'error.log');
    const logMessage = `[${new Date().toISOString()}] ERROR: ${message}\n${error ? error.stack : ''}\n\n`;
    
    try {
      fs.appendFileSync(logFile, logMessage);
    } catch (writeError) {
      console.error('خطا در نوشتن لاگ خطا', writeError);
    }
    
    console.error(logMessage);
  }

  info(message) {
    const logFile = path.join(this.logDir, 'info.log');
    const logMessage = `[${new Date().toISOString()}] INFO: ${message}\n`;
    
    try {
      fs.appendFileSync(logFile, logMessage);
    } catch (writeError) {
      console.error('خطا در نوشتن لاگ اطلاعات', writeError);
    }
    
    console.log(logMessage);
  }

  debug(message) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`);
    }
  }

  // متد جدید برای لاگ کردن هشدارها
  warn(message) {
    const logFile = path.join(this.logDir, 'warn.log');
    const logMessage = `[${new Date().toISOString()}] WARN: ${message}\n`;
    
    try {
      fs.appendFileSync(logFile, logMessage);
    } catch (writeError) {
      console.error('خطا در نوشتن لاگ هشدار', writeError);
    }
    
    console.warn(logMessage);
  }
}

module.exports = new Logger();