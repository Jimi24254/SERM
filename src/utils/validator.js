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

  /**
   * ورودی را بر اساس قوانین اعتبارسنجی می‌کند
   * @param {object} input - ورودی برای اعتبارسنجی. e.g., { topic: 'موضوع' }
   * @returns {object} - نتیجه اعتبارسنجی. e.g., { isValid: true, errors: [] }
   */
  validateInput(input) {
    const errors = [];
    
    for (const field in this.validationRules) {
      const rules = this.validationRules[field];
      const value = input[field];

      // بررسی الزامی بودن
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`فیلد '${field}' الزامی است.`);
        continue; // اگر فیلد الزامی وجود ندارد، بقیه بررسی‌ها لازم نیست
      }

      // اگر فیلد وجود دارد، بقیه قوانین را بررسی کن
      if (value !== undefined && value !== null) {
        // بررسی نوع
        if (rules.type && typeof value !== rules.type) {
          errors.push(`نوع فیلد '${field}' باید '${rules.type}' باشد.`);
        }
        
        // بررسی حداقل طول
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`طول فیلد '${field}' باید حداقل ${rules.minLength} کاراکتر باشد.`);
        }

        // بررسی حداکثر طول
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`طول فیلد '${field}' باید حداکثر ${rules.maxLength} کاراکتر باشد.`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * ورودی‌ها را برای جلوگیری از حملات پاکسازی می‌کند
   * @param {string} text - متن ورودی
   * @returns {string} - متن پاکسازی شده
   */
  sanitize(text) {
    if (typeof text !== 'string') return text;
    
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
    };
    const reg = /[&<>"'/]/ig;
    return text.replace(reg, (match)=>(map[match]));
  }
}

module.exports = Validator;