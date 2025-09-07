class Helpers {
  static validateInput(input) {
    // TODO: اعتبارسنجی ورودی
    return input && input.length > 0;
  }

  static generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

module.exports = Helpers;