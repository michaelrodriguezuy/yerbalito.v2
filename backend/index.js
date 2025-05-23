const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();
const sendEmail = require("./sendEmail");

//para cargar archivos
const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

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

app.get('/user/all', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM usuarios');
    res.json({ users: rows });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.post('/user', async (req, res) => {
  const newUser = req.body;

  try {
    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    newUser.password = hashedPassword

    await db.query('INSERT INTO usuarios SET ?', newUser);
    res.json({ message: 'Usuario agregado' });
  } catch (error) {

    console.error('Error agregando usuario:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.put('/user/:id', async (req, res) => {
  const userId = req.params.id;
  const updateFields = req.body;

  try {
    if (updateFields.password) {
      const hashedPassword = await bcrypt.hash(updateFields.password, 10);
      updateFields.password = hashedPassword;
    }

    await db.query('UPDATE usuarios SET ? WHERE id_usuario = ?', [updateFields, userId]);
    res.json({ message: 'Usuario actualizado' });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.delete('/user/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    await db.query('DELETE FROM usuarios WHERE id_usuario = ?', [userId]);
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

//ahora necesito mostrar las categorias
app.get('/categories', async (req, res) => {
  // const categoryIds = req.query.categoryIDs.split(',').map(Number);
  try {
    // const [rows] = await db.query('SELECT * FROM categoria WHERE idcategoria IN (?) ORDER BY idcategoria', [categoryIds]);
    const [rows] = await db.query('SELECT * FROM categoria WHERE visible = 1 ORDER BY idcategoria');
    res.json({ categorias: rows });
  } catch (error) {
    console.error('Error obteniendo categorias:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// lo uso para el dashboard
app.get('/categories/all', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categoria');
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
      // console.log("categoria: ", categoria);
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

app.post('/categories', async (req, res) => {
  const newCategory = req.body;

  try {
    await db.query('INSERT INTO categoria SET ?', newCategory);
    res.json({ message: 'Categoria agregada' });
  } catch (error) {
    console.error('Error agregando categoria:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}
);

app.put('/categories/:id', async (req, res) => {
  const categoryId = req.params.id;
  const updateFields = req.body;

  try {
    await db.query('UPDATE categoria SET ? WHERE idcategoria = ?', [updateFields, categoryId]);
    res.json({ message: 'Categoria actualizada' });
  } catch (error) {
    console.error('Error actualizando categoria:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}
);

app.delete('/categories/:id', async (req, res) => {
  const categoryId = req.params.id;

  try {
    await db.query('DELETE FROM categoria WHERE idcategoria = ?', [categoryId]);
    res.json({ message: 'Categoria eliminada' });
  } catch (error) {
    console.error('Error eliminando categoria:', error);
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
      // console.log("estado: ", estado);
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
  // const categoryIds = req.query.categoryIDs.split(',').map(Number);
  try {
    const [categories] = await db.query('SELECT idcategoria FROM categoria WHERE visible = 1');
    const categoryIds = categories.map(category => category.idcategoria);

    if (categoryIds.length === 0) {
      return res.json({ squads: [] });
    }

    const [players] = await db.query('SELECT * FROM jugador WHERE idcategoria IN (?) ORDER BY idcategoria, nombre', [categoryIds]);

    // const [rows] = await db.query('SELECT * FROM jugador WHERE idcategoria IN (?) ORDER BY idcategoria, nombre', [categoryIds]);
    // console.log("players: ", players);
    res.json({ squads: players });
    // res.json({ squads: rows });
  } catch (error) {
    console.error('Error obteniendo jugadores:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// todos los jugadores
app.get('/squad/all', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM jugador order by idcategoria');
    res.json({ squads: rows });
  } catch (error) {
    console.error('Error obteniendo jugadores:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.get('/squad/:id', async (req, res) => {

  const playerId = req.params.id;

  try {
    const [rows] = await db.query('SELECT * FROM jugador WHERE idjugador = ?', [playerId]);
    const player = rows && rows.length > 0 ? rows[0] : null;

    if (player) {
      res.json({ player });
    } else {
      console.log('El jugador no se encontró en la base de datos.');
      res.status(404).json({ error: 'Jugador no encontrado' });
    }
  } catch (error) {
    console.error('Error obteniendo detalles del jugador:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}
);


//para cargar archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'imagen') {
      cb(null, true);
    } else {
      cb(new Error('Unexpected field'), false);
    }
  }
});


app.post('/squad', upload.single('imagen'), async (req, res) => {
  const {
    nombre,
    apellido,
    cedula,
    fecha_nacimiento,
    sexo,
    numJugador,
    fecha_ingreso,
    categoria,
    ciudadania,
    padre,
    madre,
    contacto,
    hermano,
    hermanos,
    observaciones
  } = req.body;

  const imagen = req.file;
  let year = null;

  if (!imagen) {
    return res.status(400).json({ error: 'No se ha cargado ninguna imagen' });
  }

  if (categoria && /\(\d{4}\)/.test(categoria)) {
    const match = categoria.match(/\(\d{4}\)/);
    if (match && match[1]) {
      year = match[1];
    }
  }

  if (!year) {
    return res.status(400).json({ error: 'Categoría no válida o no contiene año' });
  }

  const client = new ftp.Client();
  client.ftp.verbose = true;  // Opción para ver más detalles de los logs (opcional)

  try {
    // Conectar al servidor FTP
    await client.access({
      host: "https://yerbalito.uy",  // Reemplaza por la dirección de tu servidor FTP
      user: "wwwolima",          // Reemplaza por tu usuario FTP
      password: "rjW63u0I6n",   // Reemplaza por tu contraseña FTP
      secure: false                // Cambia a true si usas FTPS
    });

    const playerName = `${nombre} ${apellido}.jpeg`;
    const remoteFilePath = `/images/${year}/${playerName}`;

    // Asegúrate de que el directorio remoto existe
    await client.ensureDir(`/images/${year}`);
    await client.uploadFrom(imagen.path, remoteFilePath);

    const newPlayer = {
      nombre,
      apellido,
      cedula,
      fecha_nacimiento,
      sexo,
      numJugador,
      imagen: `https://yerbalito.uy/images/${year}/${playerName}`, // URL de la imagen
      fecha_ingreso,
      categoria,
      ciudadania,
      padre,
      madre,
      contacto,
      hermano,
      hermanos,
      observaciones
    };
    await db.query('INSERT INTO jugador SET ?', newPlayer);
    res.json({ message: 'Jugador agregado' });
  } catch (error) {
    console.error('Error agregando jugador:', error);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    client.close();
  }
});

app.put('/squad/:id', async (req, res) => {
  const playerId = req.params.id;
  const updateFields = req.body;

  try {
    await db.query('UPDATE jugador SET ? WHERE idjugador = ?', [updateFields, playerId]);
    res.json({ message: 'Jugador actualizado' });
  } catch (error) {
    console.error('Error actualizando jugador:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}
);

app.delete('/squad/:id', async (req, res) => {
  const playerId = req.params.id;

  try {
    await db.query('DELETE FROM jugador WHERE idjugador = ?', [playerId]);
    res.json({ message: 'Jugador eliminado' });
  } catch (error) {
    console.error('Error eliminando jugador:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}
);

//quiero buscar un jugador por su cedula
app.get('/squad/search/:ci', async (req, res) => {
  const playerCi = req.params.ci;

  try {
    const [rows] = await db.query('SELECT * FROM jugador WHERE cedula = ?', [playerCi]);
    const playerExists = rows[0].count > 0;

    res.json({ exists: playerExists });


  } catch (error) {
    console.error('Error obteniendo detalles del jugador:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}
);



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
    JOIN categoria c ON j.idcategoria = c.idcategoria
    WHERE monto > 0
    AND c.visible = 1
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

//aca obtengo los pagos de cuotas por mes de cada categoria
app.get('/cuotasXcat', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        c.nombre_categoria as categoria,
        CASE 
          WHEN r.mes_pago = 1 THEN 'Enero'
          WHEN r.mes_pago = 2 THEN 'Febrero'
          WHEN r.mes_pago = 3 THEN 'Marzo'
          WHEN r.mes_pago = 4 THEN 'Abril'
          WHEN r.mes_pago = 5 THEN 'Mayo'
          WHEN r.mes_pago = 6 THEN 'Junio'
          WHEN r.mes_pago = 7 THEN 'Julio'
          WHEN r.mes_pago = 8 THEN 'Agosto'
          WHEN r.mes_pago = 9 THEN 'Septiembre'
          WHEN r.mes_pago = 10 THEN 'Octubre'
          WHEN r.mes_pago = 11 THEN 'Noviembre'
          WHEN r.mes_pago = 12 THEN 'Diciembre'
        END as mes,
        SUM(r.monto) as total
      FROM recibo r
      JOIN jugador j ON r.idjugador = j.idjugador
      JOIN categoria c ON j.idcategoria = c.idcategoria
      WHERE r.monto > 0 AND r.anio = YEAR(CURDATE()) AND c.visible = 1
      GROUP BY c.nombre_categoria, r.anio, r.mes_pago
      ORDER BY FIELD(mes,
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'),
        c.nombre_categoria, r.anio, r.mes_pago
    `);

    res.json({ payments: rows });
    // console.log("rows: ", rows);
  } catch (error) {
    console.error('Error obteniendo pagos:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.get('/paymentsAnual', async (req, res) => {
  try {
    const [rows] = await db.query(`
    SELECT 
        c.nombre_categoria as categoria,
        SUM(r.monto) as total

    FROM recibo r 
    JOIN jugador j ON r.idjugador = j.idjugador
    
    JOIN categoria c ON j.idcategoria = c.idcategoria
    WHERE monto > 0 AND c.visible = 1 AND r.anio = YEAR(CURDATE())
    GROUP BY c.nombre_categoria
    ORDER BY c.nombre_categoria
    `);
    res.json({ payments: rows });
  } catch (error) {
    console.error('Error obteniendo pagos:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});
app.get('/fcAnual', async (req, res) => {
  try {
    const [rows] = await db.query(`
    SELECT 
        c.nombre_categoria as categoria,
        SUM(f.monto) as total

    FROM fondocampeonato f 
    JOIN jugador j ON f.idjugador = j.idjugador
    
    JOIN categoria c ON j.idcategoria = c.idcategoria
    WHERE monto > 0 AND c.visible = 1 AND f.anio = YEAR(CURDATE())
    GROUP BY c.nombre_categoria
    ORDER BY c.nombre_categoria
    `);
    res.json({ payments: rows });
  } catch (error) {
    console.error('Error obteniendo pagos:', error);
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
    JOIN categoria c ON j.idcategoria = c.idcategoria
    WHERE monto > 0
    AND c.visible = 1
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

app.get('/fcXcuotas', async (req, res) => {
  try {
    const [rows] = await db.query(`
    SELECT
  c.nombre_categoria as categoria,
  SUM(CASE WHEN r.cuota_paga = 1 THEN r.monto ELSE 0 END) AS 'Total Cuota 1',
  SUM(CASE WHEN r.cuota_paga = 2 THEN r.monto ELSE 0 END) AS 'Total Cuota 2'
FROM
  fondocampeonato r
JOIN
  jugador j ON r.idjugador = j.idjugador
JOIN
  categoria c ON j.idcategoria = c.idcategoria
WHERE
  r.monto > 0
  AND c.visible = 1
  AND r.anio = YEAR(CURDATE())
GROUP BY
  c.idcategoria
  order by
	c.idcategoria;
    `);
    res.json({ payments: rows });
  } catch (error) {
    console.error('Error obteniendo pagos:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
