// ============================================
// ASYNC ERROR WRAPPER
// Wraps async route handlers to catch errors
// and pass them to Express error middleware
// ============================================

/**
 * wrapAsync - Wrapper function for async route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Express middleware function
 *
 * Usage:
 * router.get("/path", wrapAsync(async (req, res) => {
 *     // Your async code here
 * }));
 */
module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
