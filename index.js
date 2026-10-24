
const express = require('express');
const path = require('path');
const conexion = require('./config/db');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

// Consultar los productos de la base de datos
app.get('/api/productos', (req, res) => {
    conexion.query('SELECT * FROM productos', (error, resultados) => {
        if (error) {
            console.log('Error al consultar productos:', error.message);
            return res.status(500).json({ error: 'Error al consultar productos' });
        }

        res.json(resultados);
    });
});

app.post('/api/productos', (req, res) => {
    const { nombre, marca, tipo, precio, existencia } = req.body;

    if (!nombre || !marca || !tipo || precio === '' || existencia === '') {
        return res.status(400).json({
            error: 'Todos los campos son obligatorios'
        });
    }

    if (
        !Number.isFinite(Number(precio)) ||
        Number(precio) < 0 ||
        !Number.isInteger(Number(existencia)) ||
        Number(existencia) < 0
    ) {
        return res.status(400).json({
            error: 'Revisa el precio y la existencia'
        });
    }

    const sql = `
        INSERT INTO productos (nombre, marca, tipo, precio, existencia)
        VALUES (?, ?, ?, ?, ?)
    `;

    conexion.query(
        sql,
        [nombre.trim(), marca.trim(), tipo.trim(), Number(precio), Number(existencia)],
        (error, resultado) => {
            if (error) {
                console.log('Error al registrar producto:', error.message);
                return res.status(500).json({
                    error: 'No se pudo registrar el producto'
                });
            }

            res.status(201).json({
                mensaje: 'Producto registrado correctamente',
                id_producto: resultado.insertId
            });
        }
    );
});

app.delete('/api/productos/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'El ID del producto no es válido'
        });
    }

    conexion.query(
        'DELETE FROM productos WHERE id_producto = ?',
        [id],
        (error, resultado) => {
            if (error) {
                console.log('Error al eliminar producto:', error.message);
                return res.status(500).json({
                    error: 'No se pudo eliminar el producto'
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    error: 'El producto no existe'
                });
            }

            res.json({ mensaje: 'Producto eliminado correctamente' });
        }
    );
});
// Actualizar un producto
app.put('/api/productos/:id', (req, res) => {
    const id = Number(req.params.id);
    const { nombre, marca, tipo, precio, existencia } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'El ID no es válido' });
    }

    if (
        !nombre?.trim() ||
        !marca?.trim() ||
        !tipo?.trim() ||
        precio === '' ||
        existencia === ''
    ) {
        return res.status(400).json({
            error: 'Todos los campos son obligatorios'
        });
    }

    if (
        !Number.isFinite(Number(precio)) ||
        Number(precio) < 0 ||
        !Number.isInteger(Number(existencia)) ||
        Number(existencia) < 0
    ) {
        return res.status(400).json({
            error: 'Revisa el precio y la existencia'
        });
    }

    const sql = `
        UPDATE productos
        SET nombre = ?, marca = ?, tipo = ?, precio = ?, existencia = ?
        WHERE id_producto = ?
    `;

    conexion.query(
        sql,
        [
            nombre.trim(),
            marca.trim(),
            tipo.trim(),
            Number(precio),
            Number(existencia),
            id
        ],
        (error, resultado) => {
            if (error) {
                console.log('Error al actualizar producto:', error.message);
                return res.status(500).json({
                    error: 'No se pudo actualizar el producto'
                });
            }

            if (resultado.affectedRows === 0) {
                return conexion.query(
                    'SELECT id_producto FROM productos WHERE id_producto = ?',
                    [id],
                    (errorConsulta, filas) => {
                        if (errorConsulta) {
                            return res.status(500).json({
                                error: 'No se pudo verificar el producto'
                            });
                        }

                        if (filas.length === 0) {
                            return res.status(404).json({
                                error: 'Producto no encontrado'
                            });
                        }

                        res.json({
                            mensaje: 'Producto actualizado correctamente'
                        });
                    }
                );
            }

            res.json({
                mensaje: 'Producto actualizado correctamente'
            });
        }
    );
});
app.listen(PORT, () => {
    console.log(`Servidor de El Hangar activo en http://localhost:${PORT}`);
});
