// ============================================
// CUSTOM ERROR CLASS
// Extends the built-in Error class to include
// HTTP status codes for better error handling
// ============================================

/**
 * ExpressError - Custom error class for HTTP responses
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 */
class ExpressError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ExpressError;
