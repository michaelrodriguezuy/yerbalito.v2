const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();
const sendEmail = require("./sendEmail");

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
  const categoryIds = req.query.categoryIDs.split(',').map(Number);
  try {
    const [rows] = await db.query('SELECT * FROM categoria WHERE idcategoria IN (?) ORDER BY idcategoria', [categoryIds]);
    res.json({ categorias: rows });
  } catch (error) {
    console.error('Error obteniendo categorias:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});
app.get('/categories/:id', async (req, res) => {
  const categoryId = req.params.id;
  // console.log(req.params.id)

  try {
    const [rows] = await db.query('SELECT * FROM categoria WHERE idcategoria = ?', [categoryId]);
    const categoria = rows && rows.length > 0 ? rows[0] : null;

    if (categoria) {
      res.json({ categoria });
    } else {
      console.log('La categoria no se encontró en la base de datos.');
      res.status(404).json({ error: 'Categoria no encontrada' });
    }
  } catch (error) {
    console.error('Error obteniendo detalles de la categoria:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}
);

app.get('/estados', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM estado');
    res.json({ estados: rows });
  } catch (error) {
    console.error('Error obteniendo estados:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.get('/estados/:id', async (req, res) => {
  const estadoId = req.params.id;

  try {
    const [rows] = await db.query('SELECT * FROM estado WHERE idestado = ?', [estadoId]);
    const estado = rows && rows.length > 0 ? rows[0] : null;

    if (estado) {
      res.json({ estado });
    } else {
      console.log('El estado no se encontró en la base de datos.');
      res.status(404).json({ error: 'Estado no encontrado' });
    }
  } catch (error) {
    console.error('Error obteniendo detalles del estado:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}
);

app.get('/ultimoPago/:id', async (req, res) => {
  const jugadorId = req.params.id;
  try {
    const [estadoRows] = await db.query('SELECT idestado FROM jugador WHERE idjugador = ?', [jugadorId]);
    const estadoJugador = estadoRows && estadoRows.length > 0 ? estadoRows[0].idestado : null;

    if (estadoJugador === 1 || estadoJugador === 2) {
      const [reciboRows] = await db.query('SELECT MAX(mes_pago) as ultimoMesPago, MAX(anio) as anio FROM recibo WHERE idjugador = ?', [jugadorId]);

      // Verificar si hay recibos para el jugador
      if (reciboRows && reciboRows.length > 0 && reciboRows[0].ultimoMesPago !== null && reciboRows[0].anio !== null) {
        const ultimoMesPago = Meses(reciboRows[0].ultimoMesPago);
        const anioPago = reciboRows[0].anio;
        res.json({ ultimoMesPago, anioPago });
      } else {
        // console.log('No hay recibos para este jugador.', jugadorId);
        res.json({ ultimoMesPago: "No disponible", anioPago: "No disponible" });
      }
    } else if (estadoJugador === 3) {
      res.json({ ultimoMesPago: 'Exonerado', anioPago: 'Exonerado' });
    } else {
      console.log('Estado del jugador no válido: ', jugadorId);
      res.status(400).json({ error: 'Estado del jugador no válido: ', jugadorId });
    }
  } catch (error) {
    console.error('Error obteniendo detalles del mes:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// quiero recibir un numero de mes y devolver el nombre del mes

const Meses = (numMes) => {
  switch (numMes) {
    case 1:
      return "Enero";
    case 2:
      return "Febrero";
    case 3:
      return "Marzo";
    case 4:
      return "Abril";
    case 5:
      return "Mayo";
    case 6:
      return "Junio";
    case 7:
      return "Julio";
    case 8:
      return "Agosto";
    case 9:
      return "Septiembre";
    case 10:
      return "Octubre";
    case 11:
      return "Noviembre";
    case 12:
      return "Diciembre";
    default:
      return "Mes no válido";
  }
}


app.post('/send-email', async (req, res) => {
  const formData = req.body;
  try {
    const result = await sendEmail(formData);

    console.log('Enviando correo electrónico:', result);
    res.json({ result: 'Correo electrónico enviado' });
  } catch (error) {
    console.error('Error enviando correo electrónico:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}
);

app.get('/posts', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM blog');
    res.json({ posts: rows });
    // console.log("posts: ", rows);
  } catch (error) {
    console.error('Error obteniendo posts:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.get('/posts/:id', async (req, res) => {
  const postId = req.params.id;

  try {
    const row = await db.query('SELECT * FROM blog WHERE idblog = ?', [postId]);
    const post = row && row.length > 0 ? row[0][0] : null;

    if (post) {
      res.json({ post });
    } else {
      console.log('El post no se encontró en la base de datos.');
      res.status(404).json({ error: 'Post no encontrado' });
    }
  } catch (error) {
    console.error('Error obteniendo detalles del post:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// jugadores por categoria
app.get('/squad', async (req, res) => {
  const categoryIds = req.query.categoryIDs.split(',').map(Number);
  try {
    const [rows] = await db.query('SELECT * FROM jugador WHERE idcategoria IN (?) ORDER BY idcategoria, nombre', [categoryIds]);
    res.json({ squads: rows });
  } catch (error) {
    console.error('Error obteniendo jugadores:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// todos los jugadores
app.get('/squad/all', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM jugador where idcategoria IN (1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 13)');
    res.json({ squads: rows });
  } catch (error) {
    console.error('Error obteniendo jugadores:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// recibos de pagos
app.get('/payments', async (req, res) => {
  try {
    const [rows] = await db.query(`
    SELECT r.*, 
    j.nombre as nombre_jugador,
    j.apellido as apellido_jugador,
    u.nombre as nombre_usuario
    FROM recibo r 
    JOIN jugador j ON r.idjugador = j.idjugador
    JOIN usuarios u ON r.idusuario = u.id_usuario
    WHERE monto > 0
    AND j.idcategoria IN (1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 13)
    ORDER BY r.idrecibo DESC
    `);
    res.json({ payments: rows });
  } catch (error) {
    console.error('Error obteniendo pagos:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.delete('/payments/:id', async (req, res) => {
  const paymentId = req.params.id;
  try {
    await db.query('DELETE FROM recibo WHERE idrecibo = ?', [paymentId]);
    res.json({ message: 'Pago eliminado' });
  } catch (error) {
    console.error('Error eliminando pago:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.put('/payments/:id', async (req, res) => {
  const paymentId = req.params.id;
  const updateFields = req.body;
  try {
    await db.query('UPDATE recibo SET ? WHERE idrecibo = ?', [updateFields, paymentId]);
    res.json({ message: 'Pago actualizado' });
  } catch (error) {
    console.error('Error actualizando pago:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.post('/payments', async (req, res) => {
  const newPayment = req.body;
  try {
    await db.query('INSERT INTO recibo SET ?', newPayment);
    res.json({ message: 'Pago agregado' });
  } catch (error) {
    console.error('Error agregando pago:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.get('/fc', async (req, res) => {
  try {
    const [rows] = await db.query(`
    SELECT f.*, 
    j.nombre as nombre_jugador,
    j.apellido as apellido_jugador,
    u.nombre as nombre_usuario
    FROM fondocampeonato f 
    JOIN jugador j ON f.idjugador = j.idjugador
    JOIN usuarios u ON f.idusuario = u.id_usuario
    WHERE monto > 0
    AND j.idcategoria IN (1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 13)
    ORDER BY f.id_fondo DESC
    `);
    res.json({ payments: rows });
  } catch (error) {
    console.error('Error obteniendo pagos:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.delete('/fc/:id', async (req, res) => {
  const paymentId = req.params.id;
  try {
    await db.query('DELETE FROM fondocampeonato WHERE id_fondo = ?', [paymentId]);
    res.json({ message: 'Pago eliminado' });
  } catch (error) {
    console.error('Error eliminando pago:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.put('/fc/:id', async (req, res) => {
  const paymentId = req.params.id;
  const updateFields = req.body;
  try {
    await db.query('UPDATE fondocampeonato SET ? WHERE id_fondo = ?', [updateFields, paymentId]);
    res.json({ message: 'Pago actualizado' });
  } catch (error) {
    console.error('Error actualizando pago:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.post('/fc', async (req, res) => {
  const newPayment = req.body;
  try {
    await db.query('INSERT INTO fondocampeonato SET ?', newPayment);
    res.json({ message: 'Pago agregado' });
  } catch (error) {
    console.error('Error agregando pago:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
