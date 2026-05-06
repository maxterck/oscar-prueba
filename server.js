const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;
const DATA_FILE = path.join(__dirname, 'products.json');

app.use(cors());
app.use(express.json());
// Servir archivos estáticos de la carpeta actual
app.use(express.static(__dirname));

// Leer productos
app.get('/api/products', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error al leer los productos' });
        }
        try {
            const products = JSON.parse(data);
            res.json(products);
        } catch (e) {
            res.status(500).json({ error: 'JSON inválido' });
        }
    });
});

// Guardar productos
app.post('/api/products', (req, res) => {
    const products = req.body;
    fs.writeFile(DATA_FILE, JSON.stringify(products, null, 4), 'utf8', (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error al guardar los productos' });
        }
        res.json({ message: 'Productos guardados exitosamente' });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
