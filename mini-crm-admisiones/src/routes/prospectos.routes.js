const express = require("express");
const router = express.Router();

const prospectosController =
    require("../controllers/prospectos.controller");

router.post("/", prospectosController.registrarProspecto);

router.patch("/:id/etapa", prospectosController.cambiarEtapa);

module.exports = router;