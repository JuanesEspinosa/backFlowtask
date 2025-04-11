/**
 * Middleware de autenticación
 * Verifica si el usuario está autenticado
 */
const authMiddleware = (req, res, next) => {
  // Por ahora, simplemente pasamos al siguiente middleware
  // En una implementación real, aquí se verificaría el token JWT o la sesión
  next();
};

module.exports = authMiddleware; 