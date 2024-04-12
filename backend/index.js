const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

const db = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

// console.log("db: ", db);

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('¡Este es el backend del Club Yerbalito!');
});

app.post('/login', async (req, res) => {
  const { usuario, password } = req.body;

  //  console.log("usuario: ", usuario); LLEGA

  try {
    const [user] = await db.query('SELECT * FROM usuarios WHERE usuario = ?', [usuario]);

    // console.log("user: ", user); LLEGA

    if (user && user.length > 0) {
      const storedHashedPassword = user[0].password;

      // esto es para hashear la contraseña
      /* const plaintextPassword = 'yago4356';
      bcrypt.hash(plaintextPassword, 10, function(err, hash) {
        if (err) {
          // Maneja el error, si ocurre
          console.error('Error durante el hashing de la contraseña:', err);
          return;
        }
      
        // 'hash' contiene el hash generado
        console.log('Hash generado:', hash);
      
      // Ahora puedes almacenar este 'hash' en tu base de datos
      }); */

     

      // Utiliza await para esperar la comparación de contraseñas
      const passwordsMatch = await bcrypt.compare(password, storedHashedPassword);
    
      
      if (passwordsMatch) {
        // Si las contraseñas coinciden, envía la respuesta con el usuario
        res.json({ user: user[0] });
        console.log("user logueado: ", user);
      } else {
        // Si las contraseñas no coinciden, responde con un error 401
        res.status(401).json({ error: 'Credenciales incorrectas' });
      }
    } else {
      // Si el usuario no existe, responde con un error 401
      res.status(401).json({ error: 'Credenciales incorrectas' });
    }
  } catch (error) {
    // Si ocurre algún error durante el proceso, responde con un error 500
    console.error('Error durante el inicio de sesión:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});


app.get('/user', async (req, res) => {
  const userId = req.query.id;

  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE id_usuario = ?', [userId]);

    if (rows && rows.length > 0) {
      const user = rows[0];
      res.json({ user });
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error obteniendo detalles del usuario:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

//ahora necesito mostrar las categorias
app.get('/categories', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categoria');
    res.json({ categorias: rows });
  } catch (error) {
    console.error('Error obteniendo categorias:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.get('/estados', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM estado');
    res.json({ estados: rows });
  } catch (error) {
    console.error('Error obteniendo estados:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});


app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
