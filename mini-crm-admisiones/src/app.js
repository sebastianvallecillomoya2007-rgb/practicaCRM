
const express = require("express");
const path = require("path");

const app = express();

// Importar rutas
const prospectosRoutes = require("./routes/prospectos.routes");
const embudoRoutes = require("./routes/embudo.routes");
const atencionRoutes = require("./routes/atencion.routes");

// Permitir recibir JSON
app.use(express.json());

// Publicar los archivos HTML, CSS y JavaScript
app.use(express.static(path.join(__dirname, "../public")));

// Comprobar servidor
app.get("/api/health", (req, res) => {
    res.status(200).json({
        estado: "OK",
        mensaje: "El servidor funciona correctamente"
    });
});

// Rutas de prospectos
app.use("/prospectos", prospectosRoutes);

// Ruta del embudo
app.use("/", embudoRoutes);

// Ruta de atención
app.use("/", atencionRoutes);

module.exports = app;
