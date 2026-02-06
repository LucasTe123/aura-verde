const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
require('dotenv').config();
const { initDB } = require('./config/database');

const productoRoutes = require('./routes/productoRoutes');
const ventaRoutes = require('./routes/ventaRoutes');
const reporteRoutes = require('./routes/reporteRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/productos', productoRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/reportes', reporteRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API Aura Verde funcionando' });
});

const PORT = process.env.PORT || 5000;

initDB().then(() => {
  try {
    const certPath = './node_modules/.vite/cert.pem';
    const keyPath = './node_modules/.vite/key.pem';
    
    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      const httpsOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
      };
      
      https.createServer(httpsOptions, app).listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Servidor HTTPS corriendo en https://0.0.0.0:${PORT}`);
        console.log(`📱 Acceso desde red local: https://192.168.0.20:${PORT}`);
      });
    } else {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Servidor HTTP corriendo en http://0.0.0.0:${PORT}`);
        console.log(`📱 Acceso desde red local: http://192.168.0.20:${PORT}`);
      });
    }
  } catch (error) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor HTTP corriendo en http://0.0.0.0:${PORT}`);
      console.log(`📱 Acceso desde red local: http://192.168.0.20:${PORT}`);
    });
  }
});
