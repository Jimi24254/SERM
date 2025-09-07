class Validator {
  static validateApiKey(apiKey) {
    // بررسی اولیه وجود کلید
    if (!apiKey) {
      throw new Error('کلید API نامعتبر');
    }
    
    // تبدیل به رشته و حذف فاصله‌های اضافی
    const trimmedKey = String(apiKey).trim();
    
    // بررسی طول کلید
    if (trimmedKey.length < 10 || trimmedKey.length > 100) {
      throw new Error('کلید API نامعتبر است');
    }
    
    // الگوی استاندارد برای کلید API
    const apiKeyPattern = /^[a-zA-Z0-9_\-\[\]]+$/;
    
    if (!apiKeyPattern.test(trimmedKey)) {
      throw new Error('فرمت کلید API نامعتبر است');
    }
    
    return true;
  }

  static sanitizeInput(input) {
    // بررسی نوع ورودی
    if (typeof input !== 'string') return input;

    // حذف اسکریپت‌های مخرب
    const scriptlessInput = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // حذف تگ‌های HTML
    const htmlTaglessInput = scriptlessInput.replace(/<[^>]*>/g, '');
    
    // حذف کاراکترهای خطرناک
    const sanitizedInput = htmlTaglessInput
      .replace(/[<>&'"]/g, '')  // حذف کاراکترهای HTML
      .trim();
    
    return sanitizedInput;
  }
}

module.exports = Validator;