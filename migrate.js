require('dotenv').config();
const { sequelize } = require('./src/config/database');
const User = require('./src/models/User');
const Board = require('./src/models/Board');
const BoardMember = require('./src/models/BoardMember');

async function migrate() {
  try {
    // Sincronizar todos los modelos con la base de datos
    // force: true eliminará las tablas existentes y las creará de nuevo
    // force: false (default) solo creará las tablas si no existen
    await sequelize.sync({ force: false });
    
    console.log('Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error durante la migración:', error);
    process.exit(1);
  }
}

migrate(); 