const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();
const sendEmail = require("./sendEmail");
const cron = require('node-cron');

//para cargar archivos
const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const PDFDocument = require('pdfkit');

const app = express();
const port = process.env.PORT || 5001;

const db = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  timezone: '-03:00', // Configurar zona horaria UTC-3 (Uruguay)
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
    const [user] = await db.query('SELECT * FROM usuario WHERE usuario = ?', [usuario]);

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



      // Compatibilidad de contraseñas: bcrypt (nuevo), md5 (legado) o texto plano (muy legado)
      let passwordsMatch = false;
      if (typeof storedHashedPassword === 'string' && storedHashedPassword.startsWith('$2')) {
        // bcrypt
        passwordsMatch = await bcrypt.compare(password, storedHashedPassword);
      } else if (/^[a-f0-9]{32}$/i.test(String(storedHashedPassword))) {
        // md5 legado (32 hex)
        const md5 = crypto.createHash('md5').update(password).digest('hex');
        passwordsMatch = md5 === String(storedHashedPassword);
      }


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
    const [rows] = await db.query('SELECT * FROM usuario WHERE id_usuario = ?', [userId]);

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
    const [rows] = await db.query('SELECT * FROM usuario');
    res.json({ users: rows });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.post('/user', async (req, res) => {
  const newUser = req.body;

  try {
    // Normalizar payload
    // Si no viene 'usuario' pero viene 'email', usarlo
    if (!newUser.usuario && newUser.email) newUser.usuario = newUser.email;
    // Proveer valor por defecto para campos opcionales que pueden ser NOT NULL en la base
    if (typeof newUser.celular === 'undefined') newUser.celular = '';
    if (typeof newUser.estado === 'undefined') newUser.estado = 1;
    // Aceptar 'rol' como string; mantener compatibilidad con columna admin si existe
    if (typeof newUser.admin === 'undefined' && typeof newUser.rol !== 'undefined') {
      // map opcional si aún existe columna admin
      newUser.admin = newUser.rol === 'admin' ? 1 : 0;
    }

    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    newUser.password = hashedPassword

    await db.query('INSERT INTO usuario SET ?', newUser);
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

    // Normalizar actualización
    if (!updateFields.usuario && updateFields.email) updateFields.usuario = updateFields.email;
    if (typeof updateFields.celular === 'undefined') updateFields.celular = '';
    if (typeof updateFields.estado === 'undefined') updateFields.estado = 1;
    if (typeof updateFields.admin === 'undefined' && typeof updateFields.rol !== 'undefined') {
      updateFields.admin = updateFields.rol === 'admin' ? 1 : 0;
    }

    await db.query('UPDATE usuario SET ? WHERE id_usuario = ?', [updateFields, userId]);
    res.json({ message: 'Usuario actualizado' });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Endpoint temporal para re-hashear contraseñas existentes (solo uso administrativo)
// Requiere header 'x-admin-secret' que coincida con process.env.ADMIN_SECRET
// (Endpoint temporal de re-hash eliminado a pedido del usuario)

app.delete('/user/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    await db.query('DELETE FROM usuario WHERE id_usuario = ?', [userId]);
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
    // Detectar si la petición viene de un admin
    // (acepta cualquiera de estas señales sencillas hasta tener JWT)
    const roleHeader = (req.headers['x-role'] || '').toString().toLowerCase();
    const roleQuery = (req.query.role || '').toString().toLowerCase();
    const isAdmin = roleHeader === 'admin' || roleQuery === 'admin';

    let query;
    if (isAdmin) {
      // Admin ve absolutamente todas
      query = 'SELECT * FROM categoria ORDER BY idcategoria';
    } else {
      // Usuario logueado no-admin ve todas excepto "SIN FICHAR"
      query = "SELECT * FROM categoria WHERE nombre_categoria <> 'SIN FICHAR' ORDER BY idcategoria";
    }

    const [rows] = await db.query(query);
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
      // Obtener el último recibo válido (visible = 1)
      // Incluye recibos con monto > 0 Y recibos con monto = 0 si:
      //   1. Tienen la observación de pago automático por hermano (nuevos)
      //   2. O tienen monto = 0 y mes_pago entre 3 y 11 (recibos antiguos de hermanos)
      //      (excluye enero, febrero y diciembre que normalmente no se cobran)
      // Ordenado por año DESC y mes_pago DESC para obtener el más reciente
      const [reciboRows] = await db.query(`
        SELECT r.mes_pago as ultimoMesPago, r.anio 
        FROM recibo r
        WHERE r.idjugador = ? 
          AND r.visible = 1 
          AND (
            r.monto > 0 
            OR (
              r.monto = 0 
              AND (
                r.observacionesRecibo LIKE '%Pago automático por hermano%'
                OR (r.mes_pago BETWEEN 3 AND 11)
              )
            )
          )
        ORDER BY r.anio DESC, r.mes_pago DESC 
        LIMIT 1
      `, [jugadorId]);

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

// Endpoint para obtener todos los blogs (para dashboard)
app.get('/blogs', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM blog ORDER BY fecha_creacion DESC');
    res.json({ blogs: rows });
  } catch (error) {
    console.error('Error obteniendo blogs:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Endpoint para obtener un blog individual
app.get('/blog/:id', async (req, res) => {
  const blogId = req.params.id;

  try {
    const [rows] = await db.query('SELECT * FROM blog WHERE idblog = ? AND visible = 1', [blogId]);
    const blog = rows && rows.length > 0 ? rows[0] : null;

    if (blog) {
      res.json({ blog });
    } else {
      console.log('El blog no se encontró en la base de datos.');
      res.status(404).json({ error: 'Blog no encontrado' });
    }
  } catch (error) {
    console.error('Error obteniendo detalles del blog:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Endpoint para crear un nuevo blog
app.post('/blogs', async (req, res) => {
  try {
    const { titulo, contenido, autor, imagen, visible } = req.body;
    
    if (!titulo || !contenido || !autor) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const [result] = await db.query(
      'INSERT INTO blog (titulo, contenido, autor, imagen, visible) VALUES (?, ?, ?, ?, ?)',
      [titulo, contenido, autor, imagen || null, visible !== undefined ? visible : 1]
    );

    res.json({ 
      success: true, 
      message: 'Blog creado correctamente',
      idblog: result.insertId 
    });
  } catch (error) {
    console.error('Error creando blog:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Endpoint para actualizar un blog
app.put('/blogs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, contenido, autor, imagen, visible } = req.body;
    
    if (!titulo || !contenido || !autor) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    await db.query(
      'UPDATE blog SET titulo = ?, contenido = ?, autor = ?, imagen = ?, visible = ? WHERE idblog = ?',
      [titulo, contenido, autor, imagen || null, visible !== undefined ? visible : 1, id]
    );

    res.json({ 
      success: true, 
      message: 'Blog actualizado correctamente' 
    });
  } catch (error) {
    console.error('Error actualizando blog:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Endpoint para eliminar un blog
app.delete('/blogs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.query('DELETE FROM blog WHERE idblog = ?', [id]);

    res.json({ 
      success: true, 
      message: 'Blog eliminado correctamente' 
    });
  } catch (error) {
    console.error('Error eliminando blog:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Endpoint para obtener todas las noticias (públicas)
app.get('/noticias', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM noticias WHERE visible = 1 ORDER BY fecha_creacion DESC');
    res.json({ noticias: rows });
  } catch (error) {
    console.error('Error obteniendo noticias:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Endpoint para obtener todas las noticias (para dashboard - incluye ocultas)
app.get('/noticias/all', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM noticias ORDER BY fecha_creacion DESC');
    res.json({ noticias: rows });
  } catch (error) {
    console.error('Error obteniendo noticias:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Endpoint para obtener una noticia individual
app.get('/noticias/:id', async (req, res) => {
  const noticiaId = req.params.id;

  try {
    const [rows] = await db.query('SELECT * FROM noticias WHERE idnoticia = ? AND visible = 1', [noticiaId]);
    const noticia = rows && rows.length > 0 ? rows[0] : null;

    if (noticia) {
      res.json({ noticia });
    } else {
      console.log('La noticia no se encontró en la base de datos.');
      res.status(404).json({ error: 'Noticia no encontrada' });
    }
  } catch (error) {
    console.error('Error obteniendo detalles de la noticia:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Endpoint para crear una nueva noticia
app.post('/noticias/create', async (req, res) => {
  try {
    const { titulo, contenido, autor, imagen, visible } = req.body;
    
    if (!titulo || !contenido || !autor) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const [result] = await db.query(
      'INSERT INTO noticias (titulo, contenido, autor, imagen, visible) VALUES (?, ?, ?, ?, ?)',
      [titulo, contenido, autor, imagen || null, visible !== undefined ? visible : 1]
    );

    res.json({ 
      success: true, 
      message: 'Noticia creada correctamente',
      idnoticia: result.insertId 
    });
  } catch (error) {
    console.error('Error creando noticia:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Endpoint para actualizar una noticia
app.put('/noticias/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, contenido, autor, imagen, visible } = req.body;
    
    if (!titulo || !contenido || !autor) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    await db.query(
      'UPDATE noticias SET titulo = ?, contenido = ?, autor = ?, imagen = ?, visible = ? WHERE idnoticia = ?',
      [titulo, contenido, autor, imagen || null, visible !== undefined ? visible : 1, id]
    );

    res.json({ 
      success: true, 
      message: 'Noticia actualizada correctamente' 
    });
  } catch (error) {
    console.error('Error actualizando noticia:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Endpoint para eliminar una noticia
app.delete('/noticias/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.query('DELETE FROM noticias WHERE idnoticia = ?', [id]);

    res.json({ 
      success: true, 
      message: 'Noticia eliminada correctamente' 
    });
  } catch (error) {
    console.error('Error eliminando noticia:', error);
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

    const [players] = await db.query(`
      SELECT j.*, c.nombre_categoria 
      FROM jugador j 
      LEFT JOIN categoria c ON j.idcategoria = c.idcategoria 
      WHERE j.idcategoria IN (?) 
      ORDER BY j.idcategoria, j.nombre
    `, [categoryIds]);

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
    // Solo devolver jugadores de categorías públicas (visible = 1)
    // Ordenar alfabéticamente por apellido y nombre, sin importar la categoría
    const [rows] = await db.query(`
      SELECT j.*, c.nombre_categoria 
      FROM jugador j 
      LEFT JOIN categoria c ON j.idcategoria = c.idcategoria 
      WHERE c.visible = 1
      ORDER BY j.apellido, j.nombre
    `);
    res.json({ squads: rows });
  } catch (error) {
    console.error('Error obteniendo jugadores:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.get('/squad/:id', async (req, res) => {
  const playerId = req.params.id;

  try {
    const [rows] = await db.query(`
      SELECT j.*, c.nombre_categoria 
      FROM jugador j 
      LEFT JOIN categoria c ON j.idcategoria = c.idcategoria 
      WHERE j.idjugador = ?
    `, [playerId]);
    const player = rows && rows.length > 0 ? rows[0] : null;

    if (player) {
      // Obtener los hermanos del jugador (relaciones bidireccionales)
      const [hermanosRows] = await db.query(`
        SELECT DISTINCT 
          CASE 
            WHEN idjugador = ? THEN idhermano 
            ELSE idjugador 
          END as idhermano
        FROM hermanos 
        WHERE idjugador = ? OR idhermano = ?
      `, [playerId, playerId, playerId]);
      
      // Convertir a array de IDs para el frontend
      const hermanosIds = hermanosRows.map(row => row.idhermano);
      
      // Agregar los IDs de hermanos al objeto player
      player.selectedSiblings = hermanosIds;
      
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
    numeroClub,
    fecha_ingreso,
    idcategoria,
    idestado,
    ciudadania,
    padre,
    madre,
    contacto,
    hermanos,
    observaciones
  } = req.body;

  const imagen = req.file;
  let year = null;

  // Si hay imagen, necesitamos el año de la categoría para la estructura de carpetas
  if (imagen && idcategoria) {
    try {
      const [categoryRows] = await db.query('SELECT nombre_categoria FROM categoria WHERE idcategoria = ?', [idcategoria]);
      if (categoryRows && categoryRows.length > 0) {
        const categoriaNombre = categoryRows[0].nombre_categoria;
        if (categoriaNombre && /\(\d{4}\)/.test(categoriaNombre)) {
          const match = categoriaNombre.match(/\((\d{4})\)/);
          if (match && match[1]) {
            year = match[1];
          }
        }
      }
    } catch (error) {
      console.error('Error obteniendo categoría:', error);
    }
  }

  if (imagen && !year) {
    return res.status(400).json({ error: 'Categoría no válida o no contiene año para subir imagen' });
  }

  let client = null;

  try {
    // Conectar al servidor FTP solo si hay imagen
    if (imagen) {
      client = new ftp.Client();
      client.ftp.verbose = true;
      
      await client.access({
        host: "https://yerbalito.uy",
        user: "wwwolima",
        password: "rjW63u0I6n",
        secure: false
      });

      const playerName = `${nombre} ${apellido}.jpeg`;
      const remoteFilePath = `/images/${year}/${playerName}`;

      // Asegúrate de que el directorio remoto existe
      await client.ensureDir(`/images/${year}`);
      await client.uploadFrom(imagen.path, remoteFilePath);
    }

    const newPlayer = {
      nombre,
      apellido,
      cedula,
      fecha_nacimiento,
      sexo,
      numeroClub: numeroClub || null,
      imagen: imagen ? `https://yerbalito.uy/images/${year}/${nombre} ${apellido}.jpeg` : 'user.jpg',
      fecha_ingreso,
      idcategoria,
      ciudadania: ciudadania || null,
      padre: padre || null,
      madre: madre || null,
      contacto: contacto || null,
      observacionesJugador: observaciones || null
    };
    
    // Solo agregar idestado si se proporciona explícitamente
    if (idestado) {
      newPlayer.idestado = idestado;
    } else {
      // Estado por defecto: 2 (Habilitado) para nuevos jugadores
      newPlayer.idestado = 2;
    }
    
    // Insertar el jugador
    const [result] = await db.query('INSERT INTO jugador SET ?', newPlayer);
    const idjugador = result.insertId;
    
    // Si hay hermanos, insertarlos en la tabla hermanos
    if (hermanos && hermanos.trim() !== '') {
      const hermanosIds = hermanos.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id) && id > 0);
      
      // Insertar relaciones bidireccionales (si A es hermano de B, entonces B es hermano de A)
      for (const idhermano of hermanosIds) {
        if (idhermano !== idjugador) {
          // Relación: jugador -> hermano
          await db.query('INSERT INTO hermanos (idjugador, idhermano) VALUES (?, ?)', [idjugador, idhermano]);
          // Relación inversa: hermano -> jugador (solo si no existe ya)
          const [existing] = await db.query('SELECT * FROM hermanos WHERE idjugador = ? AND idhermano = ?', [idhermano, idjugador]);
          if (existing.length === 0) {
            await db.query('INSERT INTO hermanos (idjugador, idhermano) VALUES (?, ?)', [idhermano, idjugador]);
          }
        }
      }
    }
    
    res.json({ message: 'Jugador agregado' });
  } catch (error) {
    console.error('Error agregando jugador:', error);
    res.status(500).json({ 
      error: error.sqlMessage || error.message || 'Error del servidor al agregar el jugador' 
    });
  } finally {
    if (client) {
      client.close();
    }
  }
});

app.put('/squad/:id', upload.single('imagen'), async (req, res) => {
  const playerId = req.params.id;
  const {
    nombre,
    apellido,
    cedula,
    fecha_nacimiento,
    sexo,
    numeroClub,
    fecha_ingreso,
    idcategoria,
    idestado,
    ciudadania,
    padre,
    madre,
    contacto,
    hermanos,
    observaciones
  } = req.body;

  const imagen = req.file;

  try {
    // Obtener el jugador actual para preservar la imagen si no se envía una nueva
    const [currentPlayerRows] = await db.query('SELECT imagen FROM jugador WHERE idjugador = ?', [playerId]);
    const currentImage = currentPlayerRows && currentPlayerRows.length > 0 ? currentPlayerRows[0].imagen : 'user.jpg';

    let updateFields = {
      nombre,
      apellido,
      cedula,
      fecha_nacimiento,
      sexo,
      numeroClub: numeroClub || null,
      fecha_ingreso,
      idcategoria,
      ciudadania: ciudadania || null,
      padre: padre || null,
      madre: madre || null,
      contacto: contacto || null,
      observacionesJugador: observaciones || null,
      imagen: currentImage // Mantener la imagen actual si no se sube una nueva
    };
    
    // Solo actualizar idestado si se proporciona explícitamente
    // Esto permite cambios manuales mientras el sistema automático sigue funcionando
    if (idestado !== undefined && idestado !== null && idestado !== '') {
      updateFields.idestado = idestado;
    }

    // Si hay nueva imagen, subirla y actualizar la URL
    if (imagen && idcategoria) {
      let year = null;
      try {
        const [categoryRows] = await db.query('SELECT nombre_categoria FROM categoria WHERE idcategoria = ?', [idcategoria]);
        if (categoryRows && categoryRows.length > 0) {
          const categoriaNombre = categoryRows[0].nombre_categoria;
          if (categoriaNombre && /\(\d{4}\)/.test(categoriaNombre)) {
            const match = categoriaNombre.match(/\((\d{4})\)/);
            if (match && match[1]) {
              year = match[1];
            }
          }
        }
      } catch (error) {
        console.error('Error obteniendo categoría:', error);
      }
      
      if (year) {
        const client = new ftp.Client();
        client.ftp.verbose = true;
        
        try {
          await client.access({
            host: "https://yerbalito.uy",
            user: "wwwolima",
            password: "rjW63u0I6n",
            secure: false
          });

          const playerName = `${nombre} ${apellido}.jpeg`;
          const remoteFilePath = `/images/${year}/${playerName}`;
          await client.ensureDir(`/images/${year}`);
          await client.uploadFrom(imagen.path, remoteFilePath);
          
          updateFields.imagen = `https://yerbalito.uy/images/${year}/${playerName}`;
        } catch (ftpError) {
          console.error('Error subiendo imagen FTP:', ftpError);
        } finally {
          client.close();
        }
      }
    }

    await db.query('UPDATE jugador SET ? WHERE idjugador = ?', [updateFields, playerId]);
    
    // Debug: Ver qué se recibe
    console.log('PUT /squad/:id - hermanos recibido:', hermanos, 'tipo:', typeof hermanos);
    
    // Eliminar todas las relaciones de hermanos existentes
    await db.query('DELETE FROM hermanos WHERE idjugador = ?', [playerId]);
    await db.query('DELETE FROM hermanos WHERE idhermano = ?', [playerId]);
    
    // Si hay hermanos nuevos, insertarlos
    // Nota: hermanos puede venir como string vacío '', que debe tratarse como "sin hermanos"
    if (hermanos) {
      let hermanosIds = [];
      
      // Manejar diferentes formatos: string separado por comas o array
      if (typeof hermanos === 'string') {
        const trimmed = hermanos.trim();
        if (trimmed !== '') {
          hermanosIds = trimmed.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id) && id > 0);
        }
      } else if (Array.isArray(hermanos)) {
        hermanosIds = hermanos.map(id => parseInt(id)).filter(id => !isNaN(id) && id > 0);
      }
      
      if (hermanosIds.length > 0) {
        console.log('PUT /squad/:id - Insertando hermanos:', hermanosIds);
        // Insertar relaciones bidireccionales
        for (const idhermano of hermanosIds) {
          if (idhermano !== playerId) {
            // Relación: jugador -> hermano
            await db.query('INSERT INTO hermanos (idjugador, idhermano) VALUES (?, ?)', [playerId, idhermano]);
            // Relación inversa: hermano -> jugador (solo si no existe ya)
            const [existing] = await db.query('SELECT * FROM hermanos WHERE idjugador = ? AND idhermano = ?', [idhermano, playerId]);
            if (existing.length === 0) {
              await db.query('INSERT INTO hermanos (idjugador, idhermano) VALUES (?, ?)', [idhermano, playerId]);
            }
          }
        }
      }
    }
    // Si hermanos viene como string vacío o undefined, ya se eliminaron todas las relaciones arriba
    
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
    const { playerId, year } = req.query;
    let query = `
      SELECT r.*, 
      j.nombre as nombre_jugador,
      j.apellido as apellido_jugador,
      u.nombre as nombre_usuario
      FROM recibo r 
      JOIN jugador j ON r.idjugador = j.idjugador
      JOIN usuario u ON r.idusuario = u.id_usuario
      JOIN categoria c ON j.idcategoria = c.idcategoria
      WHERE c.visible = 1
      AND r.visible = 1
      AND (monto > 0 OR (monto = 0 AND r.observacionesRecibo LIKE '%Pago automático por hermano%'))
    `;
    
    const params = [];
    
    // Filtrar por jugador si se proporciona playerId
    if (playerId) {
      query += ` AND r.idjugador = ?`;
      params.push(playerId);
    }
    
    // Filtrar por año si se proporciona year
    if (year) {
      query += ` AND r.anio = ?`;
      params.push(year);
    }
    
    query += ` ORDER BY r.idrecibo DESC`;
    
    const [rows] = await db.query(query, params);
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

/**
 * Función auxiliar para actualizar el estado de una categoría basado en sus jugadores
 * Si hay al menos 1 jugador en estado=1 (Deshabilitado), la categoría pasa a estado=5
 * Si no hay ningún jugador en estado=1, la categoría pasa a estado=6
 */
async function updateCategoryState(connection, categoryId) {
  try {
    // Contar cuántos jugadores de esta categoría están deshabilitados (estado=1)
    const [result] = await connection.query(
      `SELECT COUNT(*) as deshabilitados 
       FROM jugador 
       WHERE idcategoria = ? AND idestado = 1`,
      [categoryId]
    );
    
    const jugadoresDeshabilitados = result[0].deshabilitados;
    
    // Determinar el nuevo estado de la categoría
    let nuevoEstadoCategoria = null;
    
    if (jugadoresDeshabilitados > 0) {
      // Hay al menos un jugador deshabilitado
      nuevoEstadoCategoria = 5;
    } else {
      // No hay jugadores deshabilitados
      nuevoEstadoCategoria = 6;
    }
    
    // Actualizar el estado de la categoría
    await connection.query(
      'UPDATE categoria SET idestado = ? WHERE idcategoria = ?',
      [nuevoEstadoCategoria, categoryId]
    );
  } catch (error) {
    console.error('Error actualizando estado de la categoría:', categoryId, error);
    // No lanzar el error para no afectar el flujo principal
  }
}

/**
 * Función auxiliar para actualizar el estado de un jugador basado en sus pagos
 * Un jugador debe tener pagado el mes anterior (cuota a mes vencido)
 * Si no lo tiene pagado y ya pasó el día 10 del mes actual, pasa a estado=1 (Deshabilitado)
 * Si lo paga, vuelve a estado=2 (Habilitado)
 */
async function updatePlayerState(connection, playerId) {
  try {
    // Obtener el jugador
    const [player] = await connection.query(
      'SELECT idestado, fecha_ingreso FROM jugador WHERE idjugador = ?',
      [playerId]
    );
    
    if (player.length === 0 || player[0].idestado === 3) {
      // No existe o está exonerado, no hacer nada
      return;
    }
    
    // Obtener configuración de meses habilitados (usar el año más reciente)
    const [valores] = await connection.query('SELECT meses_cuotas FROM valores ORDER BY ano DESC LIMIT 1');
    // Parsear JSON si viene como string, o usar directamente si ya es array
    let mesesHabilitados = [1,2,3,4,5,6,7,8,9,10,11,12]; // Default
    if (valores.length > 0 && valores[0].meses_cuotas) {
      try {
        const mesesRaw = valores[0].meses_cuotas;
        console.log(`[updatePlayerState] Jugador ${playerId}: meses_cuotas raw type=${typeof mesesRaw}, value=${JSON.stringify(mesesRaw)}`);
        
        if (typeof mesesRaw === 'string') {
          mesesHabilitados = JSON.parse(mesesRaw);
        } else if (Array.isArray(mesesRaw)) {
          mesesHabilitados = mesesRaw;
        } else {
          // Si es un objeto JSON de MySQL (mysql2 devuelve JSON como objeto Buffer o similar)
          mesesHabilitados = JSON.parse(JSON.stringify(mesesRaw));
        }
        
        // Asegurar que es un array válido de números
        if (!Array.isArray(mesesHabilitados)) {
          console.error(`[updatePlayerState] Jugador ${playerId}: meses_cuotas no es array, usando default`);
          mesesHabilitados = [1,2,3,4,5,6,7,8,9,10,11,12];
        } else {
          // Convertir todos los elementos a números por si acaso
          mesesHabilitados = mesesHabilitados.map(m => parseInt(m)).filter(m => !isNaN(m));
          console.log(`[updatePlayerState] Jugador ${playerId}: mesesHabilitados parseados=${JSON.stringify(mesesHabilitados)}`);
        }
      } catch (e) {
        console.error(`[updatePlayerState] Jugador ${playerId}: Error parseando meses_cuotas:`, e);
        mesesHabilitados = [1,2,3,4,5,6,7,8,9,10,11,12];
      }
    }
    
    // Obtener fecha actual
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 0-11 -> 1-12
    const currentDay = now.getDate();
    
    // Determinar el mes que debería estar pagado (mes anterior)
    let mesVencido = currentMonth - 1;
    let anioVencido = currentYear;
    
    if (mesVencido === 0) {
      mesVencido = 12;
      anioVencido = currentYear - 1;
    }
    
    // Verificar si el mes vencido está en los meses habilitados
    // Si no está habilitado, buscar el mes habilitado anterior más cercano
    // IMPORTANTE: Agregar límite para evitar loop infinito
    let intentos = 0;
    const maxIntentos = 24; // Máximo 24 meses (2 años) para evitar recursión infinita
    while (!mesesHabilitados.includes(mesVencido) && mesVencido > 0 && intentos < maxIntentos) {
      mesVencido--;
      intentos++;
      if (mesVencido === 0) {
        mesVencido = 12;
        anioVencido--;
      }
    }
    if (intentos >= maxIntentos) {
      console.error(`[updatePlayerState] ERROR: Loop infinito detectado para jugador ${playerId}, usando mes por defecto`);
      mesVencido = 10; // Usar octubre como fallback
      anioVencido = currentYear;
    }
    
    // Verificar si el jugador ingresó después del mes vencido que se está verificando
    if (player[0].fecha_ingreso) {
      const fechaIngreso = new Date(player[0].fecha_ingreso);
      const ingresoYear = fechaIngreso.getFullYear();
      const ingresoMonth = fechaIngreso.getMonth() + 1;
      
      // Si el año y mes vencido es anterior al ingreso, no verificar este mes
      if (anioVencido < ingresoYear || (anioVencido === ingresoYear && mesVencido < ingresoMonth)) {
        // El jugador no debe este mes porque aún no estaba en el club
        // Por lo tanto, debe estar habilitado (estado=2)
        await connection.query(
          'UPDATE jugador SET idestado = 2 WHERE idjugador = ? AND idestado != 3',
          [playerId]
        );
        return;
      }
    }
    
    // Verificar si tiene pagado el mes vencido
    // Considerar recibos con monto > 0 O recibos con monto = 0 si son de hermanos (tienen observación especial)
    // O recibos antiguos con monto = 0 y mes_pago entre 3 y 11
    const [pagos] = await connection.query(
      `SELECT * FROM recibo 
       WHERE idjugador = ? 
       AND mes_pago = ? 
       AND anio = ? 
       AND visible = 1
       AND (
         monto > 0 
         OR (
           monto = 0 
           AND (
             observacionesRecibo LIKE '%Pago automático por hermano%'
             OR mes_pago BETWEEN 3 AND 11
           )
         )
       )
       LIMIT 1`,
      [playerId, mesVencido, anioVencido]
    );
    
    const tieneMesVencidoPago = pagos.length > 0;
    
    // Verificar si hay meses anteriores vencidos (no pagados)
    // Esto es crítico: si hay meses anteriores vencidos, NO aplicar plazo de gracia
    let tieneMesesAnterioresVencidos = false;
    if (!tieneMesVencidoPago) {
      // Buscar meses anteriores hasta encontrar uno pagado o llegar al límite
      let mesAVerificar = mesVencido;
      let anioAVerificar = anioVencido;
      let intentosBusqueda = 0;
      const maxIntentosBusqueda = 12; // Máximo 12 meses hacia atrás
      
      while (intentosBusqueda < maxIntentosBusqueda) {
        // Retroceder un mes
        mesAVerificar--;
        if (mesAVerificar === 0) {
          mesAVerificar = 12;
          anioAVerificar--;
        }
        
        // Verificar si este mes está en los meses habilitados
        if (!mesesHabilitados.includes(mesAVerificar)) {
          intentosBusqueda++;
          continue;
        }
        
        // Verificar si el jugador ingresó después de este mes
        if (player[0].fecha_ingreso) {
          const fechaIngreso = new Date(player[0].fecha_ingreso);
          const ingresoYear = fechaIngreso.getFullYear();
          const ingresoMonth = fechaIngreso.getMonth() + 1;
          
          if (anioAVerificar < ingresoYear || (anioAVerificar === ingresoYear && mesAVerificar < ingresoMonth)) {
            // El jugador no debe este mes porque aún no estaba en el club
            break;
          }
        }
        
        // Verificar si tiene este mes pagado
        const [pagosAnteriores] = await connection.query(
          `SELECT * FROM recibo 
           WHERE idjugador = ? 
           AND mes_pago = ? 
           AND anio = ? 
           AND visible = 1
           AND (
             monto > 0 
             OR (
               monto = 0 
               AND (
                 observacionesRecibo LIKE '%Pago automático por hermano%'
                 OR mes_pago BETWEEN 3 AND 11
               )
             )
           )
           LIMIT 1`,
          [playerId, mesAVerificar, anioAVerificar]
        );
        
        if (pagosAnteriores.length === 0) {
          // Este mes no está pagado, hay meses vencidos anteriores
          tieneMesesAnterioresVencidos = true;
          console.log(`[updatePlayerState] ⚠️ Jugador ${playerId}: tiene mes anterior vencido ${mesAVerificar}/${anioAVerificar} sin pagar`);
          break;
        } else {
          // Este mes está pagado, no hay más meses vencidos anteriores
          break;
        }
        
        intentosBusqueda++;
      }
    }
    
    // Debug: Log detallado
    console.log(`[updatePlayerState] Jugador ${playerId}: mesVencido=${mesVencido}/${anioVencido}, tienePago=${tieneMesVencidoPago}, tieneMesesAnterioresVencidos=${tieneMesesAnterioresVencidos}, currentDay=${currentDay}, recibosEncontrados=${pagos.length}`);
    if (pagos.length > 0) {
      console.log(`[updatePlayerState] Recibo encontrado: id=${pagos[0].idrecibo}, monto=${pagos[0].monto}, observaciones=${pagos[0].observacionesRecibo}`);
    } else {
      console.log(`[updatePlayerState] ⚠️ Jugador ${playerId} NO tiene el mes vencido ${mesVencido}/${anioVencido} pagado`);
    }
    
    // Determinar el nuevo estado
    // Lógica CORREGIDA: 
    // - Si tiene el mes vencido pagado → habilitado (estado=2)
    // - Si NO tiene el mes vencido pagado PERO hay meses anteriores vencidos → deshabilitado (estado=1) SIN plazo de gracia
    // - Si NO tiene el mes vencido pagado Y NO hay meses anteriores vencidos:
    //   - Si estamos en días 1-10 del mes actual → plazo de gracia → habilitado (estado=2)
    //   - Si ya pasó el día 10 → deshabilitado (estado=1)
    let nuevoEstado = null;
    
    if (tieneMesVencidoPago) {
      // Tiene el mes vencido pagado, debe estar habilitado (estado=2)
      nuevoEstado = 2;
      console.log(`[updatePlayerState] ✅ Jugador ${playerId}: tiene mes vencido pagado → estado=2 (HABILITADO)`);
    } else if (tieneMesesAnterioresVencidos) {
      // Tiene meses anteriores vencidos, NO aplicar plazo de gracia → deshabilitado
      nuevoEstado = 1;
      console.log(`[updatePlayerState] ❌ Jugador ${playerId}: tiene meses anteriores vencidos → estado=1 (DESHABILITADO) - SIN plazo de gracia`);
    } else {
      // No tiene el mes vencido pagado pero tampoco meses anteriores vencidos
      // Si estamos en días 1-10 del mes actual, está dentro del plazo de gracia → habilitado
      // Si ya pasó el día 10, debe estar deshabilitado
      if (currentDay <= 10) {
        nuevoEstado = 2; // Plazo de gracia (días 1-10)
        console.log(`[updatePlayerState] ⏳ Jugador ${playerId}: sin mes vencido, pero en plazo de gracia (día ${currentDay} ≤ 10) → estado=2 (HABILITADO)`);
      } else {
        nuevoEstado = 1; // Ya pasó el plazo, debe estar deshabilitado
        console.log(`[updatePlayerState] ❌ Jugador ${playerId}: sin mes vencido y fuera de plazo (día ${currentDay} > 10) → estado=1 (DESHABILITADO)`);
      }
    }
    
    console.log(`[updatePlayerState] Jugador ${playerId}: nuevoEstado=${nuevoEstado}`);
    
    // Actualizar el estado solo si cambió (y no es exonerado)
    const [updateResult] = await connection.query(
      'UPDATE jugador SET idestado = ? WHERE idjugador = ? AND idestado != 3',
      [nuevoEstado, playerId]
    );
    console.log(`[updatePlayerState] Jugador ${playerId}: UPDATE ejecutado, rowsAffected=${updateResult.affectedRows}`);
  } catch (error) {
    console.error('Error actualizando estado del jugador:', playerId, error);
    // No lanzar el error para no afectar el flujo principal
  }
}

app.post('/payments', async (req, res) => {
  const paymentData = req.body;
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Validar que el jugador existe, pertenece a una categoría activa (visible = 1) y no está exonerado (estado=3)
    const [playerStatus] = await connection.query(
      `SELECT j.idestado, c.visible 
       FROM jugador j 
       LEFT JOIN categoria c ON j.idcategoria = c.idcategoria 
       WHERE j.idjugador = ?`, 
      [paymentData.idjugador]
    );
    
    if (playerStatus.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }
    
    if (!playerStatus[0].visible || playerStatus[0].visible !== 1) {
      await connection.rollback();
      return res.status(400).json({ error: 'El jugador debe pertenecer a una categoría activa' });
    }
    
    if (playerStatus[0].idestado === 3) {
      await connection.rollback();
      return res.status(400).json({ error: 'No se pueden crear recibos para jugadores exonerados (estado=3)' });
    }
    
    // Generar número de recibo si no viene (usar el máximo + 1)
    let numeroRecibo = paymentData.numero;
    if (!numeroRecibo) {
      const [maxNum] = await connection.query('SELECT MAX(numero) as maxNum FROM recibo');
      numeroRecibo = (maxNum[0]?.maxNum || 0) + 1;
    }
    
    // Normalizar el objeto: mapear cuota_paga -> mes_pago si existe
    // Mapear observaciones -> observacionesRecibo (nombre correcto de la columna)
    const newPayment = {
      ...paymentData,
      numero: numeroRecibo,
      mes_pago: paymentData.cuota_paga || paymentData.mes_pago, // Mapear cuota_paga a mes_pago
      anio: paymentData.anio || new Date().getFullYear(), // Asegurar año si no viene
      fecha_recibo: paymentData.fecha_recibo || new Date().toISOString().split('T')[0], // Fecha actual si no viene
      visible: paymentData.visible !== undefined ? paymentData.visible : 1, // Visible por defecto
      observacionesRecibo: paymentData.observaciones || paymentData.observacionesRecibo || null, // Mapear observaciones a observacionesRecibo
    };
    // Eliminar campos que no existen en la tabla
    delete newPayment.cuota_paga;
    delete newPayment.observaciones; // Ya mapeado a observacionesRecibo
    
    // 1. Insertar el pago principal
    // Asegurar que todos los campos requeridos estén presentes
    if (!newPayment.idjugador || !newPayment.monto || !newPayment.mes_pago || !newPayment.anio || !newPayment.idusuario) {
      await connection.rollback();
      console.error('Datos incompletos en payment:', newPayment);
      return res.status(400).json({ error: 'Datos incompletos: faltan campos obligatorios' });
    }
    
    const [insertResult] = await connection.query('INSERT INTO recibo SET ?', newPayment);
    const reciboId = insertResult.insertId; // ID del recibo creado
    
    // 2. Verificar si el jugador tiene hermanos (consultar tabla relacional hermanos)
    // Buscar hermanos en ambas direcciones (bidireccional)
    const [siblings] = await connection.query(
      `SELECT DISTINCT 
        CASE 
          WHEN idjugador = ? THEN idhermano 
          ELSE idjugador 
        END as idhermano
      FROM hermanos 
      WHERE idjugador = ? OR idhermano = ?`, 
      [newPayment.idjugador, newPayment.idjugador, newPayment.idjugador]
    );
    
    let hermanosAfectados = 0;
    
    // 3. Crear pagos para TODOS los hermanos encontrados (excepto los exonerados)
    if (siblings.length > 0) {
      let numeroReciboActual = numeroRecibo;
      for (const sibling of siblings) {
        const hermanoId = sibling.idhermano;
        if (hermanoId && hermanoId !== newPayment.idjugador) {
          // Validar que el hermano existe, pertenece a categoría activa y NO está exonerado
          const [hermanoStatus] = await connection.query(
            `SELECT j.idestado, c.visible 
             FROM jugador j 
             LEFT JOIN categoria c ON j.idcategoria = c.idcategoria 
             WHERE j.idjugador = ?`, 
            [hermanoId]
          );
          
          // Solo crear recibo si el hermano existe, pertenece a categoría activa y NO está exonerado
          if (hermanoStatus.length > 0 && 
              hermanoStatus[0].visible === 1 && 
              hermanoStatus[0].idestado !== 3) {
            numeroReciboActual++; // Cada hermano tiene un número de recibo único e incremental
            const hermanoPayment = {
              ...newPayment,
              numero: numeroReciboActual,
              idjugador: hermanoId,
              monto: 0, // Los recibos de hermanos siempre tienen monto 0 para no afectar reportes
              observacionesRecibo: `Pago automático por hermano (ID: ${newPayment.idjugador})${newPayment.observacionesRecibo ? ' - ' + newPayment.observacionesRecibo : ''}`
            };
            // Eliminar idrecibo si existe (es autoincremental)
            delete hermanoPayment.idrecibo;
            await connection.query('INSERT INTO recibo SET ?', hermanoPayment);
            hermanosAfectados++;
          }
        }
      }
    }
    
    // 4. Hacer commit de la transacción PRIMERO para que los recibos sean visibles
    await connection.commit();
    connection.release();
    
    console.log(`[POST /payments] ✅ Recibo creado para jugador ${newPayment.idjugador}, mes ${newPayment.mes_pago}/${newPayment.anio}`);
    
    // 5. Actualizar el estado del jugador y hermanos DESPUÉS del commit
    // Usar una nueva conexión para actualizar estados (los recibos ya están confirmados en la BD)
    const connectionForUpdate = await db.getConnection();
    try {
      console.log(`[POST /payments] 🔄 Llamando a updatePlayerState para jugador ${newPayment.idjugador}`);
      // Verificar si el jugador ahora tiene todos los meses necesarios pagados
      await updatePlayerState(connectionForUpdate, newPayment.idjugador);
      console.log(`[POST /payments] ✅ updatePlayerState completado para jugador ${newPayment.idjugador}`);
      
      // Obtener la categoría del jugador para actualizar su estado
      const [jugadorData] = await connectionForUpdate.query(
        'SELECT idcategoria FROM jugador WHERE idjugador = ?',
        [newPayment.idjugador]
      );
      const categoriasAfectadas = new Set();
      if (jugadorData.length > 0) {
        categoriasAfectadas.add(jugadorData[0].idcategoria);
      }
      
      // También actualizar el estado de los hermanos afectados
      if (siblings.length > 0) {
        console.log(`[POST /payments] 🔄 Actualizando estados de ${siblings.length} hermano(s)`);
        for (const sibling of siblings) {
          const hermanoId = sibling.idhermano;
          if (hermanoId && hermanoId !== newPayment.idjugador) {
            const [hermanoStatus] = await connectionForUpdate.query(
              'SELECT idestado, idcategoria FROM jugador WHERE idjugador = ?',
              [hermanoId]
            );
            // Solo actualizar si no está exonerado
            if (hermanoStatus.length > 0 && hermanoStatus[0].idestado !== 3) {
              console.log(`[POST /payments] 🔄 Llamando a updatePlayerState para hermano ${hermanoId}`);
              await updatePlayerState(connectionForUpdate, hermanoId);
              console.log(`[POST /payments] ✅ updatePlayerState completado para hermano ${hermanoId}`);
              categoriasAfectadas.add(hermanoStatus[0].idcategoria);
            }
          }
        }
      }
      
      // 6. Actualizar el estado de todas las categorías afectadas
      for (const categoriaId of categoriasAfectadas) {
        await updateCategoryState(connectionForUpdate, categoriaId);
      }
      
      connectionForUpdate.release();
      res.json({ 
        message: 'Pago agregado correctamente',
        hermanosAfectados: hermanosAfectados,
        idrecibo: reciboId // Retornar ID del recibo creado
      });
    } catch (updateError) {
      connectionForUpdate.release();
      console.error('Error actualizando estados después de crear recibo:', updateError);
      // Aún así responder éxito porque el recibo ya se creó correctamente
      res.json({ 
        message: 'Pago agregado correctamente (pero hubo un error al actualizar estados)',
        hermanosAfectados: hermanosAfectados,
        idrecibo: reciboId // Retornar ID del recibo creado
      });
    }
  } catch (error) {
    if (connection && !connection._released) {
      await connection.rollback();
      connection.release();
    }
    console.error('Error agregando pago:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

/**
 * Endpoint para actualizar los estados de todos los jugadores
 * Puede ser llamado manualmente o mediante un cron job diario
 * Actualiza el estado de cada jugador según sus pagos
 */
app.get('/update-player-states', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    // Obtener todos los jugadores de categorías activas (excepto exonerados)
    const [players] = await connection.query(`
      SELECT j.idjugador, j.idcategoria
      FROM jugador j
      LEFT JOIN categoria c ON j.idcategoria = c.idcategoria
      WHERE c.visible = 1 AND j.idestado != 3
    `);
    
    let jugadoresActualizados = 0;
    const categoriasAfectadas = new Set();
    
    // Actualizar el estado de cada jugador
    for (const player of players) {
      await updatePlayerState(connection, player.idjugador);
      categoriasAfectadas.add(player.idcategoria);
      jugadoresActualizados++;
    }
    
    // Actualizar el estado de todas las categorías afectadas
    let categoriasActualizadas = 0;
    for (const categoriaId of categoriasAfectadas) {
      await updateCategoryState(connection, categoriaId);
      categoriasActualizadas++;
    }
    
    res.json({ 
      message: 'Estados de jugadores y categorías actualizados correctamente',
      jugadoresActualizados: jugadoresActualizados,
      categoriasActualizadas: categoriasActualizadas
    });
  } catch (error) {
    console.error('Error actualizando estados de jugadores:', error);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    connection.release();
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
      WHERE r.monto > 0 
        AND r.anio = YEAR(CURDATE()) 
        AND c.visible = 1
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

// Endpoint para obtener el total recaudado en el mes actual (por fecha_recibo)
app.get('/paymentsMesActual', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        SUM(r.monto) as total
      FROM recibo r 
      JOIN jugador j ON r.idjugador = j.idjugador
      JOIN categoria c ON j.idcategoria = c.idcategoria
      WHERE r.monto > 0 
        AND c.visible = 1 
        AND r.visible = 1
        AND YEAR(r.fecha_recibo) = YEAR(CURDATE())
        AND MONTH(r.fecha_recibo) = MONTH(CURDATE())
    `);
    const total = rows[0]?.total || 0;
    res.json({ total: parseInt(total) });
  } catch (error) {
    console.error('Error obteniendo pagos del mes actual:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Endpoint para obtener cuotas del mes actual por categoría (por fecha_recibo)
app.get('/cuotasMesActualXcat', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        c.nombre_categoria as categoria,
        COUNT(DISTINCT r.idjugador) as jugadores_pagaron,
        SUM(r.monto) as total
      FROM recibo r 
      JOIN jugador j ON r.idjugador = j.idjugador
      JOIN categoria c ON j.idcategoria = c.idcategoria
      WHERE r.monto > 0 
        AND c.visible = 1 
        AND r.visible = 1
        AND YEAR(r.fecha_recibo) = YEAR(CURDATE())
        AND MONTH(r.fecha_recibo) = MONTH(CURDATE())
      GROUP BY c.nombre_categoria, c.idcategoria
      ORDER BY c.nombre_categoria
    `);
    res.json({ payments: rows });
  } catch (error) {
    console.error('Error obteniendo cuotas del mes actual por categoría:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Endpoint para obtener FC del mes actual por categoría (por fecha)
app.get('/fcMesActualXcat', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        c.nombre_categoria as categoria,
        COUNT(DISTINCT f.idjugador) as jugadores_pagaron
      FROM fondocampeonato f 
      JOIN jugador j ON f.idjugador = j.idjugador
      JOIN categoria c ON j.idcategoria = c.idcategoria
      WHERE f.monto > 0 
        AND c.visible = 1
        AND YEAR(f.fecha) = YEAR(CURDATE())
        AND MONTH(f.fecha) = MONTH(CURDATE())
      GROUP BY c.nombre_categoria, c.idcategoria
      ORDER BY c.nombre_categoria
    `);
    res.json({ payments: rows });
  } catch (error) {
    console.error('Error obteniendo FC del mes actual por categoría:', error);
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

// Endpoint para obtener jugadores únicos que pagaron cuotas del club en el año actual por categoría
app.get('/cuotasAnualesXcat', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        c.nombre_categoria as categoria,
        COUNT(DISTINCT r.idjugador) as jugadores_pagaron
      FROM recibo r 
      JOIN jugador j ON r.idjugador = j.idjugador
      JOIN categoria c ON j.idcategoria = c.idcategoria
      WHERE r.monto > 0 
        AND c.visible = 1 
        AND r.visible = 1
        AND r.anio = YEAR(CURDATE())
      GROUP BY c.nombre_categoria, c.idcategoria
      ORDER BY c.nombre_categoria
    `);
    res.json({ payments: rows });
  } catch (error) {
    console.error('Error obteniendo jugadores que pagaron cuotas anuales:', error);
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

// Endpoint para obtener jugadores únicos que pagaron FC en el año actual por categoría
app.get('/fcAnualesXcat', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        c.nombre_categoria as categoria,
        COUNT(DISTINCT f.idjugador) as jugadores_pagaron
      FROM fondocampeonato f 
      JOIN jugador j ON f.idjugador = j.idjugador
      JOIN categoria c ON j.idcategoria = c.idcategoria
      WHERE f.monto > 0 
        AND c.visible = 1
        AND f.anio = YEAR(CURDATE())
      GROUP BY c.nombre_categoria, c.idcategoria
      ORDER BY c.nombre_categoria
    `);
    res.json({ payments: rows });
  } catch (error) {
    console.error('Error obteniendo jugadores que pagaron FC anual:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.get('/fc', async (req, res) => {
  try {
    const { playerId, year } = req.query;
    let query = `
      SELECT f.*, 
      j.nombre as nombre_jugador,
      j.apellido as apellido_jugador,
      u.nombre as nombre_usuario
      FROM fondocampeonato f 
      JOIN jugador j ON f.idjugador = j.idjugador
      JOIN usuario u ON f.idusuario = u.id_usuario
      JOIN categoria c ON j.idcategoria = c.idcategoria
      WHERE monto > 0
      AND c.visible = 1
    `;
    
    const params = [];
    
    // Filtrar por jugador si se proporciona playerId
    if (playerId) {
      query += ` AND f.idjugador = ?`;
      params.push(playerId);
    }
    
    // Filtrar por año si se proporciona year
    if (year) {
      query += ` AND f.anio = ?`;
      params.push(year);
    }
    
    query += ` ORDER BY f.id_fondo DESC`;
    
    const [rows] = await db.query(query, params);
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
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Validar que el jugador existe y pertenece a una categoría activa (visible = 1)
    const [playerStatus] = await connection.query(
      `SELECT j.idestado, c.visible 
       FROM jugador j 
       LEFT JOIN categoria c ON j.idcategoria = c.idcategoria 
       WHERE j.idjugador = ?`, 
      [newPayment.idjugador]
    );
    
    if (playerStatus.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }
    
    if (!playerStatus[0].visible || playerStatus[0].visible !== 1) {
      await connection.rollback();
      return res.status(400).json({ error: 'El jugador debe pertenecer a una categoría activa' });
    }
    
    // NOTA: Los jugadores exonerados (estado=3) SÍ deben pagar fondo de campeonato
    // La exoneración solo aplica a la cuota del club, no al fondo de campeonato
    
    // Validar que no se duplique la cuota para el mismo año
    const currentYear = newPayment.anio || new Date().getFullYear();
    const cuota = newPayment.cuota_paga || 1;
    
    const [existingPayment] = await connection.query(
      'SELECT id_fondo FROM fondocampeonato WHERE idjugador = ? AND anio = ? AND cuota_paga = ?',
      [newPayment.idjugador, currentYear, cuota]
    );
    
    if (existingPayment.length > 0) {
      await connection.rollback();
      return res.status(400).json({ error: `Este jugador ya tiene la cuota ${cuota}/2 pagada para el año ${currentYear}` });
    }
    
    // Validar que el jugador no tenga ya las 2 cuotas pagadas
    const [allQuotas] = await connection.query(
      'SELECT COUNT(*) as total FROM fondocampeonato WHERE idjugador = ? AND anio = ?',
      [newPayment.idjugador, currentYear]
    );
    
    if (allQuotas[0].total >= 2) {
      await connection.rollback();
      return res.status(400).json({ error: `Este jugador ya tiene las 2 cuotas pagadas para el año ${currentYear}` });
    }
    
    // Normalizar datos
    const paymentData = {
      ...newPayment,
      anio: currentYear,
      fecha: newPayment.fecha || new Date().toISOString().split('T')[0],
      cuota_paga: cuota,
    };
    
    // Generar número de recibo si no viene
    if (!paymentData.numero) {
      const [maxNum] = await connection.query('SELECT MAX(numero) as maxNum FROM fondocampeonato');
      paymentData.numero = (maxNum[0]?.maxNum || 0) + 1;
    }
    
    const [insertResult] = await connection.query('INSERT INTO fondocampeonato SET ?', paymentData);
    const idFondo = insertResult.insertId; // ID del recibo creado
    await connection.commit();
    res.json({ 
      message: 'Pago agregado correctamente',
      id_fondo: idFondo // Retornar ID del recibo creado
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error agregando pago:', error);
    res.status(500).json({ error: 'Error del servidor', details: error.message });
  } finally {
    connection.release();
  }
});

// Endpoint para pagar MÚLTIPLES cuotas de fondo de campeonato (1 o 2 cuotas juntas)
app.post('/fc/multiple', async (req, res) => {
  const { idjugador, monto, cuotas, anio, observaciones, idusuario } = req.body;
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Validar que el jugador existe y pertenece a una categoría activa (visible = 1)
    const [playerStatus] = await connection.query(
      `SELECT j.idestado, c.visible 
       FROM jugador j 
       LEFT JOIN categoria c ON j.idcategoria = c.idcategoria 
       WHERE j.idjugador = ?`, 
      [idjugador]
    );
    
    if (playerStatus.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }
    
    if (!playerStatus[0].visible || playerStatus[0].visible !== 1) {
      await connection.rollback();
      return res.status(400).json({ error: 'El jugador debe pertenecer a una categoría activa' });
    }
    
    // Validar que cuotas sea un array válido
    if (!Array.isArray(cuotas) || cuotas.length === 0 || cuotas.length > 2) {
      await connection.rollback();
      return res.status(400).json({ error: 'Debes especificar entre 1 y 2 cuotas a pagar' });
    }
    
    const currentYear = anio || new Date().getFullYear();
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Verificar que las cuotas no estén ya pagadas
    for (const cuota of cuotas) {
      const [existingPayment] = await connection.query(
        'SELECT id_fondo FROM fondocampeonato WHERE idjugador = ? AND anio = ? AND cuota_paga = ?',
        [idjugador, currentYear, cuota]
      );
      
      if (existingPayment.length > 0) {
        await connection.rollback();
        return res.status(400).json({ error: `La cuota ${cuota}/2 ya está pagada para el año ${currentYear}` });
      }
    }
    
    // Obtener el número máximo actual de recibo
    const [maxNum] = await connection.query('SELECT MAX(numero) as maxNum FROM fondocampeonato');
    let numeroRecibo = (maxNum[0]?.maxNum || 0) + 1;
    
    // Calcular el monto por cuota
    const montoPorCuota = monto / cuotas.length;
    
    // Crear un recibo por cada cuota
    const recibosCreados = [];
    for (const cuota of cuotas) {
      const paymentData = {
        idjugador,
        monto: montoPorCuota,
        cuota_paga: cuota,
        anio: currentYear,
        fecha: currentDate,
        observaciones: observaciones || null,
        idusuario,
        numero: numeroRecibo,
      };
      
      const [insertResult] = await connection.query('INSERT INTO fondocampeonato SET ?', paymentData);
      recibosCreados.push({
        id_fondo: insertResult.insertId,
        cuota_paga: cuota
      });
      numeroRecibo++; // Incrementar para el siguiente recibo
    }
    
    await connection.commit();
    res.json({ 
      message: `${cuotas.length} recibo(s) de fondo de campeonato creado(s) correctamente`,
      cuotas_pagadas: cuotas,
      recibos: recibosCreados // Retornar IDs de los recibos creados
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creando recibos de FC múltiples:', error);
    res.status(500).json({ error: 'Error del servidor', details: error.message });
  } finally {
    connection.release();
  }
});

app.get('/fcXcuotas', async (req, res) => {
  try {
    const [rows] = await db.query(`
    SELECT
      c.nombre_categoria as categoria,
      SUM(CASE 
        WHEN r.cuota_paga = 1 THEN 
          -- Si hay 2 recibos con el mismo número y ambos tienen el mismo monto, dividir entre 2
          CASE 
            WHEN EXISTS (
              SELECT 1 FROM fondocampeonato r2 
              WHERE r2.idjugador = r.idjugador 
                AND r2.anio = r.anio 
                AND r2.numero = r.numero 
                AND r2.cuota_paga = 2 
                AND r2.monto = r.monto
            ) THEN r.monto / 2
            ELSE r.monto
          END
        ELSE 0 
      END) AS 'Total Cuota 1',
      SUM(CASE 
        WHEN r.cuota_paga = 2 THEN 
          -- Si hay 2 recibos con el mismo número y ambos tienen el mismo monto, dividir entre 2
          CASE 
            WHEN EXISTS (
              SELECT 1 FROM fondocampeonato r2 
              WHERE r2.idjugador = r.idjugador 
                AND r2.anio = r.anio 
                AND r2.numero = r.numero 
                AND r2.cuota_paga = 1 
                AND r2.monto = r.monto
            ) THEN r.monto / 2
            ELSE r.monto
          END
        ELSE 0 
      END) AS 'Total Cuota 2'
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
    ORDER BY
      c.idcategoria;
    `);
    res.json({ payments: rows });
  } catch (error) {
    console.error('Error obteniendo pagos:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Endpoint para contacto
app.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Todos los campos son requeridos' 
      });
    }

    const result = await sendEmail({ name, email, message });
    
    if (result.success) {
      res.json({ success: true, message: 'Correo enviado correctamente' });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Error al enviar el correo' 
      });
    }
  } catch (error) {
    console.error('Error en endpoint contact:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error del servidor' 
    });
  }
});

// Crear tabla valores si no existe
const createValoresTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS valores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cuota_club DECIMAL(10,2) NOT NULL,
        fondo_campeonato DECIMAL(10,2) NOT NULL,
        ano INT NOT NULL,
        meses_cuotas JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabla valores creada o verificada');
  } catch (error) {
    console.error('Error creando tabla valores:', error);
  }
};

// Crear tabla fixture si no existe (modificada para múltiples categorías)
const createFixtureTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS fixture (
        id INT AUTO_INCREMENT PRIMARY KEY,
        categoria_id INT NOT NULL,
        categoria_nombre VARCHAR(100) NOT NULL,
        proximo_partido JSON,
        ultimo_resultado JSON,
        horario VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (categoria_id) REFERENCES categoria(idcategoria)
      )
    `);

    // Verificar esquema: si faltan columnas nuevas, recrear tabla
    try {
      await db.query('SELECT categoria_id, categoria_nombre, proximo_partido, ultimo_resultado, horario FROM fixture LIMIT 1');
    } catch (schemaErr) {
      console.warn('Esquema antiguo detectado en tabla fixture. Recreando...');
      await db.query('DROP TABLE IF EXISTS fixture');
      await db.query(`
        CREATE TABLE fixture (
          id INT AUTO_INCREMENT PRIMARY KEY,
          categoria_id INT NOT NULL,
          categoria_nombre VARCHAR(100) NOT NULL,
          proximo_partido JSON,
          ultimo_resultado JSON,
          horario VARCHAR(20),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (categoria_id) REFERENCES categoria(idcategoria)
        )
      `);
    }
    console.log('Tabla fixture creada o verificada');
  } catch (error) {
    console.error('Error creando tabla fixture:', error);
  }
};


// Llamar a las funciones al iniciar
createValoresTable();
createFixtureTable();

// Insertar datos por defecto si no existen
const insertDefaultValores = async () => {
  try {
    const [existing] = await db.query('SELECT id FROM valores WHERE ano = ?', [new Date().getFullYear()]);
    if (existing.length === 0) {
      await db.query(`
        INSERT INTO valores (cuota_club, fondo_campeonato, ano, meses_cuotas) 
        VALUES (?, ?, ?, ?)
      `, [400, 800, new Date().getFullYear(), JSON.stringify([3, 4, 5, 6, 7, 8, 9, 10, 11])]);
      console.log('Datos por defecto insertados en valores');
    }
  } catch (error) {
    console.error('Error insertando datos por defecto:', error);
  }
};

// Llamar después de crear la tabla
setTimeout(insertDefaultValores, 1000);

// Endpoints para valores de cuotas y fondo de campeonato
// Obtener valores actuales (del año actual)
app.get('/valores', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const [valores] = await db.query('SELECT * FROM valores WHERE ano = ?', [currentYear]);
    if (valores.length > 0) {
      res.json({ valores: valores[0] });
    } else {
      // Si no hay valores para el año actual, obtener el más reciente
      const [latest] = await db.query('SELECT * FROM valores ORDER BY ano DESC LIMIT 1');
      res.json({ valores: latest[0] || null });
    }
  } catch (error) {
    console.error('Error fetching valores:', error);
    res.status(500).json({ error: 'Error al obtener valores' });
  }
});

// Obtener valores por año específico
app.get('/valores/:ano', async (req, res) => {
  try {
    const anoParam = req.params.ano;
    const ano = parseInt(anoParam, 10);
    
    // Validar que el año sea un número válido
    if (isNaN(ano) || anoParam === undefined || anoParam === null || anoParam === '') {
      console.error('❌ Año inválido recibido:', anoParam);
      return res.status(400).json({ error: 'Año inválido' });
    }
    
    console.log('📊 Buscando valores para año:', ano);
    const [valores] = await db.query('SELECT * FROM valores WHERE ano = ?', [ano]);
    
    if (valores.length > 0) {
      // Parsear meses_cuotas si es necesario
      const valor = valores[0];
      if (valor.meses_cuotas && typeof valor.meses_cuotas === 'string') {
        try {
          valor.meses_cuotas = JSON.parse(valor.meses_cuotas);
        } catch (e) {
          console.error('Error parsing meses_cuotas:', e);
          valor.meses_cuotas = [];
        }
      }
      res.json({ valores: valor });
    } else {
      // Si no hay valores para ese año, obtener el más cercano
      const [closest] = await db.query('SELECT * FROM valores WHERE ano <= ? ORDER BY ano DESC LIMIT 1', [ano]);
      if (closest.length > 0) {
        const valor = closest[0];
        if (valor.meses_cuotas && typeof valor.meses_cuotas === 'string') {
          try {
            valor.meses_cuotas = JSON.parse(valor.meses_cuotas);
          } catch (e) {
            valor.meses_cuotas = [];
          }
        }
        res.json({ valores: valor });
      } else {
        res.json({ valores: null });
      }
    }
  } catch (error) {
    console.error('❌ Error fetching valores por año:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Params recibidos:', req.params);
    res.status(500).json({ error: 'Error al obtener valores' });
  }
});

// Obtener todos los valores históricos
app.get('/valores/all', async (req, res) => {
  try {
    console.log('📊 Fetching valores históricos...');
    const [valores] = await db.query('SELECT * FROM valores ORDER BY ano DESC');
    console.log('📊 Valores obtenidos de BD:', valores.length, 'registros');
    
    // Parsear meses_cuotas si viene en diferentes formatos
    const valoresParsed = valores.map(v => {
      const valor = { ...v }; // Crear copia para no modificar el original
      try {
        if (valor.meses_cuotas !== null && valor.meses_cuotas !== undefined) {
          // Si es string, parsearlo
          if (typeof valor.meses_cuotas === 'string') {
            valor.meses_cuotas = JSON.parse(valor.meses_cuotas);
          }
          // Si es un objeto Buffer (MySQL JSON), convertirlo a string primero
          else if (Buffer.isBuffer(valor.meses_cuotas)) {
            valor.meses_cuotas = JSON.parse(valor.meses_cuotas.toString());
          }
          // Si ya es un array/objeto, dejarlo como está pero asegurar que es un array
          else if (Array.isArray(valor.meses_cuotas)) {
            // Ya es un array, está bien
          }
          else if (typeof valor.meses_cuotas === 'object') {
            // Si es un objeto pero no array, intentar convertirlo
            valor.meses_cuotas = Object.values(valor.meses_cuotas);
          }
        } else {
          // Si no existe, usar array vacío por defecto
          valor.meses_cuotas = [];
        }
        
        // Asegurar que meses_cuotas es siempre un array
        if (!Array.isArray(valor.meses_cuotas)) {
          console.warn('⚠️ meses_cuotas no es array para año', valor.ano, ', convirtiendo...');
          valor.meses_cuotas = [];
        }
      } catch (e) {
        console.error('❌ Error parsing meses_cuotas para año', valor.ano, ':', e.message);
        console.error('Valor recibido:', valor.meses_cuotas, 'Tipo:', typeof valor.meses_cuotas);
        // Si falla el parsing, usar array vacío
        valor.meses_cuotas = [];
      }
      return valor;
    });
    
    console.log('📊 Valores parseados:', valoresParsed.length);
    res.json({ valores: valoresParsed || [] });
  } catch (error) {
    console.error('❌ Error fetching all valores:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ error: 'Error al obtener valores históricos' });
  }
});

// Crear/actualizar valores
app.post('/valores', async (req, res) => {
  try {
    const { cuota_club, fondo_campeonato, ano, meses_cuotas } = req.body;
    
    // Verificar si ya existe un registro para este año
    const [existing] = await db.query('SELECT id FROM valores WHERE ano = ?', [ano]);
    
    const mesesJson = JSON.stringify(meses_cuotas || []);
    
    if (existing.length > 0) {
      // Actualizar existente
      await db.query(
        'UPDATE valores SET cuota_club = ?, fondo_campeonato = ?, meses_cuotas = ? WHERE ano = ?',
        [cuota_club, fondo_campeonato, mesesJson, ano]
      );
    } else {
      // Crear nuevo
      await db.query(
        'INSERT INTO valores (cuota_club, fondo_campeonato, ano, meses_cuotas) VALUES (?, ?, ?, ?)',
        [cuota_club, fondo_campeonato, ano, mesesJson]
      );
    }
    
    res.json({ success: true, message: 'Valores actualizados correctamente' });
  } catch (error) {
    console.error('Error updating valores:', error);
    res.status(500).json({ error: 'Error al actualizar valores' });
  }
});

// Endpoints para fixture
// Obtener datos del fixture para todas las categorías
app.get('/fixture', async (req, res) => {
  try {
    const [fixture] = await db.query(`
      SELECT f.*, c.nombre_categoria 
      FROM fixture f 
      LEFT JOIN categoria c ON f.categoria_id = c.idcategoria 
      ORDER BY CASE c.nombre_categoria
        WHEN 'ABEJAS' THEN 1
        WHEN 'GRILLOS' THEN 2
        WHEN 'CHATAS' THEN 3
        WHEN 'CHURRINCHES' THEN 4
        WHEN 'GORRIONES' THEN 5
        WHEN 'SEMILLAS' THEN 6
        WHEN 'CEBOLLAS' THEN 7
        WHEN 'BABYS' THEN 8
        WHEN 'SUB9' THEN 9
        WHEN 'SUB11' THEN 10
        WHEN 'SUB13' THEN 11
        ELSE 99
      END
    `);
    res.json({ fixture });
  } catch (error) {
    console.error('Error fetching fixture:', error);
    res.status(500).json({ error: 'Error al obtener fixture' });
  }
});

// Obtener categorías para el fixture
app.get('/fixture/categorias', async (req, res) => {
  try {
    const [categorias] = await db.query(`
      SELECT idcategoria, nombre_categoria 
      FROM categoria 
      WHERE visible = 1 AND nombre_categoria != 'SIN FICHAR'
      ORDER BY CASE nombre_categoria
        WHEN 'ABEJAS' THEN 1
        WHEN 'GRILLOS' THEN 2
        WHEN 'CHATAS' THEN 3
        WHEN 'CHURRINCHES' THEN 4
        WHEN 'GORRIONES' THEN 5
        WHEN 'SEMILLAS' THEN 6
        WHEN 'CEBOLLAS' THEN 7
        WHEN 'BABYS' THEN 8
        WHEN 'SUB9' THEN 9
        WHEN 'SUB11' THEN 10
        WHEN 'SUB13' THEN 11
        ELSE 99
      END
    `);
    res.json({ categorias });
  } catch (error) {
    console.error('Error fetching categorias:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// Actualizar fixture para una categoría específica
app.post('/fixture', async (req, res) => {
  try {
    const { categoria_id, categoria_nombre, proximo_partido, ultimo_resultado } = req.body;
    
    // Verificar si ya existe un registro para esta categoría
    const [existing] = await db.query('SELECT id FROM fixture WHERE categoria_id = ?', [categoria_id]);
    
    const proximoJson = JSON.stringify(proximo_partido || {});
    const ultimoJson = JSON.stringify(ultimo_resultado || {});
    
    if (existing.length > 0) {
      // Actualizar existente
      await db.query(
        'UPDATE fixture SET categoria_nombre = ?, proximo_partido = ?, ultimo_resultado = ? WHERE categoria_id = ?',
        [categoria_nombre, proximoJson, ultimoJson, categoria_id]
      );
    } else {
      // Crear nuevo
      await db.query(
        'INSERT INTO fixture (categoria_id, categoria_nombre, proximo_partido, ultimo_resultado) VALUES (?, ?, ?, ?)',
        [categoria_id, categoria_nombre, proximoJson, ultimoJson]
      );
    }
    
    res.json({ success: true, message: 'Fixture actualizado correctamente' });
  } catch (error) {
    console.error('Error updating fixture:', error);
    res.status(500).json({ error: 'Error al actualizar fixture' });
  }
});

// Actualizar fixture para múltiples categorías
app.post('/fixture/bulk', async (req, res) => {
  try {
    const { fixtures } = req.body; // Array de fixtures
    
    if (!fixtures || !Array.isArray(fixtures)) {
      return res.status(400).json({ error: 'Datos de fixtures inválidos' });
    }
    
    console.log('Updating fixtures:', fixtures.length, 'fixtures received');
    
    // Procesar cada fixture individualmente con UPSERT
    for (const fixture of fixtures) {
      const { categoria_id, categoria_nombre, proximo_partido, ultimo_resultado } = fixture;
      
      // Validar datos básicos
      if (!categoria_id || !categoria_nombre) {
        console.warn('Fixture sin categoria_id o categoria_nombre:', fixture);
        continue; // Saltar este fixture
      }
      
      const proximoJson = JSON.stringify(proximo_partido || {});
      const ultimoJson = JSON.stringify(ultimo_resultado || {});
      
      // Verificar si existe
      const [existing] = await db.query('SELECT id FROM fixture WHERE categoria_id = ?', [categoria_id]);
      
      if (existing.length > 0) {
        // Actualizar existente
        await db.query(
          'UPDATE fixture SET categoria_nombre = ?, proximo_partido = ?, ultimo_resultado = ? WHERE categoria_id = ?',
          [categoria_nombre, proximoJson, ultimoJson, categoria_id]
        );
        console.log('Updated fixture for:', categoria_nombre);
      } else {
        // Insertar nuevo
        await db.query(
          'INSERT INTO fixture (categoria_id, categoria_nombre, proximo_partido, ultimo_resultado) VALUES (?, ?, ?, ?)',
          [categoria_id, categoria_nombre, proximoJson, ultimoJson]
        );
        console.log('Inserted new fixture for:', categoria_nombre);
      }
    }
    
    res.json({ success: true, message: 'Fixtures actualizados correctamente' });
  } catch (error) {
    console.error('Error updating fixtures:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Error al actualizar fixtures', details: error.message });
  }
});

// Endpoint para cumpleaños del día
app.get('/cumples', async (req, res) => {
  try {
    // Usar CURDATE() de MySQL que ya está en UTC-3
    // Esto asegura que usamos la fecha correcta del servidor
    const [cumples] = await db.query(`
      SELECT 
        j.nombre, 
        j.apellido, 
        j.fecha_nacimiento, 
        c.nombre_categoria as categoria
      FROM jugador j
      INNER JOIN categoria c ON j.idcategoria = c.idcategoria
      WHERE MONTH(j.fecha_nacimiento) = MONTH(CURDATE())
        AND DAY(j.fecha_nacimiento) = DAY(CURDATE())
        AND c.visible = 1
      ORDER BY j.nombre, j.apellido
    `);
    
    console.log('🎂 Checking birthdays for:', new Date().toISOString());
    console.log('🎂 MySQL CURDATE() used for date comparison');
    console.log('🎂 Query result:', cumples);
    console.log('🎂 Number of birthdays found:', cumples.length);
    
    if (cumples.length > 0) {
      cumples.forEach((kid, index) => {
        console.log(`🎂 ${index + 1}. ${kid.nombre} ${kid.apellido} - ${kid.categoria}`);
      });
    }
    
    res.json({ cumples: cumples || [] });
  } catch (error) {
    console.error('❌ Error fetching cumples:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ error: 'Error al obtener cumpleaños' });
  }
});

// Configurar cron job para actualizar estados automáticamente
// Se ejecuta el día 11 de cada mes a las 00:05
cron.schedule('5 0 11 * *', async () => {
  console.log('🔄 [CRON] Iniciando actualización automática de estados de jugadores...');
  const connection = await db.getConnection();
  
  try {
    // Obtener todos los jugadores de categorías activas (excepto exonerados)
    const [players] = await connection.query(`
      SELECT j.idjugador, j.idcategoria
      FROM jugador j
      LEFT JOIN categoria c ON j.idcategoria = c.idcategoria
      WHERE c.visible = 1 AND j.idestado != 3
    `);
    
    let jugadoresActualizados = 0;
    const categoriasAfectadas = new Set();
    
    // Actualizar el estado de cada jugador
    for (const player of players) {
      await updatePlayerState(connection, player.idjugador);
      categoriasAfectadas.add(player.idcategoria);
      jugadoresActualizados++;
    }
    
    // Actualizar el estado de todas las categorías afectadas
    let categoriasActualizadas = 0;
    for (const categoriaId of categoriasAfectadas) {
      await updateCategoryState(connection, categoriaId);
      categoriasActualizadas++;
    }
    
    console.log(`✅ [CRON] Actualización completa: ${jugadoresActualizados} jugadores, ${categoriasActualizadas} categorías`);
  } catch (error) {
    console.error('❌ [CRON] Error actualizando estados:', error);
  } finally {
    connection.release();
  }
}, {
  timezone: "America/Montevideo" // UTC-3 (Uruguay)
});

// Endpoint para generar PDF del comprobante de recibo de cuota (puede recibir múltiples IDs separados por coma)
app.get('/comprobante/recibo/:idrecibo', async (req, res) => {
  try {
    const { idrecibo } = req.params;
    const idsArray = idrecibo.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    
    // Obtener datos de todos los recibos con información del jugador y categoría
    const placeholders = idsArray.map(() => '?').join(',');
    const [recibos] = await db.query(`
      SELECT 
        r.*,
        j.nombre as jugador_nombre,
        j.apellido as jugador_apellido,
        c.nombre_categoria
      FROM recibo r
      INNER JOIN jugador j ON r.idjugador = j.idjugador
      INNER JOIN categoria c ON j.idcategoria = c.idcategoria
      WHERE r.idrecibo IN (${placeholders})
      ORDER BY r.anio ASC, r.mes_pago ASC
    `, idsArray);
    
    if (recibos.length === 0) {
      return res.status(404).json({ error: 'Recibo no encontrado' });
    }
    
    // Filtrar solo recibos principales (monto > 0)
    const recibosPrincipalesFinal = recibos.filter(r => parseFloat(r.monto) > 0);
    
    if (recibosPrincipalesFinal.length === 0) {
      return res.status(404).json({ error: 'No se encontraron recibos válidos' });
    }
    
    // Calcular total
    const total = recibosPrincipalesFinal.reduce((sum, r) => sum + parseFloat(r.monto), 0);
    
    // Calcular período (mes inicial y final)
    const meses = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const primerRecibo = recibosPrincipalesFinal[0];
    const ultimoRecibo = recibosPrincipalesFinal[recibosPrincipalesFinal.length - 1];
    
    let periodoTexto = '';
    if (recibosPrincipalesFinal.length === 1) {
      // Un solo mes
      periodoTexto = `${meses[primerRecibo.mes_pago]} ${primerRecibo.anio}`;
    } else {
      // Múltiples meses - mostrar rango
      const mesInicial = meses[primerRecibo.mes_pago];
      const mesFinal = meses[ultimoRecibo.mes_pago];
      const anioInicial = primerRecibo.anio;
      const anioFinal = ultimoRecibo.anio;
      
      if (anioInicial === anioFinal) {
        periodoTexto = `${mesInicial} - ${mesFinal} ${anioInicial}`;
      } else {
        periodoTexto = `${mesInicial} ${anioInicial} - ${mesFinal} ${anioFinal}`;
      }
    }
    
    // Verificar si hay hermanos y obtener sus nombres
    // Buscar hermanos consultando la tabla hermanos directamente con el jugador principal
    const idJugadorPrincipal = primerRecibo.idjugador;
    let nombresHermanos = [];
    let tieneHermanos = false;
    
    // Buscar hermanos en la tabla hermanos
    const [hermanosRows] = await db.query(`
      SELECT DISTINCT 
        CASE 
          WHEN idjugador = ? THEN idhermano 
          ELSE idjugador 
        END as idhermano
      FROM hermanos 
      WHERE idjugador = ? OR idhermano = ?
    `, [idJugadorPrincipal, idJugadorPrincipal, idJugadorPrincipal]);
    
    if (hermanosRows.length > 0) {
      tieneHermanos = true;
      const hermanosIds = hermanosRows.map(h => h.idhermano).filter(id => id !== idJugadorPrincipal);
      
      if (hermanosIds.length > 0) {
        const hermanosPlaceholders = hermanosIds.map(() => '?').join(',');
        const [hermanosData] = await db.query(`
          SELECT j.nombre, j.apellido, c.nombre_categoria
          FROM jugador j
          INNER JOIN categoria c ON j.idcategoria = c.idcategoria
          WHERE j.idjugador IN (${hermanosPlaceholders})
          ORDER BY j.apellido, j.nombre
        `, hermanosIds);
        
        nombresHermanos = hermanosData.map(h => `${h.apellido}, ${h.nombre} - ${h.nombre_categoria}`);
      }
    }
    
    // Crear PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    // Configurar headers para PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="comprobante_recibo_${recibos[0].numero}.pdf"`);
    
    // Pipe PDF a response
    doc.pipe(res);
    
    // Cargar logo (logo_chico.png) - buscar en múltiples ubicaciones
    let logoHeight = 0;
    const possiblePaths = [
      path.join(__dirname, '../yerbalito/src/assets/logo_chico.png'),
      path.join(__dirname, '../../yerbalito/src/assets/logo_chico.png'),
      path.join(__dirname, '../uploads/logo_chico.png'),
      path.join(__dirname, '../../uploads/logo_chico.png'),
      path.join(__dirname, './uploads/logo_chico.png'),
      path.join(__dirname, '../src/assets/logo_chico.png'),
    ];
    
    let logoPath = null;
    for (const testPath of possiblePaths) {
      try {
        if (fs.existsSync(testPath)) {
          logoPath = testPath;
          console.log('Logo encontrado en:', logoPath);
          break;
        }
      } catch (e) {
        // Continuar con siguiente ruta
      }
    }
    
    if (logoPath) {
      try {
        const logoWidth = 100;
        const logoX = (doc.page.width - logoWidth) / 2; // Centrar horizontalmente
        const logoY = 50;
        doc.image(logoPath, logoX, logoY, { width: logoWidth });
        logoHeight = 100;
        console.log('Logo cargado correctamente');
      } catch (logoError) {
        console.error('Error cargando logo:', logoError.message);
      }
    } else {
      console.log('Logo no encontrado en ninguna de las rutas:', possiblePaths);
    }
    
    // Asegurar que el título esté claramente DESPUÉS del logo con más espacio
    const startY = logoHeight > 0 ? logoHeight + 90 : 50; // Aumentado de 70 a 90 para más espacio
    doc.y = startY;
    
    // Contenido del PDF - Nombre del club DESPUÉS del logo
    doc.fontSize(20).text('CLUB YERBALITO', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text('COMPROBANTE DE PAGO', { align: 'center' });
    doc.moveDown(2);
    
    doc.fontSize(12);
    doc.text(`Número de Recibo: ${primerRecibo.numero} | Fecha: ${new Date(primerRecibo.fecha_recibo).toLocaleDateString('es-UY')}`, { continued: false });
    doc.moveDown();
    
    doc.text(`Jugador: ${primerRecibo.jugador_apellido}, ${primerRecibo.jugador_nombre} - ${primerRecibo.nombre_categoria}`, { continued: false });
    doc.moveDown();
    
    // Mostrar período y total
    doc.fontSize(12).text(`Período: ${periodoTexto}`, { continued: false });
    doc.moveDown();
    
    // Mencionar hermanos si hay
    if (tieneHermanos && nombresHermanos.length > 0) {
      doc.fontSize(11)
        .text(`Este pago también afecta a los siguientes hermanos:`, {
          continued: false,
          color: '#666666'
        });
      doc.moveDown(0.5);
      
      nombresHermanos.forEach((nombre, index) => {
        doc.fontSize(10)
          .font('Helvetica')
          .text(`• ${nombre}`, {
            continued: false,
            color: '#666666',
            indent: 20
          });
      });
      doc.moveDown();
    } else if (tieneHermanos) {
      doc.fontSize(11)
        .font('Helvetica')
        .text(`Este pago también afecta a los hermanos del jugador.`, {
          continued: false,
          color: '#666666'
        });
      doc.moveDown();
    }
    
    doc.fontSize(16).font('Helvetica-Bold').text(`TOTAL: $${total.toFixed(2)}`, { continued: false });
    doc.moveDown(2);
    
    if (primerRecibo.observacionesRecibo) {
      doc.fontSize(10).font('Helvetica').text(`Observaciones: ${primerRecibo.observacionesRecibo}`, { continued: false });
      doc.moveDown();
    }
    
    // Texto pequeño debajo de observaciones
    doc.fontSize(8)
      .font('Helvetica')
      .fillColor('#666666')
      .text('Este es un comprobante de pago de cuota del club. Conserve este documento para sus registros.', {
        continued: false
      });
    
    // Mover hacia abajo y poner el footer en la misma página
    doc.moveDown(2);
    
    // Footer solo con olimarteam.uy - a la derecha, en la misma página
    const pageWidth = doc.page.width;
    const rightMargin = 50;
    
    doc.fontSize(8)
      .font('Helvetica')
      .fillColor('#666666');
    
    const footerText = 'olimarteam.uy';
    const textWidth = doc.widthOfString(footerText);
    const footerX = pageWidth - textWidth - rightMargin;
    
    // Usar la posición Y actual (doc.y) para asegurar que esté en la misma página
    doc.text(footerText, footerX, doc.y, {
      link: 'https://olimarteam.uy',
      underline: false
    });
    
    doc.end();
  } catch (error) {
    console.error('Error generando PDF de comprobante:', error);
    res.status(500).json({ error: 'Error al generar comprobante' });
  }
});

// Endpoint para generar PDF del comprobante de fondo de campeonato
app.get('/comprobante/fc/:id_fondo', async (req, res) => {
  try {
    const { id_fondo } = req.params;
    
    // Obtener datos del recibo con información del jugador y categoría
    const [recibos] = await db.query(`
      SELECT 
        f.*,
        j.nombre as jugador_nombre,
        j.apellido as jugador_apellido,
        c.nombre_categoria
      FROM fondocampeonato f
      INNER JOIN jugador j ON f.idjugador = j.idjugador
      INNER JOIN categoria c ON j.idcategoria = c.idcategoria
      WHERE f.id_fondo = ?
    `, [id_fondo]);
    
    if (recibos.length === 0) {
      return res.status(404).json({ error: 'Recibo no encontrado' });
    }
    
    const recibo = recibos[0];
    
    // Crear PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    // Configurar headers para PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="comprobante_fc_${recibo.numero}.pdf"`);
    
    // Pipe PDF a response
    doc.pipe(res);
    
    // Cargar logo (logo_chico.png) - buscar en múltiples ubicaciones
    let logoHeight = 0;
    const possiblePaths = [
      path.join(__dirname, '../yerbalito/src/assets/logo_chico.png'),
      path.join(__dirname, '../../yerbalito/src/assets/logo_chico.png'),
      path.join(__dirname, '../uploads/logo_chico.png'),
      path.join(__dirname, '../../uploads/logo_chico.png'),
      path.join(__dirname, './uploads/logo_chico.png'),
      path.join(__dirname, '../src/assets/logo_chico.png'),
    ];
    
    let logoPath = null;
    for (const testPath of possiblePaths) {
      try {
        if (fs.existsSync(testPath)) {
          logoPath = testPath;
          console.log('Logo encontrado en:', logoPath);
          break;
        }
      } catch (e) {
        // Continuar con siguiente ruta
      }
    }
    
    if (logoPath) {
      try {
        const logoWidth = 100;
        const logoX = (doc.page.width - logoWidth) / 2; // Centrar horizontalmente
        const logoY = 50;
        doc.image(logoPath, logoX, logoY, { width: logoWidth });
        logoHeight = 100;
        console.log('Logo cargado correctamente');
      } catch (logoError) {
        console.error('Error cargando logo:', logoError.message);
      }
    } else {
      console.log('Logo no encontrado en ninguna de las rutas:', possiblePaths);
    }
    
    // Asegurar que el título esté claramente DESPUÉS del logo con más espacio
    const startY = logoHeight > 0 ? logoHeight + 90 : 50; // Aumentado de 70 a 90 para más espacio
    doc.y = startY;
    
    // Contenido del PDF - Nombre del club DESPUÉS del logo
    doc.fontSize(20).text('CLUB YERBALITO', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text('COMPROBANTE DE PAGO', { align: 'center' });
    doc.fontSize(14).text('FONDO DE CAMPEONATO', { align: 'center' });
    doc.moveDown(2);
    
    doc.fontSize(12);
    doc.text(`Número de Recibo: ${recibo.numero} | Fecha: ${new Date(recibo.fecha).toLocaleDateString('es-UY')}`, { continued: false });
    doc.moveDown();
    
    doc.text(`Jugador: ${recibo.jugador_apellido}, ${recibo.jugador_nombre}`, { continued: false });
    doc.text(`Categoría: ${recibo.nombre_categoria}`, { continued: false });
    doc.text(`Año: ${recibo.anio}`, { continued: false });
    doc.text(`Cuota: ${recibo.cuota_paga}/2`, { continued: false });
    doc.moveDown();
    
    doc.fontSize(14).font('Helvetica-Bold').text(`Monto: $${parseFloat(recibo.monto).toFixed(2)}`, { continued: false });
    doc.moveDown(2);
    
    if (recibo.observaciones) {
      doc.fontSize(10).font('Helvetica').text(`Observaciones: ${recibo.observaciones}`, { continued: false });
      doc.moveDown();
    }
    
    // Texto pequeño debajo de observaciones
    doc.fontSize(8)
      .font('Helvetica')
      .fillColor('#666666')
      .text('Este es un comprobante de pago de fondo de campeonato. Conserve este documento para sus registros.', {
        continued: false
      });
    
    // Mover hacia abajo y poner el footer en la misma página
    doc.moveDown(2);
    
    // Footer solo con olimarteam.uy - a la derecha, en la misma página
    const pageWidth = doc.page.width;
    const rightMargin = 50;
    
    doc.fontSize(8)
      .font('Helvetica')
      .fillColor('#666666');
    
    const footerText = 'olimarteam.uy';
    const textWidth = doc.widthOfString(footerText);
    const footerX = pageWidth - textWidth - rightMargin;
    
    // Usar la posición Y actual (doc.y) para asegurar que esté en la misma página
    doc.text(footerText, footerX, doc.y, {
      link: 'https://olimarteam.uy',
      underline: false
    });
    
    doc.end();
  } catch (error) {
    console.error('Error generando PDF de comprobante FC:', error);
    res.status(500).json({ error: 'Error al generar comprobante' });
  }
});

// Endpoint para actualizar metodo_comprobante de un recibo
app.put('/comprobante/recibo/:idrecibo', async (req, res) => {
  try {
    const { idrecibo } = req.params;
    const { metodo_comprobante } = req.body;
    
    if (!metodo_comprobante || !['impresion', 'whatsapp'].includes(metodo_comprobante)) {
      return res.status(400).json({ error: 'Método de comprobante inválido' });
    }
    
    // Manejar múltiples idrecibo separados por comas
    const idrecibos = idrecibo.split(',').map(id => id.trim()).filter(id => id);
    
    // Verificar si el campo existe antes de actualizar
    try {
      const placeholders = idrecibos.map(() => '?').join(',');
      await db.query(
        `UPDATE recibo SET metodo_comprobante = ? WHERE idrecibo IN (${placeholders})`,
        [metodo_comprobante, ...idrecibos]
      );
      res.json({ message: 'Método de comprobante actualizado correctamente' });
    } catch (updateError) {
      // Si el campo no existe, simplemente no hacer nada y responder éxito
      if (updateError.code === 'ER_BAD_FIELD_ERROR') {
        console.log('Campo metodo_comprobante no existe en la tabla recibo. Se requiere ejecutar el SQL de migración.');
        res.json({ message: 'Método registrado (campo no disponible en BD)' });
      } else {
        throw updateError;
      }
    }
  } catch (error) {
    console.error('Error actualizando metodo_comprobante:', error);
    res.status(500).json({ error: 'Error al actualizar método de comprobante' });
  }
});

// Endpoint para actualizar metodo_comprobante de fondo de campeonato
app.put('/comprobante/fc/:id_fondo', async (req, res) => {
  try {
    const { id_fondo } = req.params;
    const { metodo_comprobante } = req.body;
    
    if (!metodo_comprobante || !['impresion', 'whatsapp'].includes(metodo_comprobante)) {
      return res.status(400).json({ error: 'Método de comprobante inválido' });
    }
    
    // Verificar si el campo existe antes de actualizar
    try {
      await db.query(
        'UPDATE fondocampeonato SET metodo_comprobante = ? WHERE id_fondo = ?',
        [metodo_comprobante, id_fondo]
      );
      res.json({ message: 'Método de comprobante actualizado correctamente' });
    } catch (updateError) {
      // Si el campo no existe, simplemente no hacer nada y responder éxito
      if (updateError.code === 'ER_BAD_FIELD_ERROR') {
        console.log('Campo metodo_comprobante no existe en la tabla fondocampeonato. Se requiere ejecutar el SQL de migración.');
        res.json({ message: 'Método registrado (campo no disponible en BD)' });
      } else {
        throw updateError;
      }
    }
  } catch (error) {
    console.error('Error actualizando metodo_comprobante FC:', error);
    res.status(500).json({ error: 'Error al actualizar método de comprobante' });
  }
});

console.log('⏰ Cron job configurado: actualización de estados el día 11 de cada mes a las 00:05 (Uruguay)');

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
