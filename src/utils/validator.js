// مسیر فایل: src/utils/validator.js

class Validator {
  constructor() {
    this.validationRules = {
      topic: {
        required: true,
        minLength: 3,
        maxLength: 100,
        type: 'string'
      }
    };
  }

  validateInput(input) {
    const errors = [];
    for (const field in this.validationRules) {
      const rules = this.validationRules[field];
      const value = input[field];
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`فیلد '${field}' الزامی است.`);
        continue;
      }
      if (value !== undefined && value !== null) {
        if (rules.type && typeof value !== rules.type) {
          errors.push(`نوع فیلد '${field}' باید '${rules.type}' باشد.`);
        }
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`طول فیلد '${field}' باید حداقل ${rules.minLength} کاراکتر باشد.`);
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`طول فیلد '${field}' باید حداکثر ${rules.maxLength} کاراکتر باشد.`);
        }
      }
    }
    return { isValid: errors.length === 0, errors: errors };
  }

  sanitize(text) {
    if (typeof text !== 'string') return text;
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', "/": '&#x2F;' };
    const reg = /[&<>"'/]/ig;
    return text.replace(reg, (match) => (map[match]));
  }
}

/**
 * این تابع کلیدهای API ضروری را در تنظیمات بررسی می‌کند.
 * @param {object} config - آبجکت تنظیمات که حاوی کلیدهای API است.
 */
function validateApiKeys(config) {
  if (!config.apiKey) {
    throw new Error('کلید AVALAI_API_KEY در متغیرهای محیطی (environment variables) یافت نشد.');
  }
  if (!config.serpApiKey) {
    console.warn('هشدار: کلید SERPAPI_KEY یافت نشد. تحلیل رقبا با داده‌های واقعی انجام نخواهد شد.');
  }
}

// کلاس و تابع هر دو را export می‌کنیم
module.exports = {
  Validator,
  validateApiKeys
};