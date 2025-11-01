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
    const [rows] = await db.query(`
      SELECT j.*, c.nombre_categoria 
      FROM jugador j 
      LEFT JOIN categoria c ON j.idcategoria = c.idcategoria 
      WHERE c.visible = 1
      ORDER BY j.idcategoria, j.nombre
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
    
    // Eliminar todas las relaciones de hermanos existentes
    await db.query('DELETE FROM hermanos WHERE idjugador = ?', [playerId]);
    await db.query('DELETE FROM hermanos WHERE idhermano = ?', [playerId]);
    
    // Si hay hermanos nuevos, insertarlos
    if (hermanos && hermanos.trim() !== '') {
      const hermanosIds = hermanos.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id) && id > 0);
      
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
      WHERE monto > 0
      AND c.visible = 1
      AND r.visible = 1
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
    
    // Obtener configuración de meses habilitados
    const [valores] = await connection.query('SELECT meses_cuotas FROM valores ORDER BY idvalores DESC LIMIT 1');
    const mesesHabilitados = valores.length > 0 && valores[0].meses_cuotas ? valores[0].meses_cuotas : [1,2,3,4,5,6,7,8,9,10,11,12];
    
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
    while (!mesesHabilitados.includes(mesVencido) && mesVencido > 0) {
      mesVencido--;
      if (mesVencido === 0) {
        mesVencido = 12;
        anioVencido--;
      }
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
    const [pagos] = await connection.query(
      `SELECT * FROM recibo 
       WHERE idjugador = ? 
       AND mes_pago = ? 
       AND anio = ? 
       AND visible = 1
       LIMIT 1`,
      [playerId, mesVencido, anioVencido]
    );
    
    const tieneMesVencidoPago = pagos.length > 0;
    
    // Determinar el nuevo estado
    let nuevoEstado = null;
    
    if (tieneMesVencidoPago) {
      // Tiene el mes vencido pagado, debe estar habilitado (estado=2)
      nuevoEstado = 2;
    } else {
      // No tiene el mes vencido pagado
      // Si ya pasó el día 10 del mes actual, debe estar deshabilitado (estado=1)
      if (currentDay > 10) {
        nuevoEstado = 1;
      } else {
        // Todavía está dentro del plazo de pago (días 1-10), mantener habilitado
        nuevoEstado = 2;
      }
    }
    
    // Actualizar el estado solo si cambió (y no es exonerado)
    await connection.query(
      'UPDATE jugador SET idestado = ? WHERE idjugador = ? AND idestado != 3',
      [nuevoEstado, playerId]
    );
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
    const newPayment = {
      ...paymentData,
      numero: numeroRecibo,
      mes_pago: paymentData.cuota_paga || paymentData.mes_pago, // Mapear cuota_paga a mes_pago
      anio: paymentData.anio || new Date().getFullYear(), // Asegurar año si no viene
      fecha_recibo: paymentData.fecha_recibo || new Date().toISOString().split('T')[0], // Fecha actual si no viene
      visible: paymentData.visible !== undefined ? paymentData.visible : 1, // Visible por defecto
    };
    // Eliminar cuota_paga si existe para evitar confusión
    delete newPayment.cuota_paga;
    
    // 1. Insertar el pago principal
    await connection.query('INSERT INTO recibo SET ?', newPayment);
    
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
              observaciones: `Pago automático por hermano (ID: ${newPayment.idjugador})${newPayment.observaciones ? ' - ' + newPayment.observaciones : ''}`
            };
            // Eliminar idrecibo si existe (es autoincremental)
            delete hermanoPayment.idrecibo;
            await connection.query('INSERT INTO recibo SET ?', hermanoPayment);
            hermanosAfectados++;
          }
        }
      }
    }
    
    // 4. Actualizar el estado del jugador y hermanos después de crear el recibo
    // Verificar si el jugador ahora tiene todos los meses necesarios pagados
    await updatePlayerState(connection, newPayment.idjugador);
    
    // Obtener la categoría del jugador para actualizar su estado
    const [jugadorData] = await connection.query(
      'SELECT idcategoria FROM jugador WHERE idjugador = ?',
      [newPayment.idjugador]
    );
    const categoriasAfectadas = new Set();
    if (jugadorData.length > 0) {
      categoriasAfectadas.add(jugadorData[0].idcategoria);
    }
    
    // También actualizar el estado de los hermanos afectados
    if (siblings.length > 0) {
      for (const sibling of siblings) {
        const hermanoId = sibling.idhermano;
        if (hermanoId && hermanoId !== newPayment.idjugador) {
          const [hermanoStatus] = await connection.query(
            'SELECT idestado, idcategoria FROM jugador WHERE idjugador = ?',
            [hermanoId]
          );
          // Solo actualizar si no está exonerado
          if (hermanoStatus.length > 0 && hermanoStatus[0].idestado !== 3) {
            await updatePlayerState(connection, hermanoId);
            categoriasAfectadas.add(hermanoStatus[0].idcategoria);
          }
        }
      }
    }
    
    // 5. Actualizar el estado de todas las categorías afectadas
    for (const categoriaId of categoriasAfectadas) {
      await updateCategoryState(connection, categoriaId);
    }
    
    await connection.commit();
    res.json({ 
      message: 'Pago agregado correctamente',
      hermanosAfectados: hermanosAfectados
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error agregando pago:', error);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    connection.release();
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
    
    await connection.query('INSERT INTO fondocampeonato SET ?', paymentData);
    await connection.commit();
    res.json({ message: 'Pago agregado correctamente' });
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
      
      await connection.query('INSERT INTO fondocampeonato SET ?', paymentData);
      numeroRecibo++; // Incrementar para el siguiente recibo
    }
    
    await connection.commit();
    res.json({ 
      message: `${cuotas.length} recibo(s) de fondo de campeonato creado(s) correctamente`,
      cuotas_pagadas: cuotas 
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
// Obtener valores actuales
app.get('/valores', async (req, res) => {
  try {
    const [valores] = await db.query('SELECT * FROM valores ORDER BY id DESC LIMIT 1');
    res.json({ valores: valores[0] || null });
  } catch (error) {
    console.error('Error fetching valores:', error);
    res.status(500).json({ error: 'Error al obtener valores' });
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
    // Usar fecha local de Uruguay (UTC-3)
    const now = new Date();
    const uruguayTime = new Date(now.getTime() - (3 * 60 * 60 * 1000)); // UTC-3
    const month = uruguayTime.getMonth() + 1; // getMonth() devuelve 0-11
    const day = uruguayTime.getDate();
    
    console.log('🎂 Checking birthdays for:', now.toISOString());
    console.log('🎂 Uruguay time:', uruguayTime.toISOString());
    console.log('🎂 Month:', month, 'Day:', day);
    
    const [cumples] = await db.query(`
      SELECT j.nombre, j.apellido, j.fecha_nacimiento, c.nombre_categoria as categoria
      FROM jugador j
      LEFT JOIN categoria c ON j.idcategoria = c.idcategoria
      WHERE MONTH(j.fecha_nacimiento) = ? 
        AND DAY(j.fecha_nacimiento) = ?
        AND c.visible = 1
      ORDER BY j.nombre
    `, [month, day]);
    
    console.log('🎂 Query result:', cumples);
    console.log('🎂 Number of birthdays found:', cumples.length);
    
    res.json({ cumples });
  } catch (error) {
    console.error('Error fetching cumples:', error);
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

console.log('⏰ Cron job configurado: actualización de estados el día 11 de cada mes a las 00:05 (Uruguay)');

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
