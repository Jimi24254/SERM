const axios = require('axios');
const logger = require('./logger');
const config = require('../../config/default.json');

class AIConnector {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.models = {
      'gemini-pro': {
        url: 'https://api.firstai.com/gemini/generate',
        config: config.ai.models.gemini
      },
      'gpt-4': {
        url: 'https://api.firstai.com/gpt/generate',
        config: config.ai.models.gpt
      }
    };
  }

  async generateContent(prompt, model = 'gemini-pro', customOptions = {}) {
    try {
      const modelConfig = this.models[model];
      
      // ترکیب تنظیمات پیش‌فرض با تنظیمات سفارشی
      const requestOptions = {
        ...modelConfig.config,
        ...customOptions,
        prompt,
        apiKey: this.apiKey
      };

      logger.info(`درخواست تولید محتوا با مدل ${model}`);

      const response = await axios.post(modelConfig.url, requestOptions);
      
      if (!response.data.content) {
        throw new Error('محتوای تولید شده خالی است');
      }

      return response.data.content;
    } catch (error) {
      logger.error(`خطا در تولید محتوا با مدل ${model}`, error);
      
      // مدیریت خطاهای مختلف
      if (error.response) {
        // خطاهای سمت سرور
        throw new Error(`خطای AI: ${error.response.data.message}`);
      } else if (error.request) {
        // خطاهای شبکه
        throw new Error('عدم پاسخ از سرویس AI');
      } else {
        // خطاهای داخلی
        throw error;
      }
    }
  }
}

module.exports = AIConnector;