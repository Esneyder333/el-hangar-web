
const mysql = require('mysql2');

const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'el_hangar'
});

conexion.connect((error) => {
    if (error) {
        console.log('Error al conectar con MySQL:', error.message);
        return;
    }

    console.log('Conexión a la base de datos El Hangar exitosa');
});

module.exports = conexion;
