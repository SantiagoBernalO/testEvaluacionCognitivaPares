const express = require('express');
const cors = require('cors');
const db = require('./firebase');  // Configuración de Firebase Admin SDK
const path = require('path');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// servir /public
app.use(express.static('public'));

// Ruta opcional
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/guardar', async (req, res) => {
  const data = req.body;
  const fecha = new Date().toISOString();

  try {
    await db.collection('resultados').add({
      user_id: data.uid,
      user_email: data.email,
      metodo_autenticacion: data.metodo_autenticacion,
      edad: data.edad,
      genero: data.genero,
      educacion: data.educacion,
      mano: data.mano, 
      dispositivo: data.dispositivo,
      fecha: fecha,
      cantidad_pares: data.cantidad_pares,
      tiempo_total_segundos: data.tiempo_total_segundos,
      intentos_totales: data.intentos_totales,
      aciertos_totales: data.aciertos_totales,
      errores_totales: data.errores_totales,
      pares_presentados: data.pares_presentados || [],
      detalle_aciertos: data.detalle_aciertos || [],
      detalle_errores: data.detalle_errores || [],
      detalle_intentos: data.detalle_intentos || []
    });

    res.send('Guardado correctamente en Firebase');
  } catch (error) {
    console.error('❌ Error al guardar en Firebase:', error);
    res.status(500).send('Error al guardar en Firebase');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
