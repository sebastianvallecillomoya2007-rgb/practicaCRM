
const express = require("express");
const router = express.Router();

const prospectosService = require("../services/prospectos.service");

// Consultar métricas del embudo
router.get("/embudo", (req, res) => {
    try {
        const metricas = prospectosService.obtenerMetricas();

        res.status(200).json({
            success: true,
            mensaje: "Métricas del embudo obtenidas correctamente",
            datos: metricas
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener las métricas",
            error: error.message
        });
    }
});

module.exports = router;
