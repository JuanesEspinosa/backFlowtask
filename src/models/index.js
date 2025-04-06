const { sequelize } = require('../config/database');
const User = require('./User');

const initModels = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a PostgreSQL establecida correctamente.');
    
    // Sincronizar todos los modelos
    // force: true -> Elimina y recrea las tablas para garantizar consistencia
    // IMPORTANTE: Solo usar en desarrollo, NO en producción
    await sequelize.sync({ force: true });
    console.log('Tablas sincronizadas correctamente');
  } catch (error) {
    console.error('Error al conectar con PostgreSQL:', error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  User,
  initModels
}; 