
const express = require("express");

const app = express();

const prospectosRoutes = require("./routes/prospectos.routes");

// Permitir recibir JSON
app.use(express.json());

// Ruta inicial
app.get("/", (req, res) => {
    res.json({
        mensaje: "Mini-CRM de admisiones con IA",
        estado: "Funcionando",
        version: "1.0.0"
    });
});

// Comprobar servidor
app.get("/api/health", (req, res) => {
    res.status(200).json({
        estado: "OK",
        mensaje: "El servidor funciona correctamente"
    });
});

// Rutas de prospectos
app.use("/prospectos", prospectosRoutes);

const embudoRoutes = require("./routes/embudo.routes");

app.use("/", embudoRoutes);

module.exports = app;
