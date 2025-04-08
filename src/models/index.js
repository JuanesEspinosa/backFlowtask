const { sequelize } = require('../config/database');
const User = require('./User');

const initModels = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a PostgreSQL establecida correctamente.');
    
    // Sincronizar todos los modelos
    // force: false -> Mantiene las tablas existentes
    // IMPORTANTE: Usar force: true solo cuando sea necesario recrear las tablas
    await sequelize.sync({ force: false });
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