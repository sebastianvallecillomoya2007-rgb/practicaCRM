
const express = require("express");
const router = express.Router();

const atencionService = require("../services/atencion.service");

// Consultar información de atención
router.get("/atencion", (req, res) => {
    try {
        const resultado = atencionService.obtenerAtencion();

        res.status(200).json({
            success: true,
            mensaje: "Información de atención obtenida correctamente",
            datos: resultado
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener información de atención",
            error: error.message
        });
    }
});

module.exports = router;
