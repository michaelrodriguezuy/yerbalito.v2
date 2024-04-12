const mysql = require('mysql2/promise');

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'rjW63u0I6n',
            database: 'wwwolima_yerbalito'
        });

        console.log('Conexión exitosa a la base de datos MySQL.');

        // Realiza alguna consulta simple aquí para asegurarte de que la conexión funcione correctamente
        const [rows] = await connection.query('SELECT 1 + 1 AS result');
        console.log('Resultado de la consulta:', rows[0].result);

        // Cierra la conexión
        await connection.end();
    } catch (error) {
        console.error('Error al conectar a la base de datos MySQL:', error);
    }
}

testConnection();
