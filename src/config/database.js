const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs').promises;

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false, // Cambiar a console.log para ver las consultas SQL
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a PostgreSQL establecida correctamente.');
    
    // Sincronizar todos los modelos
    await sequelize.sync({ force: true }); // force: false mantendrá las tablas existentes
    console.log('Tablas sincronizadas correctamente');
  } catch (error) {
    console.error('Error al conectar con PostgreSQL:', error);
    process.exit(1);
  }
};

const fixSequences = async () => {
  try {
    const sqlPath = path.join(__dirname, '..', 'database', 'fix-sequences.sql');
    const sqlContent = await fs.readFile(sqlPath, 'utf8');
    await sequelize.query(sqlContent);
    console.log('Secuencias corregidas correctamente');
  } catch (error) {
    console.error('Error al corregir secuencias:', error);
  }
};

module.exports = {
  sequelize,
  connectDB,
  fixSequences
}; 