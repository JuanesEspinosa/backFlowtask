require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initModels } = require('./models');
const routes = require('./routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', routes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: 'API funcionando' });
});

// Inicializar modelos y conexión a la base de datos
initModels().then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
}).catch(error => {
    console.error('Error al inicializar la aplicación:', error);
    process.exit(1);
}); 