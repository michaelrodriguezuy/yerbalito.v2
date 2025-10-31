// Script de prueba para verificar el endpoint de cumpleaños
const axios = require('axios');

async function testBirthdayEndpoint() {
  try {
    console.log('🎂 Probando endpoint de cumpleaños...');
    
    const response = await axios.get('http://localhost:5001/cumples');
    console.log('✅ Respuesta del servidor:', response.data);
    
    if (response.data.cumples && response.data.cumples.length > 0) {
      console.log(`🎉 ¡Encontrados ${response.data.cumples.length} cumpleaños hoy!`);
      response.data.cumples.forEach((kid, index) => {
        console.log(`${index + 1}. ${kid.nombre} ${kid.apellido} - ${kid.categoria}`);
      });
    } else {
      console.log('😔 No hay cumpleaños hoy');
    }
  } catch (error) {
    console.error('❌ Error al probar el endpoint:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testBirthdayEndpoint();









